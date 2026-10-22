/**
 * The project the CLI works in: `components.json`, `package.json`, the stylesheet that imports
 * Tailwind, and the theme stylesheet `init` generates. Reads through {@link ProjectFs}.
 * @packageDocumentation
 */
import { dirname, join, relative } from "node:path";
import type { ProjectFs } from "./fs";
import type { RegistrySource } from "./registry-source";
import {
  type BaseColor,
  type ComponentsConfig,
  DEFAULT_ALIASES,
  parseComponentsConfig,
  SchemaError,
} from "./schema";

/**
 * The file name of the generated theme stylesheet.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const THEME_FILE = "shadow-ui.css";

/**
 * A `package.json`, reduced to what the CLI needs.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface Manifest {
  /** Every package listed in dependencies, devDependencies, peerDependencies or optionalDependencies. */
  readonly packages: ReadonlySet<string>;
}

/**
 * Reads the project's `package.json`.
 *
 * @param fs The project filesystem.
 * @param root The project root.
 * @returns The manifest, or `undefined` when there is no `package.json`.
 * @throws SchemaError when the file is not valid JSON.
 * @example
 * readManifest(fs, "/app")?.packages.has("vite");
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function readManifest(fs: ProjectFs, root: string): Manifest | undefined {
  const text = fs.read(join(root, "package.json"));
  if (text === undefined) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new SchemaError(`package.json is not valid JSON: ${error.message}`);
    throw error;
  }
  const packages = new Set<string>();
  if (typeof parsed === "object" && parsed !== null) {
    for (const field of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "optionalDependencies",
    ]) {
      const group = (parsed as Record<string, unknown>)[field];
      if (typeof group === "object" && group !== null) {
        for (const name of Object.keys(group)) packages.add(name);
      }
    }
  }
  return { packages };
}

/**
 * Reads and validates `components.json`.
 *
 * @param fs The project filesystem.
 * @param root The project root.
 * @returns The configuration, or `undefined` when the file does not exist.
 * @throws SchemaError when the file is malformed.
 * @example
 * const config = readConfig(fs, "/app");
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function readConfig(fs: ProjectFs, root: string): ComponentsConfig | undefined {
  const text = fs.read(join(root, "components.json"));
  if (text === undefined) return undefined;
  try {
    return parseComponentsConfig(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new SchemaError(`components.json is not valid JSON: ${error.message}`);
    throw error;
  }
}

/**
 * The text of `components.json` for a configuration.
 *
 * @param config The configuration.
 * @returns Pretty-printed JSON ending in a newline.
 * @example
 * fs.write("components.json", serializeConfig(config));
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function serializeConfig(config: ComponentsConfig): string {
  return `${JSON.stringify(
    {
      framework: config.framework,
      tailwind: { css: config.tailwind.css, baseColor: config.tailwind.baseColor },
      aliases: config.aliases,
    },
    null,
    2,
  )}\n`;
}

/**
 * What `init` found out about the project.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface ProjectInfo {
  readonly framework: "vite" | "dusk" | "unknown";
  readonly hasTailwind: boolean;
  readonly hasTailwindVite: boolean;
  /** The stylesheet that imports Tailwind (existing), or the default location for a new one. */
  readonly css: { readonly path: string; readonly exists: boolean };
}

const CSS_CANDIDATES = [
  "src/index.css",
  "src/styles.css",
  "src/app.css",
  "src/global.css",
  "src/globals.css",
  "src/styles/globals.css",
  "src/styles/global.css",
  "src/styles/index.css",
  "app/app.css",
  "app/globals.css",
];

const TAILWIND_IMPORT = /@import\s+["']tailwindcss["']|@import\s+["']tailwindcss\//;

/**
 * Detects the framework, whether Tailwind is installed, and the stylesheet to extend.
 *
 * @param fs The project filesystem.
 * @param root The project root.
 * @param manifest The project's manifest.
 * @returns What was found.
 * @example
 * detectProject(fs, "/app", manifest).framework; // "vite"
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function detectProject(fs: ProjectFs, root: string, manifest: Manifest): ProjectInfo {
  const framework = manifest.packages.has("@shadow-js/dusk")
    ? "dusk"
    : manifest.packages.has("vite") || manifest.packages.has("@shadow-js/vite")
      ? "vite"
      : "unknown";
  let existing: string | undefined;
  for (const candidate of CSS_CANDIDATES) {
    const text = fs.read(join(root, candidate));
    if (text === undefined) continue;
    if (TAILWIND_IMPORT.test(text)) {
      existing = candidate;
      break;
    }
    existing ??= candidate;
  }
  return {
    framework,
    hasTailwind: manifest.packages.has("tailwindcss"),
    hasTailwindVite: manifest.packages.has("@tailwindcss/vite"),
    css: {
      path: existing ?? (framework === "dusk" ? "src/app.css" : "src/index.css"),
      exists: existing !== undefined,
    },
  };
}

/** Vite config files, in the order Vite looks for them. */
const VITE_CONFIGS = [
  "vite.config.ts",
  "vite.config.mts",
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.cts",
  "vite.config.cjs",
];

