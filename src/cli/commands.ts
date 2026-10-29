/**
 * The CLI commands. Each takes a {@link CliContext} (filesystem, registry, output, prompt and
 * installer are parameters), so tests run them against a temp directory with a recording
 * installer. Every command returns the process exit code.
 * @packageDocumentation
 */
import { extname, join, resolve } from "node:path";
import { sameContent, unifiedDiff } from "./diff";
import type { ProjectFs } from "./fs";
import type { Report } from "./json";
import {
  aliasToDirectory,
  PathError,
  type PathMapping,
  readPathMappings,
  resolveInsideReal,
} from "./paths";
import { detectPackageManager, installCommand, type PackageManager } from "./pm";
import {
  buildThemeCss,
  defaultConfig,
  detectProject,
  display,
  insertThemeImport,
  readConfig,
  readManifest,
  readViteSetup,
  serializeConfig,
  THEME_FILE,
  THEME_IMPORT_LINE,
  themePathFor,
} from "./project";
import type { RegistrySource } from "./registry-source";
import { dependentsOf, findItem, ResolveError, resolveItems } from "./resolve";
import { rewriteImports } from "./rewrite";
import {
  type BaseColor,
  type ComponentsConfig,
  isValidItemName,
  type RegistryFile,
  type RegistryItem,
  SchemaError,
} from "./schema";

/**
 * Everything a command needs from the outside world.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface CliContext {
  /** The project root: the directory the command was run in. */
  readonly cwd: string;
  readonly fs: ProjectFs;
  readonly registry: RegistrySource;
  /** Normal output, one call per line. */
  readonly out: (line: string) => void;
  /** Warnings and errors, one call per line. */
  readonly err: (line: string) => void;
  /** Asks a yes/no question. Resolves `false` when there is no terminal to ask on. */
  readonly confirm: (question: string) => Promise<boolean>;
  /**
   * The version `--version` prints: the version of the `@shadow-js/ui` package that is running.
   * Without it the registry's own version is printed.
   */
  readonly version?: string | undefined;
  /**
   * Installs packages with the given package manager (the real one spawns it). `output` says where the installer's own
   * output goes: `"inherit"` is this process's streams, `"stderr"` sends it all to stderr (a `--json` run keeps stdout
   * for the document).
   */
  readonly install: (request: {
    readonly cwd: string;
    readonly manager: PackageManager;
    readonly packages: readonly string[];
    readonly output: "inherit" | "stderr";
  }) => Promise<void>;
  /**
   * Present in a `--json` run: what the command records for the document (files, installs, next steps, warnings, the
   * failure), besides the words it prints. Absent otherwise.
   */
  readonly report?: Report | undefined;
}

/**
 * Flags shared by `init` and `add`.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface CommonFlags {
  /** Replace files that differ. Never implied by `yes`. */
  readonly overwrite: boolean;
  /** Print what would happen and change nothing. */
  readonly dryRun: boolean;
  /** Answer yes to confirmations (install packages, edit the stylesheet). */
  readonly yes: boolean;
  /** Do not install packages; print the command instead. */
  readonly skipInstall: boolean;
}

/**
 * Flags of `add`.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface AddFlags extends CommonFlags {
  /** Add every component in the registry. */
  readonly all: boolean;
  /** Directory (relative to the project) for `ui` components instead of the configured alias. */
  readonly path: string | undefined;
}

/**
 * Flags of `init`.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface InitFlags extends CommonFlags {
  readonly baseColor: BaseColor | undefined;
  /** The stylesheet that imports Tailwind, relative to the project. */
  readonly css: string | undefined;
}

/** Exit codes. */
const OK = 0;
const FAILED = 1;

/** What one file of an item would do. */
interface FilePlan {
  readonly item: RegistryItem;
  readonly file: RegistryFile;
  readonly target: string;
  readonly content: string;
  readonly current: string | undefined;
  readonly status: "create" | "unchanged" | "differs";
}

/** Prints an error and records it for `--json`. @returns The failing exit code. */
function problem(ctx: CliContext, code: string, message: string): number {
  ctx.err(`error: ${message}`);
  ctx.report?.fail(code, message);
  return FAILED;
}

