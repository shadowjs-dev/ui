/**
 * The `--json` contract of `shadow-ui`, run in process against a temp project: the envelope helper, then the facts each
 * command puts in `data`, the codes of its failures, and the rules that hold for all of them (stdout is the one document,
 * nothing is asked, the installer's output goes to stderr).
 *
 * - UI-JSON-01 the envelope has the keys schema, command, ok, data, warnings (and error exactly when ok is false).
 * - UI-JSON-02 list: `{ initialized, items }` with the `installed` mark of each item.
 * - UI-JSON-03 init: the files with their actions, the config, the next steps; a dry run writes nothing.
 * - UI-JSON-04 add: requested, dependencies, files with actions, installs; a differing file is kept with its diff, exit 1.
 * - UI-JSON-05 diff: one entry per component with its status; a difference is exit 1 with SHADOW_UI_DIFFERS.
 * - UI-JSON-06 remove: the removed files; a component another one uses is SHADOW_UI_IN_USE.
 * - UI-JSON-07 every failure has a SHADOW_UI_ code, the message, and the same exit code as without --json.
 * - UI-JSON-08 nothing is asked: a differing file is kept without --overwrite, whatever the terminal says.
 * - UI-JSON-09 human lines never reach stdout; the installer is told to send its output to stderr.
 * - UI-JSON-10 an unexpected exception is a JSON failure too.
 * - UI-JSON-11 completion, help and version are documents as well.
 * - UI-JSON-12 every code the sources print is in the lists, and every listed code is printed somewhere.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  ERROR_CODES,
  jsonFailure,
  jsonSuccess,
  jsonText,
  Report,
  WARNING_CODES,
  wantsJson,
} from "../src/cli/json";
import { main } from "../src/cli/main";
import { project, removeProjects, type TestProject, VITE_PROJECT } from "./support/project";
import { indexOf, item, sourceOf } from "./support/registry";

afterEach(() => removeProjects());

const index = indexOf(
  item("utils", { type: "lib", files: ["utils.ts"], packages: { clsx: "2.1.1" } }),
  item("button", { deps: ["utils"], packages: { "class-variance-authority": "0.7.1" } }),
  item("dialog", { deps: ["button", "utils"], animations: true }),
  item("badge", { deps: ["utils"] }),
);
const registry = sourceOf(index, {
  "registry/utils/utils.ts": 'import { clsx } from "clsx";\nexport const cn = clsx;\n',
  "registry/button/button.tsx": 'import { cn } from "@/lib/utils";\nexport const Button = cn;\n',
  "registry/dialog/dialog.tsx":
    'import { Button } from "@/components/ui/button";\nexport const Dialog = Button;\n',
  "registry/badge/badge.tsx": 'import { cn } from "@/lib/utils";\nexport const Badge = cn;\n',
});

interface Doc {
  readonly schema: number;
  readonly command: string;
  readonly ok: boolean;
  readonly data: Record<string, unknown>;
  readonly warnings: readonly { readonly code: string; readonly message: string }[];
  readonly error?: { readonly code: string; readonly message: string };
}

/** Runs the command with --json, and checks that stdout is exactly one document. */
async function json(p: TestProject, ...argv: string[]): Promise<{ code: number; doc: Doc }> {
  p.out.length = 0;
  const code = await main([...argv, "--json"], () => p.ctx);
  expect(p.out, "stdout holds one document").toHaveLength(1);
  const doc = JSON.parse(p.out[0] ?? "") as Doc;
  expect(Object.keys(doc).slice(0, 5)).toEqual(["schema", "command", "ok", "data", "warnings"]);
  expect(doc.schema).toBe(1);
  expect(doc.ok).toBe(code === 0);
  if (doc.ok) expect(doc.error).toBeUndefined();
  else expect(doc.error?.code).toMatch(/^SHADOW_UI_[A-Z]+(?:_[A-Z]+)*$/);
  return { code, doc };
}

async function ready(): Promise<TestProject> {
  const p = project(registry, VITE_PROJECT);
  await main(["init", "--yes", "--skip-install"], () => p.ctx);
  return p;
}

interface FileEntry {
  readonly path: string;
  readonly action: string;
  readonly diff?: string;
}

