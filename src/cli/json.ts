/**
 * The machine-readable output of the `shadow-ui` command. With `--json`, every command prints one document on stdout and
 * nothing else there; the words a person would read go to stderr (warnings, errors) or are left out (the progress lines
 * that `data` already holds), and nothing is asked.
 *
 * ```json
 * { "schema": 1, "command": "shadow-ui add", "ok": true, "data": {}, "warnings": [] }
 * ```
 *
 * `ok` is true exactly when the exit code is 0; a failure adds `error: { code, message }` and may still carry `data`.
 * The same contract (schema 1) is printed by `dusk` and `create-shadow-app`; each package has its own copy of this small
 * module, so the commands share no code at runtime.
 * @packageDocumentation
 */

/**
 * The version of the document. A change to the meaning of a key raises it.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const JSON_SCHEMA = 1;

/**
 * A warning in the document: a stable code and a sentence.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface JsonWarning {
  /** A stable SCREAMING_SNAKE code with the `SHADOW_UI_` prefix. */
  readonly code: string;
  readonly message: string;
}

/**
 * The failure in the document: a stable code and a sentence a person can act on.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface JsonError {
  /** A stable SCREAMING_SNAKE code with the `SHADOW_UI_` prefix. */
  readonly code: string;
  readonly message: string;
}

/**
 * What every `--json` run prints.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface JsonDocument {
  readonly schema: typeof JSON_SCHEMA;
  /** The command that ran, such as `shadow-ui add`. An alias is named by its command (`ls` is `shadow-ui list`). */
  readonly command: string;
  /** True exactly when the exit code is 0. */
  readonly ok: boolean;
  /** The facts of the command. `{}` when it has none, and what is known when the command failed. */
  readonly data: Readonly<Record<string, unknown>>;
  readonly warnings: readonly JsonWarning[];
  /** Only when `ok` is false. */
  readonly error?: JsonError;
}

/**
 * The error codes of the command, for the documentation and the tests.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const ERROR_CODES = [
  "SHADOW_UI_UNKNOWN_COMMAND",
  "SHADOW_UI_UNKNOWN_OPTION",
  "SHADOW_UI_INVALID_OPTION",
  "SHADOW_UI_MISSING_COMMAND",
  "SHADOW_UI_INVALID_SHELL",
  "SHADOW_UI_INVALID_BASE_COLOR",
  "SHADOW_UI_NO_PROJECT",
  "SHADOW_UI_NO_CONFIG",
  "SHADOW_UI_NO_COMPONENTS",
  "SHADOW_UI_UNKNOWN_COMPONENT",
  "SHADOW_UI_INVALID_NAME",
  "SHADOW_UI_REGISTRY_CONFLICT",
  "SHADOW_UI_INVALID_FILE",
  "SHADOW_UI_UNSAFE_PATH",
  "SHADOW_UI_FILES_DIFFER",
  "SHADOW_UI_DIFFERS",
  "SHADOW_UI_IN_USE",
  "SHADOW_UI_INSTALL_FAILED",
  "SHADOW_UI_FAILED",
  "SHADOW_UI_UNEXPECTED",
] as const;

/**
 * The warning codes of the command.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const WARNING_CODES = ["SHADOW_UI_NO_ANIMATIONS", "SHADOW_UI_UNKNOWN_FRAMEWORK"] as const;

/**
 * What a command records while it works, for the document: the facts, the warnings, and the first failure. Present in
 * the context of a `--json` run only.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export class Report {
  /** The facts, by key. */
  readonly data: Record<string, unknown> = {};
  readonly warnings: JsonWarning[] = [];
  /** The failure; a second one adds its message to the first. */
  error: JsonError | undefined;

  /**
   * Sets a fact.
   * @param key The key of `data`.
   * @param value The value.
   */
  set(key: string, value: unknown): void {
    this.data[key] = value;
  }

  /**
   * Adds a value to the list at a key of `data`.
   * @param key The key of `data`; the list is made when it is missing.
   * @param value The value.
   */
  push(key: string, value: unknown): void {
    const list = this.data[key];
    if (Array.isArray(list)) list.push(value);
    else this.data[key] = [value];
  }

  /**
   * Adds a warning.
   * @param code The stable code.
   * @param message The sentence.
   */
  warn(code: string, message: string): void {
    this.warnings.push({ code, message });
  }

  /**
   * Records the failure. The first code wins; a later message is added to the first.
   * @param code The stable code.
   * @param message The sentence.
   */
  fail(code: string, message: string): void {
    this.error =
      this.error === undefined
        ? { code, message }
        : { ...this.error, message: `${this.error.message} ${message}` };
  }
}