/** Prints a warning and records it for `--json`. */
function caution(ctx: CliContext, code: string, message: string): void {
  ctx.err(`warning: ${message}`);
  ctx.report?.warn(code, message);
}

/** What a command did to a file, as `--json` names it. */
type FileAction = "create" | "update" | "unchanged" | "kept" | "overwrite" | "differs" | "skipped";

/** Records one file of the document's `files`. */
function recordFile(ctx: CliContext, path: string, action: FileAction, diff?: string): void {
  ctx.report?.push("files", diff === undefined ? { path, action } : { path, action, diff });
}

function failed(ctx: CliContext, error: unknown): number {
  if (error instanceof SchemaError || error instanceof ResolveError || error instanceof PathError) {
    return problem(ctx, error.code, error.message);
  }
  throw error;
}

function requireProject(ctx: CliContext): ReturnType<typeof readManifest> {
  const manifest = readManifest(ctx.fs, ctx.cwd);
  if (manifest === undefined) {
    problem(
      ctx,
      "SHADOW_UI_NO_PROJECT",
      "no package.json here. Run this command in the root of your project.",
    );
  }
  return manifest;
}

function requireConfig(ctx: CliContext): ComponentsConfig | undefined {
  const config = readConfig(ctx.fs, ctx.cwd);
  if (config === undefined) {
    problem(ctx, "SHADOW_UI_NO_CONFIG", "components.json not found. Run `shadow-ui init` first.");
  }
  return config;
}

/** The directory (absolute) an item's files go to. */
function directoryFor(
  item: RegistryItem,
  config: ComponentsConfig,
  mappings: readonly PathMapping[],
  ctx: CliContext,
  pathOverride: string | undefined,
): string {
  if (item.type === "ui" && pathOverride !== undefined) return resolve(ctx.cwd, pathOverride);
  if (item.type === "ui") return aliasToDirectory(config.aliases.ui, mappings);
  if (item.type === "hook") return aliasToDirectory(config.aliases.hooks, mappings);
  return aliasToDirectory(config.aliases.lib, mappings);
}

/** The absolute target of one registry file, checked to be inside the project. */
function targetFor(
  item: RegistryItem,
  file: RegistryFile,
  config: ComponentsConfig,
  mappings: readonly PathMapping[],
  ctx: CliContext,
  pathOverride: string | undefined,
): string {
  const base = file.path.slice(file.path.lastIndexOf("/") + 1);
  if (item.type === "lib" && item.name === "utils") {
    // `aliases.utils` names the module (`@/lib/utils`), so it also names the file.
    return resolveInsideReal(
      ctx.fs,
      ctx.cwd,
      `${aliasToDirectory(config.aliases.utils, mappings)}${extname(base)}`,
    );
  }
  return resolveInsideReal(
    ctx.fs,
    ctx.cwd,
    join(directoryFor(item, config, mappings, ctx, pathOverride), base),
  );
}

/**
 * Whether ui components written with `--path` need relative imports between them: they do when that directory is not the one the
 * `ui` alias names (the alias would point at a directory that does not hold them), or when the alias names no directory at all.
 */
function importsBetweenUiAreRelative(
  ctx: CliContext,
  config: ComponentsConfig,
  mappings: readonly PathMapping[],
  pathOverride: string | undefined,
): boolean {
  if (pathOverride === undefined) return false;
  try {
    return (
      resolve(aliasToDirectory(config.aliases.ui, mappings)) !== resolve(ctx.cwd, pathOverride)
    );
  } catch (error) {
    if (error instanceof PathError) return true;
    throw error;
  }
}

