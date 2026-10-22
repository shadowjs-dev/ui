/**
 * Argument parsing and dispatch for the `shadow-ui` command. `main` takes its context as a
 * parameter, so it is tested without spawning a process.
 * @packageDocumentation
 */
import { parseArgs } from "node:util";
import {
  type AddFlags,
  type CliContext,
  type InitFlags,
  runAdd,
  runDiff,
  runInit,
  runList,
  runRemove,
} from "./commands";
import { type CompletionSpec, completionScript, isShell, SHELL_CHOICES } from "./completion";
import { type JsonDocument, jsonFailure, jsonSuccess, jsonText, Report, wantsJson } from "./json";
import { BASE_COLORS, type BaseColor } from "./schema";

/** Subcommand names the shell completion offers, aliases included. */
const COMMANDS: readonly string[] = [
  "init",
  "add",
  "list",
  "ls",
  "diff",
  "remove",
  "rm",
  "completion",
  "help",
];

const HELP = `shadow-ui: add shadcn-style components to a ShadowJS project

Usage
  shadow-ui init [options]            set up components.json, lib/utils and the theme
  shadow-ui add <name...> [options]   copy components (and what they import) into the project
  shadow-ui list                      list the registry; * marks components in your project
  shadow-ui diff [name...]            compare your copy with the registry (exit 1 if it differs)
  shadow-ui remove <name...>          delete components from the project
  shadow-ui completion <shell>        print a bash, zsh or fish completion script

Options
  -y, --yes            answer yes to confirmations (never overwrites by itself)
  -o, --overwrite      replace files that differ from the registry
      --dry-run        print what would happen, change nothing
  -a, --all            add: every component
      --path <dir>     add: write ui components to <dir> instead of the configured alias
      --skip-install   do not install npm packages; print the command instead
      --base-color <c> init: ${BASE_COLORS.join(" | ")} (default neutral)
      --css <file>     init: the stylesheet that imports Tailwind
      --force          remove: even if another component uses it
      --cwd <dir>      run in <dir>
  -h, --help           show this help
  -v, --version        show the version of @shadow-js/ui
      --json           print one JSON document on stdout instead of words (every command; nothing is asked)
`;

const OPTIONS = {
  yes: { type: "boolean", short: "y" },
  overwrite: { type: "boolean", short: "o" },
  "dry-run": { type: "boolean" },
  all: { type: "boolean", short: "a" },
  path: { type: "string" },
  "skip-install": { type: "boolean" },
  "base-color": { type: "string" },
  css: { type: "string" },
  force: { type: "boolean" },
  json: { type: "boolean" },
  cwd: { type: "string" },
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "v" },
} as const;

/** The command a document names: `shadow-ui add` (an alias is named by its command). */
const CANONICAL: Readonly<Record<string, string>> = { ls: "list", rm: "remove" };