/**
 * A successful document.
 * @param command The command that ran.
 * @param data The facts of the command.
 * @param warnings The warnings; none by default.
 * @returns The document.
 * @example
 * jsonSuccess("shadow-ui list", { items: [] }).ok; // true
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function jsonSuccess(
  command: string,
  data: Readonly<Record<string, unknown>>,
  warnings: readonly JsonWarning[] = [],
): JsonDocument {
  return { schema: JSON_SCHEMA, command, ok: true, data, warnings };
}

/**
 * A failed document.
 * @param command The command that ran.
 * @param error The code and the message.
 * @param data What is known despite the failure.
 * @param warnings The warnings raised before it.
 * @returns The document, with `ok: false`.
 * @example
 * jsonFailure("shadow-ui add", { code: "SHADOW_UI_NO_CONFIG", message: "no components.json" }).ok; // false
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function jsonFailure(
  command: string,
  error: JsonError,
  data: Readonly<Record<string, unknown>> = {},
  warnings: readonly JsonWarning[] = [],
): JsonDocument {
  return { schema: JSON_SCHEMA, command, ok: false, data, warnings, error };
}

/**
 * The document as text, without the final newline (the output adds one).
 * @param document The document.
 * @param compact True for one line.
 * @returns The JSON text.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function jsonText(document: JsonDocument, compact = false): string {
  return JSON.stringify(document, null, compact ? undefined : 2);
}

/**
 * Whether the command line asks for JSON: `--json` anywhere before a `--`. Read before the line is parsed, so a refused
 * command line is answered in JSON too.
 * @param argv The arguments after `shadow-ui`.
 * @returns True for `--json`.
 * @example
 * wantsJson(["list", "--json"]); // true
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function wantsJson(argv: readonly string[]): boolean {
  for (const arg of argv) {
    if (arg === "--") return false;
    if (arg === "--json") return true;
  }
  return false;
}

/**
 * Prints an uncaught exception or a rejected promise as a JSON failure, then exits 1. Installed by the executable when the
 * command line asks for JSON, so a crash is no exception to "stdout carries one document". A reader that went away
 * (`| head -n 1` closed the pipe) is not a crash: the process exits quietly.
 * @param argv The arguments after `shadow-ui`; the first word that is not an option names the command.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function installCrashHandlers(argv: readonly string[]): void {
  let crashed = false;
  const crash = (error: unknown): void => {
    if (typeof error === "object" && error !== null && Reflect.get(error, "code") === "EPIPE") {
      process.exit(0);
    }
    // The document itself may fail to write (the pipe closed meanwhile); one attempt is all there is.
    if (crashed) process.exit(1);
    crashed = true;
    const message = error instanceof Error ? error.message : String(error);
    if (error instanceof Error && error.stack !== undefined) {
      process.stderr.write(`${error.stack}\n`);
    }
    const word = argv.find((arg) => !arg.startsWith("-"));
    const document = jsonFailure(word === undefined ? "shadow-ui" : `shadow-ui ${word}`, {
      code: "SHADOW_UI_UNEXPECTED",
      message: `unexpected error: ${message}`,
    });
    process.stdout.write(`${jsonText(document)}\n`, () => process.exit(1));
  };
  process.on("uncaughtException", crash);
  process.on("unhandledRejection", crash);
}
