/**
 * Review round seven: `init` writes nothing when a path is refused, alias mapping picks the most
 * specific pattern and follows `extends`, the package manager is found in a parent workspace, and
 * `remove` keeps the files the user edited.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { type AddFlags, runAdd, runInit, runRemove } from "../src/cli/commands";
import { nodeFs } from "../src/cli/fs";
import { Report } from "../src/cli/json";
import { aliasToDirectory, readPathMappings } from "../src/cli/paths";
import { detectPackageManager } from "../src/cli/pm";
import { project, removeProjects, VITE_PROJECT } from "./support/project";
import { indexOf, item, sourceOf } from "./support/registry";

const scratch: string[] = [];
afterEach(() => {
  removeProjects();
  for (const directory of scratch.splice(0)) rmSync(directory, { recursive: true, force: true });
});

/** A scratch directory with the given files (paths relative to it). */
function tree(files: Readonly<Record<string, string>>): string {
  const root = mkdtempSync(join(tmpdir(), "shadow-ui-r7-"));
  scratch.push(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

const registry = sourceOf(
  indexOf(item("utils", { type: "lib", files: ["utils.ts"] }), item("button", { deps: ["utils"] })),
  {
    "registry/utils/utils.ts": "export const cn = 1;\n",
    "registry/button/button.tsx": "export const Button = 1;\n",
  },
);

const INIT = {
  overwrite: false,
  dryRun: false,
  yes: true,
  skipInstall: true,
  baseColor: undefined,
  css: undefined,
} as const;

const ADD: AddFlags = { ...INIT, all: false, path: undefined };

describe("shadow-ui init with a refused path", () => {
  it("[UI-R7-2] a stylesheet outside the project exits 1 and writes no file, so a later init works", async () => {
    const p = project(registry, VITE_PROJECT);
    expect(await runInit(p.ctx, { ...INIT, css: "../outside.css" })).toBe(1);
    expect(p.err.join("\n")).toContain("outside the project");
    expect(existsSync(join(p.root, "components.json"))).toBe(false);
    expect(existsSync(join(p.root, "src/lib/utils.ts"))).toBe(false);
    expect(await runInit(p.ctx, INIT)).toBe(0);
    expect(existsSync(join(p.root, "components.json"))).toBe(true);
  });
});

describe("alias mapping", () => {
  it("[UI-R7-3] the longest matching prefix wins, whatever the order of the patterns", () => {
    const wide = { pattern: "@/*", targets: ["/app/src/*"] };
    const narrow = { pattern: "@/components/*", targets: ["/app/ui-kit/*"] };
    expect(aliasToDirectory("@/components/ui", [wide, narrow])).toBe("/app/ui-kit/ui");
    expect(aliasToDirectory("@/components/ui", [narrow, wide])).toBe("/app/ui-kit/ui");
    expect(aliasToDirectory("@/lib", [narrow, wide])).toBe("/app/src/lib");
    expect(
      aliasToDirectory("@/components/ui", [wide, { pattern: "@/components/ui", targets: ["/x"] }]),
    ).toBe("/x");
  });

  it("[UI-R7-3] add button writes into the folder of the most specific pattern", async () => {
    const p = project(registry, {
      ...VITE_PROJECT,
      "tsconfig.json": JSON.stringify({
        compilerOptions: { paths: { "@/*": ["./src/*"], "@/components/*": ["./kit/*"] } },
      }),
    });
    await runInit(p.ctx, INIT);
    expect(await runAdd(p.ctx, ["button"], ADD)).toBe(0);
    expect(existsSync(join(p.root, "kit/ui/button.tsx"))).toBe(true);
    expect(existsSync(join(p.root, "src/components/ui/button.tsx"))).toBe(false);
  });
});

describe("tsconfig extends", () => {
  const read = (root: string) => readPathMappings(nodeFs(), root);

  it("[UI-R7-4] paths in a relative base config are found, resolved from the config that declares them", () => {
    const root = tree({
      "tsconfig.json": '{ "extends": "./config/base.json" }',
      "config/base.json": '{ "compilerOptions": { "paths": { "@/*": ["../src/*"] } } }',
    });
    expect(read(root)).toEqual([{ pattern: "@/*", targets: [join(root, "src/*")] }]);
  });

  it("[UI-R7-4] a paths of the extending config replaces the base one; a base baseUrl is kept", () => {
    const root = tree({
      "tsconfig.json":
        '{ "extends": "./config/base", "compilerOptions": { "paths": { "~/*": ["lib/*"] } } }',
      "config/base.json":
        '{ "compilerOptions": { "baseUrl": "..", "paths": { "@/*": ["src/*"] } } }',
    });
    expect(read(root)).toEqual([{ pattern: "~/*", targets: [join(root, "lib/*")] }]);
  });

  it("[UI-R7-4] a package specifier is looked up in node_modules, and an array of bases merges in order", () => {
    const root = tree({
      "tsconfig.json": '{ "extends": ["@kit/config/tsconfig.json", "./extra.json"] }',
      "extra.json": '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
      "node_modules/@kit/config/tsconfig.json":
        '{ "compilerOptions": { "paths": { "x/*": ["./y/*"] } } }',
    });
    expect(read(root)).toEqual([{ pattern: "@/*", targets: [join(root, "src/*")] }]);
    const only = tree({
      "tsconfig.json": '{ "extends": "@kit/config" }',
      "node_modules/@kit/config/tsconfig.json":
        '{ "compilerOptions": { "paths": { "x/*": ["./y/*"] } } }',
    });
    expect(read(only)).toEqual([
      { pattern: "x/*", targets: [join(only, "node_modules/@kit/config/y/*")] },
    ]);
  });

  it("[UI-R7-5] a cycle of extends ends, and a chain longer than the bound stops following", () => {
    const cycle = tree({
      "tsconfig.json": '{ "extends": "./a.json" }',
      "a.json":
        '{ "extends": "./tsconfig.json", "compilerOptions": { "paths": { "@/*": ["./s/*"] } } }',
    });
    expect(read(cycle)).toEqual([{ pattern: "@/*", targets: [join(cycle, "s/*")] }]);
    const files: Record<string, string> = { "tsconfig.json": '{ "extends": "./c0.json" }' };
    for (let index = 0; index < 40; index += 1) {
      files[`c${index}.json`] = `{ "extends": "./c${index + 1}.json" }`;
    }
    files["c40.json"] = '{ "compilerOptions": { "paths": { "@/*": ["./s/*"] } } }';
    expect(read(tree(files))).toEqual([]);
  });
});

describe("package manager in a workspace", () => {
  const fs = nodeFs();

  it("[UI-R7-6] a lockfile in a parent folder decides for a package inside it, and the nearest one wins", () => {
    const root = tree({
      "pnpm-lock.yaml": "",
      "packages/app/package.json": "{}",
      "packages/other/package.json": "{}",
      "packages/other/yarn.lock": "",
    });
    expect(detectPackageManager(fs, join(root, "packages/app"))).toBe("pnpm");
    expect(detectPackageManager(fs, join(root, "packages/other"))).toBe("yarn");
  });

  it("[UI-R7-6] the packageManager field of a parent package.json decides, and a nearer field beats a parent lockfile", () => {
    const root = tree({
      "package.json": '{ "packageManager": "bun@1.2.0" }',
      "apps/web/package.json": "{}",
      "apps/pnpm/package.json": '{ "packageManager": "pnpm@9.0.0" }',
      "apps/pnpm/yarn.lock": "",
    });
    expect(detectPackageManager(fs, join(root, "apps/web"))).toBe("bun");
    expect(detectPackageManager(fs, join(root, "apps/pnpm"))).toBe("pnpm");
  });
});

describe("shadow-ui remove and edited files", () => {
  async function withButton() {
    const p = project(registry, VITE_PROJECT);
    await runInit(p.ctx, INIT);
    await runAdd(p.ctx, ["button"], ADD);
    p.out.length = 0;
    return p;
  }

  it("[UI-R7-7] a file that differs from the registry is kept with exit 1 and named; --force removes it", async () => {
    const p = await withButton();
    const file = join(p.root, "src/components/ui/button.tsx");
    writeFileSync(file, "export const Button = 'mine';\n");
    const report = new Report();
    expect(runRemove({ ...p.ctx, report }, ["button"], { dryRun: false, force: false })).toBe(1);
    expect(readFileSync(file, "utf8")).toBe("export const Button = 'mine';\n");
    expect(p.out.join("\n")).toContain("kept       src/components/ui/button.tsx");
    expect(p.err.join("\n")).toContain("1 file(s) differ from the registry and were kept");
    expect(report.data["kept"]).toEqual([{ name: "button", path: "src/components/ui/button.tsx" }]);
    expect(report.data["removed"]).toEqual([]);
    expect(runRemove(p.ctx, ["button"], { dryRun: false, force: true })).toBe(0);
    expect(existsSync(file)).toBe(false);
  });
});
