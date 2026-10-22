import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runInit } from "../src/cli/commands";
import { project, removeProjects, VITE_PROJECT } from "./support/project";
import { indexOf, item, sourceOf } from "./support/registry";

afterEach(() => removeProjects());

const registry = sourceOf(indexOf(item("utils", { type: "lib", files: ["utils.ts"] })), {
  "registry/utils/utils.ts": "export const cn = (...value: string[]) => value.join(' ');\n",
});

const INIT = {
  overwrite: false,
  dryRun: false,
  yes: true,
  skipInstall: false,
  baseColor: undefined,
  css: undefined,
} as const;

describe("shadow-ui init, run again", () => {
  it("[UI-CLI-94] without flags, re-running init keeps a hand-edited components.json byte for byte (no --overwrite)", async () => {
    const edited = [
      "{",
      '  "$schema": "https://example.com/components.schema.json",',
      '  "framework": "vite",',
      '  "tailwind": { "css": "src/index.css", "baseColor": "neutral" },',
      '  "aliases": { "components": "@/components", "ui": "@/components/ui", "lib": "@/lib", "utils": "@/lib/utils", "hooks": "@/hooks" }',
      "}",
      "",
    ].join("\n");
    const p = project(registry, { ...VITE_PROJECT, "components.json": edited });
    expect(await runInit(p.ctx, INIT)).toBe(0);
    expect(readFileSync(join(p.root, "components.json"), "utf8")).toBe(edited);
    expect(p.out.join("\n")).toContain("kept       components.json");
  });
});