/** Builds the per-file plan for the items, reading what is on disk. */
function planFiles(
  ctx: CliContext,
  config: ComponentsConfig,
  items: readonly RegistryItem[],
  pathOverride: string | undefined,
  mappings: readonly PathMapping[] = readPathMappings(ctx.fs, ctx.cwd),
): FilePlan[] {
  const plans: FilePlan[] = [];
  const relativeUi = importsBetweenUiAreRelative(ctx, config, mappings, pathOverride);
  for (const item of items) {
    for (const file of item.files) {
      const raw = ctx.registry.readFile(file.path);
      const content = file.path.endsWith(".css")
        ? raw
        : rewriteImports(raw, config.aliases, { relativeUi: relativeUi && item.type === "ui" });
      const target = targetFor(item, file, config, mappings, ctx, pathOverride);
      const current = ctx.fs.read(target);
      plans.push({
        item,
        file,
        target,
        content,
        current,
        status:
          current === undefined
            ? "create"
            : sameContent(current, content)
              ? "unchanged"
              : "differs",
      });
    }
  }
  return plans;
}

function diffOf(plan: FilePlan, ctx: CliContext): string {
  return unifiedDiff(plan.current ?? "", plan.content, {
    before: `a/${display(ctx.cwd, plan.target)} (yours)`,
    after: `b/${display(ctx.cwd, plan.target)} (registry)`,
  });
}

/** Missing packages the plan needs, as install specifiers. */
function missingPackages(
  ctx: CliContext,
  needed: Readonly<Record<string, string>>,
  framework: readonly string[],
): string[] {
  const manifest = readManifest(ctx.fs, ctx.cwd);
  const installed = manifest?.packages ?? new Set<string>();
  const missing: string[] = [];
  for (const name of framework) if (!installed.has(name)) missing.push(name);
  for (const [name, version] of Object.entries(needed)) {
    if (!installed.has(name)) missing.push(`${name}@${version}`);
  }
  return missing;
}