/**
 * Runs the CLI. With `--json` (anywhere before a `--`) every outcome is one JSON document on stdout, in the contract of
 * `json.ts`: the command's facts in `data`, its warnings in `warnings`, its failure in `error`. The human lines that
 * `data` already holds are left out, the warnings and errors still go to stderr, nothing is asked, and an installer's
 * output goes to stderr. The exit codes are the same with and without `--json`.
 *
 * @param argv The arguments after the executable (`["add", "button"]`).
 * @param context Builds the context for a working directory (`--cwd` overrides the default).
 * @returns The process exit code.
 * @example
 * process.exitCode = await main(process.argv.slice(2), (cwd) => realContext(cwd));
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export async function main(
  argv: readonly string[],
  context: (cwd: string | undefined) => CliContext,
): Promise<number> {
  const json = wantsJson(argv);
  let parsed: ReturnType<typeof parseArgs<{ options: typeof OPTIONS; allowPositionals: true }>>;
  const base = context(undefined);
  /** Prints a document: the one thing a `--json` run writes on stdout. */
  const emit = (document: JsonDocument): void => base.out(jsonText(document));
  try {
    parsed = parseArgs({ args: [...argv], options: OPTIONS, allowPositionals: true, strict: true });
  } catch (error) {
    if (error instanceof TypeError) {
      if (json) {
        const message = error.message.split(". ")[0] ?? error.message;
        emit(
          jsonFailure("shadow-ui", {
            code: /^Unknown option/.test(message)
              ? "SHADOW_UI_UNKNOWN_OPTION"
              : "SHADOW_UI_INVALID_OPTION",
            message,
          }),
        );
        return 1;
      }
      base.err(`error: ${error.message}`);
      base.err("Run `shadow-ui --help` for usage.");
      return 1;
    }
    throw error;
  }
  const { values, positionals } = parsed;
  const [command, ...rest] = positionals;
  if (
    values.help === true ||
    command === "help" ||
    (command === undefined && values.version !== true)
  ) {
    const missing = command === undefined && values.help !== true;
    if (json) {
      emit(
        missing
          ? jsonFailure("shadow-ui", {
              code: "SHADOW_UI_MISSING_COMMAND",
              message: "no command given. Run `shadow-ui --help` for usage.",
            })
          : jsonSuccess("shadow-ui", { usage: HELP }),
      );
    } else {
      base.out(HELP);
    }
    return missing ? 1 : 0;
  }
  if (values.version === true) {
    const version = base.version ?? base.registry.index.version;
    if (json) emit(jsonSuccess("shadow-ui", { version }));
    else base.out(version);
    return 0;
  }
  const real = values.cwd === undefined ? base : context(values.cwd);
  const report = json ? new Report() : undefined;
  // A `--json` run keeps stdout for the document: the progress lines are in `data`, and nothing is asked.
  const ctx: CliContext =
    report === undefined
      ? real
      : { ...real, out: () => undefined, confirm: async () => false, report };
  const scope = `shadow-ui ${CANONICAL[command ?? ""] ?? command ?? ""}`.trimEnd();
  const common = {
    overwrite: values.overwrite === true,
    dryRun: values["dry-run"] === true,
    yes: values.yes === true,
    skipInstall: values["skip-install"] === true,
  };
  let code: number;
  try {
    code = await dispatch(ctx, command, rest, values, common);
  } catch (error) {
    if (report === undefined) throw error;
    const message = error instanceof Error ? error.message : String(error);
    if (error instanceof Error && error.stack !== undefined) ctx.err(error.stack);
    report.fail("SHADOW_UI_UNEXPECTED", `unexpected error: ${message}`);
    code = 1;
  }
  if (report !== undefined) {
    const unknown = command === undefined || !COMMANDS.includes(command);
    const document =
      code === 0
        ? jsonSuccess(scope, report.data, report.warnings)
        : jsonFailure(
            unknown ? "shadow-ui" : scope,
            report.error ?? { code: "SHADOW_UI_FAILED", message: "the command failed." },
            report.data,
            report.warnings,
          );
    real.out(jsonText(document));
  }
  return code;
}

type Values = ReturnType<
  typeof parseArgs<{ options: typeof OPTIONS; allowPositionals: true }>
>["values"];

/** Runs the named command. */
async function dispatch(
  ctx: CliContext,
  command: string | undefined,
  rest: readonly string[],
  values: Values,
  common: {
    readonly overwrite: boolean;
    readonly dryRun: boolean;
    readonly yes: boolean;
    readonly skipInstall: boolean;
  },
): Promise<number> {
  switch (command) {
    case "init": {
      const color = values["base-color"];
      if (color !== undefined && !BASE_COLORS.includes(color as BaseColor)) {
        const message = `--base-color must be one of ${BASE_COLORS.join(", ")}`;
        ctx.err(`error: ${message}`);
        ctx.report?.fail("SHADOW_UI_INVALID_BASE_COLOR", message);
        return 1;
      }
      const flags: InitFlags = {
        ...common,
        baseColor: color as BaseColor | undefined,
        css: values.css,
      };
      return runInit(ctx, flags);
    }
    case "add": {
      const flags: AddFlags = { ...common, all: values.all === true, path: values.path };
      return runAdd(ctx, rest, flags);
    }
    case "list":
    case "ls":
      return runList(ctx);
    case "diff":
      return runDiff(ctx, rest);
    case "remove":
    case "rm":
      return runRemove(ctx, rest, { dryRun: common.dryRun, force: values.force === true });
    case "completion": {
      const shell = rest[0];
      if (!isShell(shell)) {
        const message =
          shell === undefined
            ? `completion needs a shell: ${SHELL_CHOICES}`
            : `unknown shell "${shell}": use ${SHELL_CHOICES}`;
        ctx.err(`error: ${message}`);
        ctx.report?.fail("SHADOW_UI_INVALID_SHELL", message);
        return 1;
      }
      const spec: CompletionSpec = { commands: COMMANDS, flags: Object.keys(OPTIONS) };
      const script = completionScript(shell, spec);
      if (ctx.report !== undefined) {
        ctx.report.set("shell", shell);
        ctx.report.set("script", script);
        return 0;
      }
      // One call per line, as every other command writes output.
      for (const line of script.split("\n")) ctx.out(line);
      return 0;
    }
    default: {
      const message = `unknown command "${command ?? ""}"`;
      ctx.err(`error: ${message}`);
      ctx.err("Run `shadow-ui --help` for usage.");
      ctx.report?.fail("SHADOW_UI_UNKNOWN_COMMAND", message);
      return 1;
    }
  }
}
