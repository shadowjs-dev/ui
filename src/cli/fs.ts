/**
 * The filesystem the CLI works on, as an interface so commands are tested against a temp
 * directory or an in-memory tree, and so every path goes through one place.
 * @packageDocumentation
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

/** Symbolic links followed while resolving one path; the same bound the operating system uses. */
const MAX_LINK_HOPS = 40;

/** Folders `ancestors` climbs at most: far beyond any real project, so a path loop cannot spin. */
const MAX_LEVELS = 64;

/**
 * `start` and its parent folders up to the filesystem root, nearest first (at most 64).
 *
 * @param start An absolute folder.
 * @returns The folders, `start` first.
 * @example
 * ancestors("/a/b"); // ["/a/b", "/a", "/"]
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function ancestors(start: string): string[] {
  const folders = [start];
  for (let folder = dirname(start); folders.length < MAX_LEVELS; folder = dirname(folder)) {
    if (folder === folders[folders.length - 1]) break;
    folders.push(folder);
  }
  return folders;
}

/** Whether a failed file call means "nothing is there" (or a file stands where a directory should). */
function isMissing(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException).code;
  return code === "ENOENT" || code === "ENOTDIR";
}

/**
 * The real path of `path`, where the part that does not exist yet is kept as written. A symbolic
 * link whose target is missing is followed to that target: a write through it would create the
 * target, so the guard has to see where it is.
 */
function resolveReal(path: string, hops: number): string {
  try {
    return realpathSync(path);
  } catch (error) {
    if (!isMissing(error)) throw error;
  }
  let link: string | undefined;
  try {
    link = readlinkSync(path);
  } catch (error) {
    // EINVAL: the path exists but is not a link. Missing: no entry at all.
    if (!isMissing(error) && (error as NodeJS.ErrnoException).code !== "EINVAL") throw error;
  }
  if (link !== undefined) {
    if (hops >= MAX_LINK_HOPS) {
      throw Object.assign(new Error(`Too many symbolic links: ${path}`), { code: "ELOOP" });
    }
    // A relative target is read from the link's real folder, as the kernel does, not from the folder as written:
    // through a linked folder, `..` climbs out of the folder the link points into.
    return resolveReal(resolve(resolveReal(dirname(path), hops + 1), link), hops + 1);
  }
  const parent = dirname(path);
  if (parent === path) return path;
  return join(resolveReal(parent, hops), basename(path));
}

/**
 * Synchronous file operations on absolute paths.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface ProjectFs {
  /** Whether a file or directory exists. */
  exists(path: string): boolean;
  /** The file's text without a leading byte order mark, or `undefined` when it does not exist. */
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
        // A byte order mark (PowerShell and some Windows editors write one) is not part of the text:
        // JSON.parse rejects it, so package.json, components.json and tsconfig would not parse.
        return readFileSync(path, "utf8").replace(/^\uFEFF/, "");
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
      return resolveReal(path, 0);
    },
  };
}