async function installMissing(
  ctx: CliContext,
  packages: readonly string[],
  flags: CommonFlags,
): Promise<number> {
  if (packages.length === 0) return OK;
  const manager = detectPackageManager(ctx.fs, ctx.cwd);
  const { command, args } = installCommand(manager, packages);
  const line = [command, ...args].join(" ");
  // `status` says what became of the install: planned (dry run), left to the user, done, or failed.
  const record = (status: "dry-run" | "skipped" | "installed" | "failed"): void =>
    ctx.report?.push("installs", { status, manager, packages, command: line });
  if (flags.dryRun) {
    ctx.out(`would run: ${line}`);
    record("dry-run");
    return OK;
  }
  if (flags.skipInstall) {
    ctx.out(`Install the packages yourself: ${line}`);
    record("skipped");
    return OK;
  }
  const approved =
    flags.yes || (await ctx.confirm(`Install ${packages.join(", ")} with ${manager}?`));
  if (!approved) {
    ctx.out(`Skipped. Install the packages yourself: ${line}`);
    record("skipped");
    return OK;
  }
  ctx.out(`running: ${line}`);
  try {
    await ctx.install({
      cwd: ctx.cwd,
      manager,
      packages,
      output: ctx.report === undefined ? "inherit" : "stderr",
    });
  } catch (error) {
    record("failed");
    return problem(
      ctx,
      "SHADOW_UI_INSTALL_FAILED",
      `${line} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  record("installed");
  return OK;
}

/**
 * Copies components into the project, with everything they import.
 *
 * Resolves `registryDependencies` transitively, rewrites imports to the configured aliases, writes
 * new files, leaves identical files alone, and shows a diff for files that differ. A differing file
 * is replaced with `overwrite` or when the user confirms; otherwise it is kept and the exit code is 1.
 * Installs the npm packages the files import that the project lacks. Every target is checked to be
 * inside the project.
 *
 * @param ctx The CLI context.
 * @param names Component names (ignored with `flags.all`).
 * @param flags The flags.
 * @returns The exit code: 0 on success, 1 on any error or when a differing file was kept.
 * @example
 * await runAdd(ctx, ["button", "dialog"], { overwrite: false, dryRun: false, yes: true, skipInstall: false, all: false, path: undefined });
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export async function runAdd(
  ctx: CliContext,
  names: readonly string[],
  flags: AddFlags,
): Promise<number> {
  try {
    if (requireProject(ctx) === undefined) return FAILED;
    const config = requireConfig(ctx);
    if (config === undefined) return FAILED;
    const requested = flags.all ? ctx.registry.index.items.map((item) => item.name) : names;
    if (requested.length === 0) {
      return problem(
        ctx,
        "SHADOW_UI_NO_COMPONENTS",
        "name at least one component, e.g. `shadow-ui add button`, or pass --all.",
      );
    }
    const plan = resolveItems(ctx.registry.index, requested);
    const extra = plan.items
      .map((item) => item.name)
      .filter((name) => !plan.requested.includes(name));
    ctx.report?.set("dryRun", flags.dryRun);
    ctx.report?.set("requested", plan.requested);
    ctx.report?.set("dependencies", extra);
    ctx.report?.set("files", []);
    ctx.out(
      `Adding ${plan.requested.join(", ")}${extra.length > 0 ? ` (and ${extra.join(", ")} they depend on)` : ""}`,
    );
    const files = planFiles(ctx, config, plan.items, flags.path);
    let kept = 0;
    for (const entry of files) {
      const where = display(ctx.cwd, entry.target);
      if (entry.status === "unchanged") {
        ctx.out(`  unchanged  ${where}`);
        recordFile(ctx, where, "unchanged");
        continue;
      }
      if (entry.status === "create") {
        ctx.out(`  ${flags.dryRun ? "would create" : "create"}  ${where}`);
        if (!flags.dryRun) ctx.fs.write(entry.target, entry.content);
        recordFile(ctx, where, "create");
        continue;
      }
      ctx.out(`  differs    ${where}`);
      const diff = diffOf(entry, ctx);
      for (const line of diff.split("\n")) ctx.out(`    ${line}`);
      if (flags.dryRun) {
        recordFile(ctx, where, "differs", diff);
        continue;
      }
      const replace = flags.overwrite || (!flags.yes && (await ctx.confirm(`Overwrite ${where}?`)));
      if (replace) {
        ctx.fs.write(entry.target, entry.content);
        ctx.out(`  overwrote  ${where}`);
        recordFile(ctx, where, "overwrite");
      } else {
        kept += 1;
        ctx.out(`  kept       ${where} (pass --overwrite to replace it)`);
        recordFile(ctx, where, "kept", diff);
      }
    }
    if (plan.usesAnimations) {
      const css = ctx.fs.read(join(ctx.cwd, config.tailwind.css));
      const theme = ctx.fs.exists(join(ctx.cwd, themePathFor(config.tailwind.css)));
      if (!theme && !(css ?? "").includes("animate-in")) {
        caution(
          ctx,
          "SHADOW_UI_NO_ANIMATIONS",
          `these components animate; run \`shadow-ui init\` to add ${THEME_FILE} (animation utilities).`,
        );
      }
    }
    const installFailed = await installMissing(
      ctx,
      missingPackages(
        ctx,
        plan.dependencies,
        plan.usesPrimitives ? ctx.registry.index.frameworkDependencies : [],
      ),
      flags,
    );
    if (kept > 0) {
      const message = `${kept} file(s) differ from the registry and were kept.`;
      ctx.err(message);
      ctx.report?.fail("SHADOW_UI_FILES_DIFFER", message);
    }
    return installFailed === OK && kept === 0 ? OK : FAILED;
  } catch (error) {
    return failed(ctx, error);
  }
}

