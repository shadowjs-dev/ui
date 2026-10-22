/**
 * The filesystem the CLI works on, as an interface so commands are tested against a temp
 * directory or an in-memory tree, and so every path goes through one place.
 * @packageDocumentation
 */
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

/**
 * Synchronous file operations on absolute paths.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface ProjectFs {
  /** Whether a file or directory exists. */
  exists(path: string): boolean;
  /** The file's text, or `undefined` when it does not exist. */
  read(path: string): string | undefined;
  /** Writes a file, creating parent directories. */
  write(path: string, content: string): void;
  /** Deletes a file if it exists. */
  remove(path: string): void;
  /** The real path of `path`, resolving symbolic links of its nearest existing ancestor. */
  realpath(path: string): string;
}

/**
 * The real filesystem.
 *
 * @returns A {@link ProjectFs} over `node:fs`.
 * @example
 * const fs = nodeFs();
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function nodeFs(): ProjectFs {
  return {
    exists: (path) => existsSync(path),
    read(path) {
      try {
        return readFileSync(path, "utf8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
        throw error;
      }
    },
    write(path, content) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    },
    remove(path) {
      rmSync(path, { force: true });
    },
    realpath(path) {
      // Walk up to the nearest ancestor that exists, resolve it, and re-attach the missing tail.
      const tail: string[] = [];
      let current = path;
      while (!existsSync(current)) {
        const parent = dirname(current);
        if (parent === current) return path;
        tail.unshift(basename(current));
        current = parent;
      }
      return join(realpathSync(current), ...tail);
    },
  };
}