/** An `@` alias in a Vite config: `"@": ...`, `find: "@"`, or a plugin that reads tsconfig `paths`. */
const VITE_ALIAS = /["']@["']\s*:|\bfind\s*:\s*["']@["']|tsconfig-?paths|tsconfigPaths/i;

/** The Tailwind Vite plugin in a Vite config. */
const VITE_TAILWIND = /@tailwindcss\/vite|\btailwindcss\s*\(/;

/**
 * What the project's Vite config already has, so `init` prints only the steps that are missing.
 * The check reads the config as text (it is TypeScript that may import anything): a config that
 * builds its alias or plugin list in a way this does not recognize is reported as missing, which
 * costs a redundant hint, never a wrong edit.
 *
 * @param fs The project filesystem.
 * @param root The project root.
 * @returns `undefined` when no Vite config file exists.
 * @example
 * readViteSetup(fs, "/app")?.alias; // true when `"@"` is aliased
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function readViteSetup(
  fs: ProjectFs,
  root: string,
): { readonly file: string; readonly alias: boolean; readonly tailwind: boolean } | undefined {
  for (const file of VITE_CONFIGS) {
    const text = fs.read(join(root, file));
    if (text === undefined) continue;
    return { file, alias: VITE_ALIAS.test(text), tailwind: VITE_TAILWIND.test(text) };
  }
  return undefined;
}

/**
 * The default `components.json` for a project.
 *
 * @param info From {@link detectProject}.
 * @param baseColor The chosen base color.
 * @param css Override for the stylesheet path.
 * @returns A complete configuration.
 * @example
 * defaultConfig(info, "zinc");
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function defaultConfig(
  info: ProjectInfo,
  baseColor: BaseColor,
  css?: string,
): ComponentsConfig {
  return {
    framework: info.framework,
    tailwind: { css: css ?? info.css.path, baseColor },
    aliases: DEFAULT_ALIASES,
  };
}

/**
 * The theme stylesheet `init` writes into the project: the base color variables, the Tailwind v4
 * token mapping and base layer, and the animation utilities, in one file.
 *
 * @param source The registry source.
 * @param baseColor The base color.
 * @returns CSS text.
 * @example
 * fs.write("src/shadow-ui.css", buildThemeCss(registry, "neutral"));
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function buildThemeCss(source: RegistrySource, baseColor: BaseColor): string {
  return [
    "/* Generated by `shadow-ui init`. Edit freely: this file is yours. */",
    source.readStyle(`themes/${baseColor}.css`).trimEnd(),
    source.readStyle("theme-core.css").trim(),
    source.readStyle("animations.css").trim(),
    "",
  ].join("\n\n");
}

/**
 * The `@import` line that pulls the theme stylesheet into the entry stylesheet (the theme file is
 * written next to it).
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const THEME_IMPORT_LINE: string = `@import "./${THEME_FILE}";`;

/**
 * Inserts the theme import after the Tailwind import of a stylesheet.
 *
 * @param css The entry stylesheet's text.
 * @returns The new text, or `undefined` when the import is already there or no Tailwind import exists.
 * @example
 * insertThemeImport('@import "tailwindcss";\n'); // '@import "tailwindcss";\n@import "./shadow-ui.css";\n'
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function insertThemeImport(css: string): string | undefined {
  if (css.includes(THEME_FILE)) return undefined;
  const lines = css.split("\n");
  const at = lines.findIndex((entry) => TAILWIND_IMPORT.test(entry));
  if (at === -1) return undefined;
  lines.splice(at + 1, 0, THEME_IMPORT_LINE);
  return lines.join("\n");
}

/**
 * Project-relative path for display (forward slashes).
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function display(root: string, absolute: string): string {
  return relative(root, absolute).replaceAll("\\", "/");
}

/**
 * The theme file next to a stylesheet.
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function themePathFor(cssPath: string): string {
  return join(dirname(cssPath), THEME_FILE);
}