/** The text of a source file without the code lists of json.ts, which name every code and so prove nothing. */
function withoutLists(text: string): string {
  return text.replace(/export const (?:ERROR|WARNING)_CODES = \[[\s\S]*?\] as const;/g, "");
}

describe("shadow-ui --json", () => {
  it("[UI-JSON-01] the envelope has the keys schema, command, ok, data, warnings and an error only on failure", () => {
    const ok = jsonSuccess("shadow-ui list", { items: [] }, [
      { code: "SHADOW_UI_X", message: "m" },
    ]);
    expect(Object.keys(ok)).toEqual(["schema", "command", "ok", "data", "warnings"]);
    const bad = jsonFailure("shadow-ui add", { code: "SHADOW_UI_NO_CONFIG", message: "m" });
    expect(Object.keys(bad)).toEqual(["schema", "command", "ok", "data", "warnings", "error"]);
    expect(bad).toMatchObject({ ok: false, data: {}, warnings: [] });
    expect(jsonText(ok).endsWith("}")).toBe(true);
    expect(JSON.parse(jsonText(ok, true))).toEqual(ok);
    expect(jsonText(ok, true).includes("\n")).toBe(false);
    expect(wantsJson(["list", "--json"])).toBe(true);
    expect(wantsJson(["list", "--", "--json"])).toBe(false);
    for (const code of ERROR_CODES) expect(code).toMatch(/^SHADOW_UI_[A-Z]+(?:_[A-Z]+)*$/);
    const report = new Report();
    report.set("a", 1);
    report.push("rows", { n: 1 });
    report.push("rows", { n: 2 });
    report.warn("SHADOW_UI_W", "careful");
    report.fail("SHADOW_UI_IN_USE", "first");
    report.fail("SHADOW_UI_DIFFERS", "second");
    expect(report.data).toEqual({ a: 1, rows: [{ n: 1 }, { n: 2 }] });
    expect(report.warnings).toEqual([{ code: "SHADOW_UI_W", message: "careful" }]);
    expect(report.error).toEqual({ code: "SHADOW_UI_IN_USE", message: "first second" });
  });

  it("[UI-JSON-02] list gives the items and marks the ones in the project", async () => {
    const p = await ready();
    const before = await json(p, "list");
    expect(before.doc.command).toBe("shadow-ui list");
    expect(before.doc.data["initialized"]).toBe(true);
    await main(["add", "badge", "--yes", "--skip-install"], () => p.ctx);
    const { doc } = await json(p, "ls");
    expect(doc.command).toBe("shadow-ui list");
    const items = doc.data["items"] as {
      name: string;
      type: string;
      installed: boolean;
      description: string;
    }[];
    expect(items.map((entry) => entry.name)).toEqual(["utils", "button", "dialog", "badge"]);
    expect(items.find((entry) => entry.name === "badge")).toMatchObject({
      type: "ui",
      installed: true,
      description: "The badge item.",
    });
    expect(items.find((entry) => entry.name === "dialog")?.installed).toBe(false);
    const bare = project(registry, {});
    const none = await json(bare, "list");
    expect(none.doc.data["initialized"]).toBe(false);
  });

  it("[UI-JSON-03] init lists the files with their actions, the config and the next steps; a dry run writes nothing", async () => {
    const p = project(registry, VITE_PROJECT);
    const dry = await json(p, "init", "--dry-run", "--skip-install");
    expect(dry.code).toBe(0);
    expect(dry.doc.data["dryRun"]).toBe(true);
    expect(existsSync(join(p.root, "components.json"))).toBe(false);
    const run = await json(p, "init", "--yes", "--skip-install", "--base-color", "zinc");
    expect(run.code).toBe(0);
    expect(run.doc.command).toBe("shadow-ui init");
    expect(run.doc.data["dryRun"]).toBe(false);
    expect(run.doc.data["config"]).toMatchObject({ baseColor: "zinc", css: "src/index.css" });
    const files = run.doc.data["files"] as FileEntry[];
    expect(files).toContainEqual({ path: "components.json", action: "create" });
    expect(
      files.some((entry) => entry.path === "src/lib/utils.ts" && entry.action === "create"),
    ).toBe(true);
    expect(files.find((entry) => entry.path === "src/index.css")?.action).toBe("update");
    const steps = run.doc.data["nextSteps"] as string[];
    expect(steps.length).toBeGreaterThan(2);
    expect(steps.some((step) => step.includes("shadow-ui add"))).toBe(true);
    const again = await json(p, "init", "--yes", "--skip-install", "--base-color", "zinc");
    const unchanged = (again.doc.data["files"] as FileEntry[]).find(
      (entry) => entry.path === "components.json",
    );
    expect(unchanged?.action).toBe("unchanged");
  });

  it("[UI-JSON-04] add lists what it asked for, what came with it, each file's action and the installs", async () => {
    const p = await ready();
    const run = await json(p, "add", "dialog", "--yes", "--skip-install");
    expect(run.code).toBe(0);
    expect(run.doc.command).toBe("shadow-ui add");
    expect(run.doc.data).toMatchObject({
      dryRun: false,
      requested: ["dialog"],
      dependencies: ["utils", "button"],
    });
    const files = run.doc.data["files"] as FileEntry[];
    expect(files.map((entry) => `${entry.action} ${entry.path}`)).toEqual([
      "unchanged src/lib/utils.ts",
      "create src/components/ui/button.tsx",
      "create src/components/ui/dialog.tsx",
    ]);
    const installs = run.doc.data["installs"] as {
      status: string;
      packages: string[];
      command: string;
    }[];
    expect(installs).toHaveLength(1);
    expect(installs[0]).toMatchObject({ status: "skipped" });
    expect(installs[0]?.command).toContain("class-variance-authority@0.7.1");

    const bare = project(registry, VITE_PROJECT);
    bare.write("components.json", JSON.stringify({ tailwind: { css: "src/index.css" } }));
    const animated = await json(bare, "add", "dialog", "--yes", "--skip-install");
    expect(animated.doc.warnings.map((warning) => warning.code)).toContain(
      "SHADOW_UI_NO_ANIMATIONS",
    );
    expect(bare.err.join("\n")).toContain("these components animate");

    writeFileSync(join(p.root, "src/components/ui/button.tsx"), "export const Button = 1;\n");
    const kept = await json(p, "add", "button", "--yes", "--skip-install");
    expect(kept.code).toBe(1);
    expect(kept.doc.error?.code).toBe("SHADOW_UI_FILES_DIFFER");
    const keptFile = (kept.doc.data["files"] as FileEntry[]).find(
      (entry) => entry.action === "kept",
    );
    expect(keptFile?.path).toBe("src/components/ui/button.tsx");
    expect(keptFile?.diff).toContain("--- a/src/components/ui/button.tsx (yours)");

    const replaced = await json(p, "add", "button", "--overwrite", "--skip-install");
    expect(replaced.code).toBe(0);
    expect((replaced.doc.data["files"] as FileEntry[]).map((entry) => entry.action)).toContain(
      "overwrite",
    );

    const dry = await json(p, "add", "badge", "--dry-run", "--skip-install");
    expect(dry.doc.data["dryRun"]).toBe(true);
    expect(existsSync(join(p.root, "src/components/ui/badge.tsx"))).toBe(false);
  });

  it("[UI-JSON-05] diff gives one entry per component with its status, and exits 1 on a difference", async () => {
    const p = await ready();
    await main(["add", "button", "--yes", "--skip-install"], () => p.ctx);
    const same = await json(p, "diff", "button");
    expect(same.code).toBe(0);
    expect(same.doc.data).toMatchObject({
      checked: 1,
      differing: 0,
      components: [{ name: "button", path: "src/components/ui/button.tsx", status: "up-to-date" }],
    });
    writeFileSync(join(p.root, "src/components/ui/button.tsx"), "export const Button = 1;\n");
    const differs = await json(p, "diff");
    expect(differs.code).toBe(1);
    expect(differs.doc.error?.code).toBe("SHADOW_UI_DIFFERS");
    const entry = (
      differs.doc.data["components"] as { name: string; status: string; diff?: string }[]
    ).find((component) => component.name === "button");
    expect(entry?.status).toBe("differs");
    expect(entry?.diff).toContain("+++ b/src/components/ui/button.tsx (registry)");
    const missing = await json(p, "diff", "badge");
    expect(missing.code).toBe(1);
    expect((missing.doc.data["components"] as { status: string }[])[0]?.status).toBe("missing");
  });

  it("[UI-JSON-06] remove lists the removed files, and refuses a component another one uses", async () => {
    const p = await ready();
    await main(["add", "dialog", "--yes", "--skip-install"], () => p.ctx);
    const blocked = await json(p, "remove", "button");
    expect(blocked.code).toBe(1);
    expect(blocked.doc.error?.code).toBe("SHADOW_UI_IN_USE");
    expect(blocked.doc.data["blocked"]).toEqual([{ name: "button", usedBy: ["dialog"] }]);
    const dry = await json(p, "rm", "dialog", "--dry-run");
    expect(dry.doc.command).toBe("shadow-ui remove");
    expect(dry.doc.data).toMatchObject({
      dryRun: true,
      removed: [{ name: "dialog", path: "src/components/ui/dialog.tsx" }],
    });
    expect(existsSync(join(p.root, "src/components/ui/dialog.tsx"))).toBe(true);
    const real = await json(p, "remove", "dialog");
    expect(real.code).toBe(0);
    expect(existsSync(join(p.root, "src/components/ui/dialog.tsx"))).toBe(false);
  });

  it("[UI-JSON-07] every failure has a SHADOW_UI_ code and the exit code it has without --json", async () => {
    const rows: readonly {
      argv: string[];
      files: Record<string, string>;
      code: string;
      command: string;
    }[] = [
      { argv: ["bogus"], files: {}, code: "SHADOW_UI_UNKNOWN_COMMAND", command: "shadow-ui" },
      { argv: ["--nope"], files: {}, code: "SHADOW_UI_UNKNOWN_OPTION", command: "shadow-ui" },
      { argv: ["--cwd"], files: {}, code: "SHADOW_UI_INVALID_OPTION", command: "shadow-ui" },
      { argv: [], files: {}, code: "SHADOW_UI_MISSING_COMMAND", command: "shadow-ui" },
      { argv: ["init"], files: {}, code: "SHADOW_UI_NO_PROJECT", command: "shadow-ui init" },
      {
        argv: ["add", "button"],
        files: { "package.json": "{}" },
        code: "SHADOW_UI_NO_CONFIG",
        command: "shadow-ui add",
      },
      {
        argv: ["diff"],
        files: { "package.json": "{}" },
        code: "SHADOW_UI_NO_CONFIG",
        command: "shadow-ui diff",
      },
      {
        argv: ["remove", "button"],
        files: { "package.json": "{}" },
        code: "SHADOW_UI_NO_CONFIG",
        command: "shadow-ui remove",
      },
      {
        argv: ["init", "--base-color", "nope"],
        files: VITE_PROJECT,
        code: "SHADOW_UI_INVALID_BASE_COLOR",
        command: "shadow-ui init",
      },
      {
        argv: ["init"],
        files: { "package.json": "{ nope" },
        code: "SHADOW_UI_INVALID_FILE",
        command: "shadow-ui init",
      },
      {
        argv: ["completion"],
        files: {},
        code: "SHADOW_UI_INVALID_SHELL",
        command: "shadow-ui completion",
      },
      {
        argv: ["completion", "tcsh"],
        files: {},
        code: "SHADOW_UI_INVALID_SHELL",
        command: "shadow-ui completion",
      },
    ];
    for (const row of rows) {
      const p = project(registry, row.files);
      const { code, doc } = await json(p, ...row.argv);
      expect(code, row.argv.join(" ")).toBe(1);
      expect(doc.error?.code, row.argv.join(" ")).toBe(row.code);
      expect(doc.command, row.argv.join(" ")).toBe(row.command);
      expect(doc.error?.message.length).toBeGreaterThan(0);
    }
    const ready1 = await ready();
    const named: { argv: string[]; code: string }[] = [
      { argv: ["add"], code: "SHADOW_UI_NO_COMPONENTS" },
      { argv: ["remove"], code: "SHADOW_UI_NO_COMPONENTS" },
      { argv: ["add", "nothing"], code: "SHADOW_UI_UNKNOWN_COMPONENT" },
      { argv: ["add", "../x"], code: "SHADOW_UI_INVALID_NAME" },
      { argv: ["diff", "nothing"], code: "SHADOW_UI_UNKNOWN_COMPONENT" },
    ];
    for (const row of named) {
      const { code, doc } = await json(ready1, ...row.argv);
      expect(code, row.argv.join(" ")).toBe(1);
      expect(doc.error?.code, row.argv.join(" ")).toBe(row.code);
    }
  });

  it("[UI-JSON-08] nothing is asked: a differing file is kept without --overwrite", async () => {
    const p = project(registry, VITE_PROJECT, { answer: true });
    await main(["init", "--yes", "--skip-install"], () => p.ctx);
    await main(["add", "badge", "--yes", "--skip-install"], () => p.ctx);
    writeFileSync(join(p.root, "src/components/ui/badge.tsx"), "export const Badge = 1;\n");
    p.questions.length = 0;
    const { code, doc } = await json(p, "add", "badge", "--skip-install");
    expect(code).toBe(1);
    expect(doc.error?.code).toBe("SHADOW_UI_FILES_DIFFER");
    expect(p.questions).toEqual([]);
  });

  it("[UI-JSON-09] human lines never reach stdout, and the installer sends its output to stderr", async () => {
    const p = project(registry, VITE_PROJECT);
    const requests: unknown[] = [];
    const ctx = {
      ...p.ctx,
      install: async (request: unknown): Promise<void> => {
        requests.push(request);
      },
    };
    p.out.length = 0;
    const code = await main(["init", "--yes", "--json"], () => ctx);
    expect(code).toBe(0);
    expect(p.out).toHaveLength(1);
    expect(p.out[0]?.startsWith("{")).toBe(true);
    expect(requests.length).toBeGreaterThan(0);
    for (const request of requests) expect(request).toMatchObject({ output: "stderr" });
    const human = project(registry, VITE_PROJECT);
    const humanRequests: unknown[] = [];
    await main(["init", "--yes"], () => ({
      ...human.ctx,
      install: async (request: unknown): Promise<void> => {
        humanRequests.push(request);
      },
    }));
    for (const request of humanRequests) expect(request).toMatchObject({ output: "inherit" });
  });

  it("[UI-JSON-10] an unexpected exception is a JSON failure with SHADOW_UI_UNEXPECTED and exit 1", async () => {
    const p = await ready();
    const exploding = {
      ...p.ctx,
      registry: {
        ...p.ctx.registry,
        readFile: (): string => {
          throw new Error("disk on fire");
        },
      },
    };
    p.out.length = 0;
    const code = await main(["add", "badge", "--yes", "--skip-install", "--json"], () => exploding);
    expect(code).toBe(1);
    expect(p.out).toHaveLength(1);
    const doc = JSON.parse(p.out[0] ?? "") as Doc;
    expect(doc).toMatchObject({
      ok: false,
      command: "shadow-ui add",
      error: { code: "SHADOW_UI_UNEXPECTED", message: "unexpected error: disk on fire" },
    });
  });

  it("[UI-JSON-11] completion, help and version are documents", async () => {
    const p = project(registry, {});
    const script = await json(p, "completion", "fish");
    expect(script.doc.command).toBe("shadow-ui completion");
    expect(script.doc.data["shell"]).toBe("fish");
    expect(String(script.doc.data["script"])).toContain("complete -c shadow-ui -l json");
    const help = await json(p, "--help");
    expect(String(help.doc.data["usage"])).toContain("shadow-ui init");
    expect(String(help.doc.data["usage"])).toContain("--json");
    const word = await json(p, "help");
    expect(word.doc.data["usage"]).toBe(help.doc.data["usage"]);
    const version = await json(p, "--version");
    expect(version.doc.data).toEqual({ version: "9.9.9" });
  });

  it("[UI-JSON-12] the codes in the sources and the lists of json.ts are the same set", () => {
    const folder = join(import.meta.dirname, "..", "src", "cli");
    const printed = new Set<string>();
    for (const file of readdirSync(folder)) {
      if (!file.endsWith(".ts")) continue;
      const text = withoutLists(readFileSync(join(folder, file), "utf8"));
      for (const match of text.matchAll(/"(SHADOW_UI_[A-Z]+(?:_[A-Z]+)*)"/g)) {
        printed.add(match[1] ?? "");
      }
    }
    const known = new Set<string>([...ERROR_CODES, ...WARNING_CODES]);
    for (const code of printed)
      expect(known.has(code), `${code} is printed but not listed`).toBe(true);
    for (const code of known)
      expect(printed.has(code), `${code} is listed but never printed`).toBe(true);
  });
});
