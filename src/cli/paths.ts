/**
 * Path handling: reading `tsconfig` path aliases, mapping an import alias to a directory, and the
 * guard that keeps every write inside the project. Pure except for the `ProjectFs` it is handed.
 * @packageDocumentation
 */
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { ancestors, type ProjectFs } from "./fs";
import { SchemaError } from "./schema";

/**
 * Thrown when a path would leave the project or an alias cannot be mapped to a directory.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export class PathError extends Error {
  /** The stable code `--json` prints. */
  readonly code = "SHADOW_UI_UNSAFE_PATH";

  constructor(message: string) {
    super(message);
    this.name = "PathError";
  }
}

/**
 * Drops the commas that stand right before a closing `}` or `]`. String literals are copied as they
 * are, so a comma inside a string never changes.
 */
function dropTrailingCommas(text: string): string {
  let out = "";
  let index = 0;
  while (index < text.length) {
    const char = text[index] ?? "";
    if (char === '"') {
      let end = index + 1;
      while (end < text.length && text[end] !== '"') end += text[end] === "\\" ? 2 : 1;
      out += text.slice(index, end + 1);
      index = end + 1;
      continue;
    }
    if (char === ",") {
      const closing = /\s*[}\]]/y;
      closing.lastIndex = index + 1;
      if (closing.test(text)) {
        index += 1;
        continue;
      }
    }
    out += char;
    index += 1;
  }
  return out;
}

/**
 * Parses JSON with comments and trailing commas, as tsconfig files are written. Line and block
 * comments are removed, and trailing commas are dropped; the contents of strings are left as they
 * are.
 *
 * @param text JSON with comments.
 * @returns The parsed value.
 * @throws SyntaxError when the cleaned text is not JSON.
 * @example
 * parseJsonc('{ // comment\n "a": 1, }'); // { a: 1 }
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function parseJsonc(text: string): unknown {
  let out = "";
  let index = 0;
  while (index < text.length) {
    const char = text[index] ?? "";
    const next = text[index + 1] ?? "";
    if (char === '"') {
      let end = index + 1;
      while (end < text.length && text[end] !== '"') end += text[end] === "\\" ? 2 : 1;
      out += text.slice(index, end + 1);
      index = end + 1;
    } else if (char === "/" && next === "/") {
      while (index < text.length && text[index] !== "\n") index += 1;
    } else if (char === "/" && next === "*") {
      const end = text.indexOf("*/", index + 2);
      index = end === -1 ? text.length : end + 2;
    } else {
      out += char;
      index += 1;
    }
  }
  return JSON.parse(dropTrailingCommas(out));
}

/**
 * One `paths` entry of a tsconfig, resolved to absolute directories.
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface PathMapping {
  /** `@/*`. */
  readonly pattern: string;
  /** Absolute targets, `*` still in place. */
  readonly targets: readonly string[];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/** The `extends` links followed from one tsconfig: far beyond any real chain. */
const MAX_EXTENDS = 16;

/** The `paths` and `baseUrl` a tsconfig ends up with once its `extends` are merged in. */
interface PathOptions {
  readonly paths?: Record<string, unknown>;
  /** The folder of the config that declares `paths`. */
  readonly pathsDir?: string;
  /** Absolute. */
  readonly baseUrl?: string;
}

/** The file an `extends` entry names, or `undefined`: a path, or a package looked up in `node_modules`. */
function extendsFile(fs: ProjectFs, folder: string, entry: string): string | undefined {
  const candidates = (base: string): string[] =>
    base.endsWith(".json") ? [base] : [`${base}.json`, join(base, "tsconfig.json")];
  if (entry.startsWith(".") || isAbsolute(entry)) {
    return candidates(resolve(folder, entry)).find((file) => fs.exists(file));
  }
  for (const parent of ancestors(folder)) {
    const found = candidates(join(parent, "node_modules", entry)).find((file) => fs.exists(file));
    if (found !== undefined) return found;
  }
  return undefined;
}

/**
 * The `paths` and `baseUrl` of one tsconfig with its `extends` merged in, as TypeScript does: later
 * bases override earlier ones, the config itself overrides its bases, and `paths` is replaced as a
 * whole. `seen` holds the chain so far, so a cycle or a very long chain ends.
 */
function readOptions(
  fs: ProjectFs,
  file: string,
  label: string,
  seen: readonly string[],
): PathOptions | undefined {
  const text = fs.read(file);
  if (text === undefined) return undefined;
  let parsed: unknown;
  try {
    parsed = parseJsonc(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SchemaError(`${label} is not valid JSON: ${error.message}`);
    }
    throw error;
  }
  const config = asRecord(parsed);
  const options = asRecord(config?.["compilerOptions"]);
  const folder = dirname(file);
  let merged: PathOptions = {};
  const bases = [config?.["extends"]].flat();
  for (const entry of seen.length < MAX_EXTENDS ? bases : []) {
    const base = typeof entry === "string" ? extendsFile(fs, folder, entry) : undefined;
    if (base !== undefined && !seen.includes(base)) {
      merged = { ...merged, ...readOptions(fs, base, base, [...seen, base]) };
    }
  }
  const paths = asRecord(options?.["paths"]);
  const baseUrl = options?.["baseUrl"];
  return {
    ...merged,
    ...(paths !== undefined && { paths, pathsDir: folder }),
    ...(typeof baseUrl === "string" && { baseUrl: resolve(folder, baseUrl) }),
  };
}

