import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { afterEach, describe, expect, it } from "vitest";
import { type AddFlags, runAdd } from "../src/cli/commands";
import { nodeFs } from "../src/cli/fs";
import { PathError, readPathMappings, resolveInsideReal } from "../src/cli/paths";
import { askYesNo } from "../src/cli/prompt";
import { SchemaError } from "../src/cli/schema";
import { project, removeProjects, VITE_PROJECT } from "./support/project";
import { indexOf, item, sourceOf } from "./support/registry";

const scratch: string[] = [];
afterEach(() => {
  removeProjects();
  for (const directory of scratch.splice(0)) rmSync(directory, { recursive: true, force: true });
});
function temp(): string {
  const directory = mkdtempSync(join(tmpdir(), "shadow-ui-review-"));
  scratch.push(directory);
  return directory;
}

const registry = sourceOf(
  indexOf(item("utils", { type: "lib", files: ["utils.ts"] }), item("button", { deps: ["utils"] })),
  {
    "registry/utils/utils.ts": "export const cn = 1;\n",
    "registry/button/button.tsx": "export const Button = 1;\n",
  },
);
const ADD: AddFlags = {
  overwrite: false,
  dryRun: false,
  yes: true,
  skipInstall: true,
  all: false,
  path: undefined,
};

describe("shadow-ui path safety and config errors", () => {
  it("[UI-REV-5] a dangling symlink at the target is followed, so a write cannot leave the project through it", () => {
    const root = temp();
    const outside = temp();
    const fs = nodeFs();
    mkdirSync(join(root, "src"));
    // The link's target does not exist yet; writeFileSync would create it outside the project.
    symlinkSync(join(outside, "created-by-write.txt"), join(root, "src", "button.tsx"));
    expect(() => resolveInsideReal(fs, root, "src/button.tsx")).toThrow(PathError);
    expect(fs.realpath(join(root, "src", "button.tsx"))).toBe(
      join(fs.realpath(outside), "created-by-write.txt"),
    );
  });

  it("[UI-REV-11] a dangling relative symlink inside a linked folder is read from the folder's real place", () => {
    const root = temp();
    const outside = temp();
    const fs = nodeFs();
    mkdirSync(join(outside, "deep"));
    symlinkSync(join(outside, "deep"), join(root, "linked"));
    // `../escape` from the real folder is `outside/escape`; read from the folder as written it would look inside.
    symlinkSync("../escape", join(outside, "deep", "dangling"));
    expect(fs.realpath(join(root, "linked", "dangling"))).toBe(
      join(fs.realpath(outside), "escape"),
    );
    expect(() => resolveInsideReal(fs, root, "linked/dangling")).toThrow(PathError);
  });

  it("[UI-REV-6] shadow-ui add refuses to write through a dangling symlink", async () => {
    const p = project(registry, {
      ...VITE_PROJECT,
      "components.json": JSON.stringify({ tailwind: { css: "src/index.css" } }),
    });
    const outside = temp();
    p.link("src/components/ui/button.tsx", join(outside, "created-by-add.txt"));
    expect(await runAdd(p.ctx, ["button"], ADD)).toBe(1);
    expect(p.err.join("\n")).toContain("symbolic link");
    expect(existsSync(join(outside, "created-by-add.txt"))).toBe(false);
  });

  it("[UI-REV-7] a tsconfig, package.json and components.json that start with a byte order mark still parse", async () => {
    const root = temp();
    const fs = nodeFs();
    fs.write(
      join(root, "tsconfig.json"),
      '﻿{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
    );
    expect(readPathMappings(fs, root)).toEqual([
      { pattern: "@/*", targets: [join(root, "src/*")] },
    ]);
    const p = project(registry, {
      ...VITE_PROJECT,
      "package.json": `\uFEFF${VITE_PROJECT["package.json"]}`,
      "components.json": `\uFEFF${JSON.stringify({ tailwind: { css: "src/index.css" } })}`,
    });
    expect(await runAdd(p.ctx, ["button"], ADD)).toBe(0);
  });

  it("[UI-REV-8] a tsconfig that is not JSON is reported as an invalid file, naming it", () => {
    const root = temp();
    const fs = nodeFs();
    fs.write(join(root, "tsconfig.json"), "{ nope");
    expect(() => readPathMappings(fs, root)).toThrow(SchemaError);
    expect(() => readPathMappings(fs, root)).toThrow(/tsconfig\.json is not valid JSON/);
  });

  it("[UI-REV-9] shadow-ui add with a broken tsconfig fails with an error line instead of crashing", async () => {
    const p = project(registry, {
      ...VITE_PROJECT,
      "tsconfig.json": "{ nope",
      "components.json": JSON.stringify({ tailwind: { css: "src/index.css" } }),
    });
    expect(await runAdd(p.ctx, ["button"], ADD)).toBe(1);
    expect(p.err.join("\n")).toContain("tsconfig.json is not valid JSON");
  });
});

describe("shadow-ui prompt", () => {
  it("[UI-REV-10] answers yes only for y or yes, and treats the end of input as no", async () => {
    const ask = async (typed: string | undefined): Promise<boolean> => {
      const input = new PassThrough();
      const output = new PassThrough();
      const pending = askYesNo("Go on?", input, output);
      input.end(typed);
      return pending;
    };
    expect(await ask("y\n")).toBe(true);
    expect(await ask("YES\n")).toBe(true);
    expect(await ask("n\n")).toBe(false);
    expect(await ask("\n")).toBe(false);
    // Ctrl-D: the input ends with no answer. Before the fix this promise never settled.
    expect(await ask(undefined)).toBe(false);
  });
});