/**
 * Sets a project up: writes `components.json`, `lib/utils`, and the theme stylesheet, wires the
 * stylesheet in, installs the helper packages, and prints what remains to configure by hand.
 * An existing file is kept unless `overwrite` is set. The one exception is `components.json`: a
 * changed base color or stylesheet (from the flags) rewrites it, keeping the aliases.
 *
 * @param ctx The CLI context.
 * @param flags The flags.
 * @returns The exit code.
 * @example
 * await runInit(ctx, { overwrite: false, dryRun: false, yes: true, skipInstall: false, baseColor: "zinc", css: undefined });
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export async function runInit(ctx: CliContext, flags: InitFlags): Promise<number> {
  try {
    const manifest = requireProject(ctx);
    if (manifest === undefined) return FAILED;
    const info = detectProject(ctx.fs, ctx.cwd, manifest);
    if (info.framework === "unknown") {
      caution(
        ctx,
        "SHADOW_UI_UNKNOWN_FRAMEWORK",
        "neither Vite nor @shadow-js/dusk found in package.json; continuing with Vite defaults.",
      );
    }
    const existing = readConfig(ctx.fs, ctx.cwd);
    const baseColor = flags.baseColor ?? existing?.tailwind.baseColor ?? "neutral";
    // `--base-color` and `--css` are explicit requests: they update an existing components.json
    // (keeping its aliases) instead of being ignored. `--overwrite` starts from the defaults.
    const config: ComponentsConfig =
      existing === undefined || flags.overwrite
        ? defaultConfig(info, baseColor, flags.css)
        : { ...existing, tailwind: { css: flags.css ?? existing.tailwind.css, baseColor } };
    const write = (path: string, content: string, label: string): "created" | "kept" => {
      const absolute = resolveInsideReal(ctx.fs, ctx.cwd, path);
      const current = ctx.fs.read(absolute);
      if (current !== undefined && !flags.overwrite) {
        if (!sameContent(current, content)) {
          ctx.out(`  kept       ${label} (exists; pass --overwrite to replace it)`);
          recordFile(ctx, label, "kept");
        } else {
          ctx.out(`  unchanged  ${label}`);
          recordFile(ctx, label, "unchanged");
        }
        return "kept";
      }
      ctx.out(`  ${flags.dryRun ? "would write" : "write"}   ${label}`);
      if (!flags.dryRun) ctx.fs.write(absolute, content);
      recordFile(ctx, label, current === undefined ? "create" : "update");
      return "created";
    };

    ctx.report?.set("dryRun", flags.dryRun);
    ctx.report?.set("config", { baseColor, css: config.tailwind.css });
    ctx.report?.set("files", []);
    ctx.out("Setting up @shadow-js/ui");
    const configText = serializeConfig(config);
    const configPath = resolveInsideReal(ctx.fs, ctx.cwd, "components.json");
    const configNow = ctx.fs.read(configPath);
    // Only a changed base color or stylesheet rewrites an existing file; a plain re-run leaves it
    // alone, whatever its layout or extra keys.
    if (
      existing !== undefined &&
      !flags.overwrite &&
      configNow !== undefined &&
      (config.tailwind.baseColor !== existing.tailwind.baseColor ||
        config.tailwind.css !== existing.tailwind.css) &&
      !sameContent(configNow, configText)
    ) {
      ctx.out(
        `  ${flags.dryRun ? "would update" : "updated"}   components.json (base color ${config.tailwind.baseColor}, stylesheet ${config.tailwind.css})`,
      );
      if (!flags.dryRun) ctx.fs.write(configPath, configText);
      recordFile(ctx, "components.json", "update");
    } else {
      write("components.json", configText, "components.json");
    }

    const themeFile = themePathFor(config.tailwind.css);
    const themeLabel = themeFile.replaceAll("\\", "/");
    const themeText = buildThemeCss(ctx.registry, config.tailwind.baseColor);
    const themeCurrent = ctx.fs.read(resolveInsideReal(ctx.fs, ctx.cwd, themeFile));
    const recolor =
      existing !== undefined &&
      !flags.overwrite &&
      existing.tailwind.baseColor !== config.tailwind.baseColor &&
      themeCurrent !== undefined;
    if (
      recolor &&
      sameContent(themeCurrent, buildThemeCss(ctx.registry, existing.tailwind.baseColor))
    ) {
      // The theme file is still what `init` generated for the old color: regenerate it.
      ctx.out(
        `  ${flags.dryRun ? "would write" : "write"}   ${themeLabel} (${config.tailwind.baseColor})`,
      );
      if (!flags.dryRun) {
        ctx.fs.write(resolveInsideReal(ctx.fs, ctx.cwd, themeFile), themeText);
      }
      recordFile(ctx, themeLabel, "update");
    } else if (recolor) {
      ctx.out(
        `  kept       ${themeLabel} (edited; pass --overwrite to regenerate it for ${config.tailwind.baseColor})`,
      );
      recordFile(ctx, themeLabel, "kept");
    } else {
      write(themeFile, themeText, themeLabel);
    }

    const cssPath = resolveInsideReal(ctx.fs, ctx.cwd, config.tailwind.css);
    const css = ctx.fs.read(cssPath);
    if (css === undefined) {
      write(
        config.tailwind.css,
        `@import "tailwindcss";\n${THEME_IMPORT_LINE}\n`,
        config.tailwind.css,
      );
    } else {
      const next = insertThemeImport(css);
      if (next === undefined) {
        ctx.out(
          `  unchanged  ${config.tailwind.css} (${css.includes(THEME_FILE) ? "already imports the theme" : 'no `@import "tailwindcss"` line; add the import yourself'})`,
        );
        recordFile(ctx, config.tailwind.css, "unchanged");
      } else if (flags.dryRun) {
        ctx.out(`  would add  ${THEME_IMPORT_LINE} to ${config.tailwind.css}`);
        recordFile(ctx, config.tailwind.css, "update");
      } else if (
        flags.yes ||
        (await ctx.confirm(`Add ${THEME_IMPORT_LINE} to ${config.tailwind.css}?`))
      ) {
        ctx.fs.write(cssPath, next);
        ctx.out(`  edited     ${config.tailwind.css} (added ${THEME_IMPORT_LINE})`);
        recordFile(ctx, config.tailwind.css, "update");
      } else {
        ctx.out(
          `  skipped    add this line after the Tailwind import of ${config.tailwind.css}: ${THEME_IMPORT_LINE}`,
        );
        recordFile(ctx, config.tailwind.css, "skipped");
      }
    }

    const added = await runAddForInit(ctx, config, flags);
    if (added !== OK) return added;

    const tooling: string[] = [];
    if (!info.hasTailwind) tooling.push("tailwindcss");
    if (!info.hasTailwindVite) tooling.push("@tailwindcss/vite");
    const installed = await installMissing(ctx, tooling, flags);
    printNextSteps(ctx, config, info.framework);
    return installed;
  } catch (error) {
    return failed(ctx, error);
  }
}

/** `init` copies `utils` through the same pipeline as `add`. */
async function runAddForInit(
  ctx: CliContext,
  config: ComponentsConfig,
  flags: InitFlags,
): Promise<number> {
  const plan = resolveItems(ctx.registry.index, ["utils"]);
  // A project without the `@/*` alias yet still gets lib/utils at the conventional place; the
  // next steps tell the user to add the alias.
  const mappings: PathMapping[] = [
    ...readPathMappings(ctx.fs, ctx.cwd),
    { pattern: "@/*", targets: [join(ctx.cwd, "src", "*")] },
  ];
  for (const entry of planFiles(ctx, config, plan.items, undefined, mappings)) {
    const where = display(ctx.cwd, entry.target);
    if (entry.status === "unchanged") {
      ctx.out(`  unchanged  ${where}`);
      recordFile(ctx, where, "unchanged");
    } else if (entry.status === "differs" && !flags.overwrite) {
      ctx.out(`  kept       ${where} (exists; pass --overwrite to replace it)`);
      recordFile(ctx, where, "kept");
    } else {
      ctx.out(`  ${flags.dryRun ? "would write" : "write"}   ${where}`);
      if (!flags.dryRun) ctx.fs.write(entry.target, entry.content);
      recordFile(ctx, where, entry.status === "create" ? "create" : "update");
    }
  }
  return installMissing(ctx, missingPackages(ctx, plan.dependencies, []), flags);
}