/**
 * Reads the `compilerOptions.paths` of the project's tsconfig files (`tsconfig.json`,
 * `tsconfig.app.json`), following their `extends` (relative files and packages in `node_modules`).
 * Targets are resolved against `baseUrl` or the directory of the config that declares `paths`.
 *
 * @param fs The project filesystem.
 * @param root The project root.
 * @returns The mappings, first file first.
 * @example
 * readPathMappings(fs, "/app"); // [{ pattern: "@/*", targets: ["/app/src/*"] }]
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function readPathMappings(fs: ProjectFs, root: string): PathMapping[] {
  const mappings: PathMapping[] = [];
  for (const name of ["tsconfig.json", "tsconfig.app.json"]) {
    const file = join(root, name);
    const { paths, pathsDir, baseUrl } = readOptions(fs, file, name, [file]) ?? {};
    if (paths === undefined) continue;
    const base = baseUrl ?? pathsDir ?? root;
    for (const [pattern, targets] of Object.entries(paths)) {
      if (!Array.isArray(targets)) continue;
      mappings.push({
        pattern,
        targets: targets
          .filter((target): target is string => typeof target === "string")
          .map((target) => resolve(base, target)),
      });
    }
  }
  return mappings;
}

/**
 * Maps an import alias directory (`@/components/ui`) to an absolute directory using the tsconfig
 * mappings.
 *
 * @param alias The alias from `components.json`.
 * @param mappings From {@link readPathMappings}.
 * @returns The absolute directory path.
 * @throws PathError when no mapping covers the alias.
 * @example
 * aliasToDirectory("@/components/ui", [{ pattern: "@/*", targets: ["/app/src/*"] }]);
 * // "/app/src/components/ui"
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function aliasToDirectory(alias: string, mappings: readonly PathMapping[]): string {
  // TypeScript's rule: an exact pattern wins, otherwise the pattern with the longest prefix.
  let best: { readonly length: number; readonly directory: string } | undefined;
  for (const { pattern, targets } of mappings) {
    const target = targets[0];
    if (target === undefined) continue;
    const star = pattern.indexOf("*");
    if (star === -1) {
      if (pattern === alias) return target;
      continue;
    }
    const prefix = pattern.slice(0, star);
    const suffix = pattern.slice(star + 1);
    if (
      alias.startsWith(prefix) &&
      alias.endsWith(suffix) &&
      alias.length >= prefix.length + suffix.length &&
      (best === undefined || prefix.length > best.length)
    ) {
      const rest = alias.slice(prefix.length, alias.length - suffix.length);
      best = { length: prefix.length, directory: target.replace("*", rest) };
    }
  }
  if (best !== undefined) return best.directory;
  throw new PathError(
    `The alias "${alias}" is not covered by "paths" in tsconfig.json. Add, for example:\n` +
      '  "compilerOptions": { "paths": { "@/*": ["./src/*"] } }',
  );
}

/**
 * Resolves `target` against `root` and throws unless the result is inside `root`. This is the
 * single guard every write and delete goes through.
 *
 * @param root The project root (absolute).
 * @param target A path, absolute or relative to `root`.
 * @returns The normalized absolute path.
 * @throws PathError when the path escapes the project.
 * @example
 * resolveInside("/app", "src/a.ts"); // "/app/src/a.ts"
 * resolveInside("/app", "../x"); // throws
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function resolveInside(root: string, target: string): string {
  const absolute = resolve(root, target);
  const rel = relative(resolve(root), absolute);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new PathError(`Refusing to write outside the project: ${target}`);
  }
  return absolute;
}

/**
 * Like {@link resolveInside} but also follows symbolic links of the nearest existing ancestor, so
 * a symlinked directory cannot be used to write outside the project.
 *
 * @param fs The project filesystem.
 * @param root The project root.
 * @param target A path, absolute or relative to `root`.
 * @returns The normalized absolute path.
 * @throws PathError when the path, or its real location, is outside the project.
 * @example
 * resolveInsideReal(fs, "/app", "src/components/ui/button.tsx");
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function resolveInsideReal(fs: ProjectFs, root: string, target: string): string {
  const absolute = resolveInside(root, target);
  const real = fs.realpath(absolute);
  const realRoot = fs.realpath(resolve(root));
  const rel = relative(realRoot, real);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new PathError(`Refusing to write outside the project (symbolic link): ${target}`);
  }
  return absolute;
}
