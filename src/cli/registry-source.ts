/**
 * Where the CLI reads the registry from. The registry ships inside the package, so nothing is
 * downloaded: `registry.json` plus the files under `registry/` and `styles/`.
 * @packageDocumentation
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_COLORS, parseRegistryIndex, type RegistryIndex } from "./schema";

/**
 * Read access to the registry.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface RegistrySource {
  readonly index: RegistryIndex;
  /** The text of an item file listed in the index (`registry/button/button.tsx`). */
  readFile(path: string): string;
  /** One of the shipped stylesheets: `theme-core.css`, `animations.css`, `themes/<base>.css`. */
  readStyle(name: string): string;
}

/**
 * Builds a source from an index and two reader functions (tests use in-memory ones).
 *
 * @param index The parsed index.
 * @param read Reads a package-relative file.
 * @returns The source. Only files named in the index, and the known stylesheets, can be read.
 * @example
 * const source = createRegistrySource(index, (path) => files[path]);
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function createRegistrySource(
  index: RegistryIndex,
  read: (path: string) => string | undefined,
): RegistrySource {
  const listed = new Set(index.items.flatMap((item) => item.files.map((file) => file.path)));
  const styles = new Set([
    "theme-core.css",
    "animations.css",
    ...BASE_COLORS.map((base) => `themes/${base}.css`),
  ]);
  const fetch = (path: string): string => {
    const text = read(path);
    if (text === undefined)
      throw new Error(`The registry file "${path}" is missing from the package.`);
    return text;
  };
  return {
    index,
    readFile(path) {
      if (!listed.has(path)) throw new Error(`"${path}" is not a registry file.`);
      return fetch(path);
    },
    readStyle(name) {
      if (!styles.has(name)) throw new Error(`"${name}" is not a registry stylesheet.`);
      return fetch(`styles/${name}`);
    },
  };
}

/** The package root: the nearest ancestor of this file with the `@shadow-js/ui` package.json. */
function packageRoot(): string {
  let directory = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    const manifest = join(directory, "package.json");
    if (existsSync(manifest)) {
      const name = (JSON.parse(readFileSync(manifest, "utf8")) as { name?: unknown }).name;
      if (name === "@shadow-js/ui") return directory;
    }
    const parent = dirname(directory);
    if (parent === directory) throw new Error("Cannot locate the @shadow-js/ui package.");
    directory = parent;
  }
}

/**
 * Opens the registry that ships with this package.
 *
 * @param root Package root override (for tests).
 * @returns The source.
 * @throws SchemaError when `registry.json` is malformed, or an Error when it or a registry file cannot be read.
 * @example
 * const registry = loadRegistrySource();
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function loadRegistrySource(root: string = packageRoot()): RegistrySource {
  const index = parseRegistryIndex(JSON.parse(readFileSync(join(root, "registry.json"), "utf8")));
  return createRegistrySource(index, (path) => {
    const file = join(root, path);
    return existsSync(file) ? readFileSync(file, "utf8") : undefined;
  });
}