function printNextSteps(ctx: CliContext, config: ComponentsConfig, framework: string): void {
  const mappings = readPathMappings(ctx.fs, ctx.cwd);
  const vite = readViteSetup(ctx.fs, ctx.cwd);
  ctx.out("");
  ctx.out("Next steps");
  let step = 1;
  const say = (text: string): void => {
    ctx.out(`  ${step++}. ${text}`);
    ctx.report?.push("nextSteps", text);
  };
  try {
    aliasToDirectory(config.aliases.ui, mappings);
  } catch (error) {
    if (!(error instanceof PathError)) throw error;
    say(
      'Add the import alias to tsconfig.json: "compilerOptions": { "paths": { "@/*": ["./src/*"] } }',
    );
  }
  // Vite resolves `@` itself (tsconfig `paths` only inform the editor), and Tailwind v4 needs its
  // Vite plugin. A Dusk app is a Vite app (`dusk()` adds neither), so the steps are the
  // same; each is printed only while the project's Vite config does not have it yet.
  if (framework !== "unknown" || vite !== undefined) {
    const file = vite?.file ?? "vite.config.ts";
    const tailwind = vite?.tailwind === true;
    if (vite?.alias !== true) {
      say(
        `Make Vite resolve "@": in ${file} add \`resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } }\` (\`fileURLToPath\` is from "node:url").`,
      );
    }
    if (!tailwind) {
      say(`Add \`tailwindcss()\` from @tailwindcss/vite to \`plugins\` in ${file}.`);
    }
  } else {
    say(
      'Make Vite resolve "@": in vite.config.ts add `resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } }` and `tailwindcss()` from @tailwindcss/vite to `plugins`.',
    );
  }
  say(`Import ${config.tailwind.css} once in your entry file (it already imports ${THEME_FILE}).`);
  say(
    'Prevent a flash of the wrong theme: put the text of themeScript() from "@shadow-js/ui" in a <script> in <head> (README, "Dark mode"), and wrap the app in <ThemeProvider>.',
  );
  say("Add components: shadow-ui add button dialog");
}

