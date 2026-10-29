import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { type AddFlags, runAdd } from "../src/cli/commands";
import { project, removeProjects, VITE_PROJECT } from "./support/project";
import { indexOf, item, sourceOf } from "./support/registry";

afterEach(() => removeProjects());

const registry = sourceOf(
  indexOf(
    item("utils", { type: "lib", files: ["utils.ts"] }),
    item("button", { deps: ["utils"] }),
    item("dialog", { deps: ["button"] }),
  ),
  {
    "registry/utils/utils.ts": "export const cn = 1;\n",
    "registry/button/button.tsx": 'import { cn } from "@/lib/utils";\nexport const Button = cn;\n',
    "registry/dialog/dialog.tsx": [
      'import { Button } from "@/components/ui/button";',
      'export { Button as Again } from "@/components/ui/button";',
      'export const later = () => import("@/components/ui/button");',
      'export const text = "@/components/ui/button";',
      "export const Dialog = Button;",
      "",
    ].join("\n"),
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
const read = (root: string, path: string): string => readFileSync(join(root, path), "utf8");
const fresh = () =>
  project(registry, {
    ...VITE_PROJECT,
    "components.json": JSON.stringify({ tailwind: { css: "src/index.css" } }),
  });

describe("shadow-ui add --path", () => {
  it("[UI-R2-16] components copied to another directory import each other from where they are", async () => {
    const p = fresh();
    expect(await runAdd(p.ctx, ["dialog"], { ...ADD, path: "src/kit" })).toBe(0);
    const dialog = read(p.root, "src/kit/dialog.tsx");
    expect(dialog).toContain('import { Button } from "./button";');
    expect(dialog).toContain('export { Button as Again } from "./button";');
    expect(dialog).toContain('import("./button")');
    // A string that is not a module specifier is left alone.
    expect(dialog).toContain('export const text = "@/components/ui/button";');
    // Files that are not in the directory keep the alias.
    expect(read(p.root, "src/kit/button.tsx")).toContain('from "@/lib/utils"');
  });

  it("[UI-R2-16] a nested --path is relative too, and a path that is the alias target keeps the alias", async () => {
    const nested = fresh();
    await runAdd(nested.ctx, ["dialog"], { ...ADD, path: "src/deep/er/kit" });
    expect(read(nested.root, "src/deep/er/kit/dialog.tsx")).toContain('from "./button"');
    const same = fresh();
    await runAdd(same.ctx, ["dialog"], { ...ADD, path: "src/components/ui" });
    expect(read(same.root, "src/components/ui/dialog.tsx")).toContain(
      'from "@/components/ui/button"',
    );
    const plain = fresh();
    await runAdd(plain.ctx, ["dialog"], ADD);
    expect(read(plain.root, "src/components/ui/dialog.tsx")).toContain(
      'from "@/components/ui/button"',
    );
  });

  it("[UI-R2-16] with a custom ui alias, only a --path elsewhere turns imports relative", async () => {
    const p = project(registry, {
      ...VITE_PROJECT,
      "components.json": JSON.stringify({
        tailwind: { css: "src/index.css" },
        aliases: { ui: "@/kit" },
      }),
    });
    await runAdd(p.ctx, ["dialog"], ADD);
    expect(read(p.root, "src/kit/dialog.tsx")).toContain('from "@/kit/button"');
    await runAdd(p.ctx, ["dialog"], { ...ADD, overwrite: true, path: "src/other" });
    expect(read(p.root, "src/other/dialog.tsx")).toContain('from "./button"');
  });
});
