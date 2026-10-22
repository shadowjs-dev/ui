/**
 * Package manager detection and the install command line. npm is the default; pnpm, yarn and bun
 * are used when their lockfile (or the `packageManager` field) says so.
 * @packageDocumentation
 */
import { join } from "node:path";
import type { ProjectFs } from "./fs";

/**
 * A supported package manager.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/**
 * Detects the project's package manager: the `packageManager` field of `package.json` first, then
 * lockfiles, otherwise npm.
 *
 * @param fs The project filesystem.
 * @param root The project root.
 * @returns The package manager name.
 * @example
 * detectPackageManager(fs, "/app"); // "pnpm" when /app/pnpm-lock.yaml exists
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function detectPackageManager(fs: ProjectFs, root: string): PackageManager {
  const manifest = fs.read(join(root, "package.json"));
  if (manifest !== undefined) {
    try {
      const field = (JSON.parse(manifest) as { packageManager?: unknown }).packageManager;
      if (typeof field === "string") {
        const name = field.split("@")[0];
        if (name === "npm" || name === "pnpm" || name === "yarn" || name === "bun") return name;
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
  }
  if (fs.exists(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.exists(join(root, "yarn.lock"))) return "yarn";
  if (fs.exists(join(root, "bun.lock")) || fs.exists(join(root, "bun.lockb"))) return "bun";
  return "npm";
}

/**
 * The command and arguments that install `packages` as dependencies.
 *
 * @param manager The package manager.
 * @param packages Package specifiers (`clsx@2.1.1`).
 * @returns The executable and its arguments.
 * @example
 * installCommand("npm", ["clsx@2.1.1"]); // { command: "npm", args: ["install", "clsx@2.1.1"] }
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function installCommand(
  manager: PackageManager,
  packages: readonly string[],
): { readonly command: string; readonly args: readonly string[] } {
  switch (manager) {
    case "npm":
      return { command: "npm", args: ["install", ...packages] };
    case "pnpm":
      return { command: "pnpm", args: ["add", ...packages] };
    case "yarn":
      return { command: "yarn", args: ["add", ...packages] };
    case "bun":
      return { command: "bun", args: ["add", ...packages] };
  }
}
