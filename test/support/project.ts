/** A temporary project directory and a CLI context that records output and installs. */
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { CliContext } from "../../src/cli/commands";
import { nodeFs } from "../../src/cli/fs";
import type { PackageManager } from "../../src/cli/pm";
import type { RegistrySource } from "../../src/cli/registry-source";

export interface TestProject {
  readonly root: string;
  readonly ctx: CliContext;
  readonly out: string[];
  readonly err: string[];
  readonly questions: string[];
  readonly installs: Array<{ manager: PackageManager; packages: readonly string[] }>;
  write(path: string, content: string): void;
  link(path: string, target: string): void;
  cleanup(): void;
}

const created: string[] = [];

export function removeProjects(): void {
  for (const directory of created.splice(0)) rmSync(directory, { recursive: true, force: true });
}

export function project(
  registry: RegistrySource,
  files: Readonly<Record<string, string>>,
  options: { readonly answer?: boolean } = {},
): TestProject {
  const root = mkdtempSync(join(tmpdir(), "shadow-ui-"));
  created.push(root);
  const write = (path: string, content: string): void => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  };
  for (const [path, content] of Object.entries(files)) write(path, content);
  const out: string[] = [];
  const err: string[] = [];
  const questions: string[] = [];
  const installs: TestProject["installs"] = [];
  const ctx: CliContext = {
    cwd: root,
    fs: nodeFs(),
    registry,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
    confirm: async (question) => {
      questions.push(question);
      return options.answer === true;
    },
    install: async ({ manager, packages }) => {
      installs.push({ manager, packages });
    },
  };
  return {
    root,
    ctx,
    out,
    err,
    questions,
    installs,
    write,
    link(path, target) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      symlinkSync(target, join(root, path));
    },
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

/** A minimal Vite + ShadowJS project. */
export const VITE_PROJECT: Readonly<Record<string, string>> = {
  "package.json": JSON.stringify({
    name: "app",
    dependencies: { "@shadow-js/core": "1.0.0", "@shadow-js/web": "1.0.0" },
    devDependencies: { vite: "8.0.0", "@shadow-js/vite": "1.0.0" },
  }),
  "tsconfig.json": `{
  // comments are allowed in tsconfig
  "compilerOptions": { "paths": { "@/*": ["./src/*"], }, },
}`,
  "src/index.css": '@import "tailwindcss";\n\nbody { margin: 0; }\n',
};