/**
 * Lists the registry's components and whether each is already in the project. In a `--json` run
 * (`ctx.report` is set) the rows are recorded as `items`, with `initialized` saying whether `components.json` exists.
 *
 * @param ctx The CLI context.
 * @returns The exit code.
 * @example
 * runList(ctx);
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function runList(ctx: CliContext): number {
  try {
    const config = readConfig(ctx.fs, ctx.cwd);
    const mappings = config === undefined ? [] : readPathMappings(ctx.fs, ctx.cwd);
    const rows = ctx.registry.index.items.map((item) => {
      let installed = false;
      if (config !== undefined) {
        const main = item.files[0];
        if (main !== undefined) {
          try {
            installed = ctx.fs.exists(targetFor(item, main, config, mappings, ctx, undefined));
          } catch (error) {
            if (!(error instanceof PathError)) throw error;
          }
        }
      }
      return { name: item.name, type: item.type, description: item.description, installed };
    });
    ctx.report?.set("initialized", config !== undefined);
    ctx.report?.set("items", rows);
    const width = Math.max(...rows.map((row) => row.name.length));
    for (const row of rows) {
      ctx.out(`${row.installed ? "*" : " "} ${row.name.padEnd(width)}  ${row.description}`);
    }
    ctx.out("");
    ctx.out(`${rows.length} items${config === undefined ? "" : "; * = already in your project"}`);
    return OK;
  } catch (error) {
    return failed(ctx, error);
  }
}

/**
 * Compares the project's copy of components with the registry's and prints a unified diff of each
 * that differs. With no names, checks every component that is in the project.
 *
 * @param ctx The CLI context.
 * @param names Component names, or empty for all installed ones.
 * @returns 0 when every checked file matches, 1 when a checked file differs or a named component is
 *   not in the project.
 * @example
 * await runDiff(ctx, ["button"]);
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function runDiff(ctx: CliContext, names: readonly string[]): number {
  try {
    if (requireProject(ctx) === undefined) return FAILED;
    const config = requireConfig(ctx);
    if (config === undefined) return FAILED;
    for (const name of names) {
      if (!isValidItemName(name))
        throw new ResolveError(`"${name}" is not a valid component name.`);
      if (findItem(ctx.registry.index, name) === undefined)
        throw new ResolveError(`Unknown component "${name}".`);
    }
    const items = (
      names.length === 0
        ? ctx.registry.index.items
        : names.map((name) => findItem(ctx.registry.index, name))
    ).filter((item): item is RegistryItem => item !== undefined);
    let differing = 0;
    let checked = 0;
    ctx.report?.set("components", []);
    const record = (name: string, path: string, status: string, diff?: string): void =>
      ctx.report?.push(
        "components",
        diff === undefined ? { name, path, status } : { name, path, status, diff },
      );
    for (const entry of planFiles(ctx, config, items, undefined)) {
      const where = display(ctx.cwd, entry.target);
      if (entry.status === "create") {
        if (names.length > 0) {
          ctx.out(`${entry.item.name}: not in your project (${where})`);
          record(entry.item.name, where, "missing");
          differing += 1;
        }
        continue;
      }
      checked += 1;
      if (entry.status === "unchanged") {
        if (names.length > 0) ctx.out(`${entry.item.name}: up to date (${where})`);
        record(entry.item.name, where, "up-to-date");
        continue;
      }
      differing += 1;
      ctx.out(`${entry.item.name}: differs (${where})`);
      const diff = diffOf(entry, ctx);
      ctx.out(diff);
      record(entry.item.name, where, "differs", diff);
    }
    if (names.length === 0) {
      ctx.out(`${checked} file(s) checked, ${differing} differ from the registry.`);
    }
    ctx.report?.set("checked", checked);
    ctx.report?.set("differing", differing);
    if (differing > 0) {
      ctx.report?.fail(
        "SHADOW_UI_DIFFERS",
        `${differing} file(s) differ from the registry or are missing from the project.`,
      );
    }
    return differing === 0 ? OK : FAILED;
  } catch (error) {
    return failed(ctx, error);
  }
}

/**
 * Flags of `remove`.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface RemoveFlags {
  readonly dryRun: boolean;
  /** Remove even when another component in the project imports it. */
  readonly force: boolean;
}

