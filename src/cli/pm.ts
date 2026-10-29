/**
 * Package manager detection and the install command line. npm is the default; pnpm, yarn and bun
 * are used when their lockfile (or the `packageManager` field) says so, in the project or a parent folder.
 * @packageDocumentation
 */
import { join } from "node:path";
import { ancestors, type ProjectFs } from "./fs";

/**
 * A supported package manager.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/** The package manager one folder says it uses (field first, then lockfiles), or `undefined`. */
function managerOf(fs: ProjectFs, folder: string): PackageManager | undefined {
  const manifest = fs.read(join(folder, "package.json"));
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
  if (fs.exists(join(folder, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.exists(join(folder, "yarn.lock"))) return "yarn";
  if (fs.exists(join(folder, "bun.lock")) || fs.exists(join(folder, "bun.lockb"))) return "bun";
  if (fs.exists(join(folder, "package-lock.json"))) return "npm";
  return undefined;
}

/**
 * Detects the project's package manager. In the project folder and then each parent folder (a
 * package inside a workspace is managed from the workspace root) it reads the `packageManager`
 * field of `package.json`, then the lockfiles; the nearest folder that says anything wins, and npm
 * is the default.
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
  for (const folder of ancestors(root)) {
    const manager = managerOf(fs, folder);
    if (manager !== undefined) return manager;
  }
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