/**
 * Deletes components' files from the project. Refuses when another component that is in the
 * project imports one of them (unless `force`), and never removes npm packages.
 *
 * @param ctx The CLI context.
 * @param names Component names.
 * @param flags The flags.
 * @returns The exit code.
 * @example
 * await runRemove(ctx, ["badge"], { dryRun: false, force: false });
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function runRemove(ctx: CliContext, names: readonly string[], flags: RemoveFlags): number {
  try {
    if (requireProject(ctx) === undefined) return FAILED;
    const config = requireConfig(ctx);
    if (config === undefined) return FAILED;
    if (names.length === 0) {
      return problem(ctx, "SHADOW_UI_NO_COMPONENTS", "name at least one component to remove.");
    }
    const mappings = readPathMappings(ctx.fs, ctx.cwd);
    const installedNames = ctx.registry.index.items
      .filter((item) => {
        const main = item.files[0];
        return (
          main !== undefined &&
          ctx.fs.exists(targetFor(item, main, config, mappings, ctx, undefined))
        );
      })
      .map((item) => item.name);
    const plan = resolveItems(ctx.registry.index, names);
    const removing = plan.requested;
    ctx.report?.set("dryRun", flags.dryRun);
    ctx.report?.set("removed", []);
    let code = OK;
    for (const name of removing) {
      const blockers = dependentsOf(ctx.registry.index, name, installedNames).filter(
        (other) => !removing.includes(other),
      );
      if (blockers.length > 0 && !flags.force) {
        problem(
          ctx,
          "SHADOW_UI_IN_USE",
          `${name} is used by ${blockers.join(", ")}; remove those first or pass --force.`,
        );
        ctx.report?.push("blocked", { name, usedBy: blockers });
        code = FAILED;
        continue;
      }
      const item = findItem(ctx.registry.index, name);
      if (item === undefined) continue;
      for (const file of item.files) {
        const target = targetFor(item, file, config, mappings, ctx, undefined);
        if (!ctx.fs.exists(target)) continue;
        const where = display(ctx.cwd, target);
        ctx.out(`  ${flags.dryRun ? "would remove" : "remove"}  ${where}`);
        if (!flags.dryRun) ctx.fs.remove(target);
        ctx.report?.push("removed", { name, path: where });
      }
    }
    return code;
  } catch (error) {
    return failed(ctx, error);
  }
}
