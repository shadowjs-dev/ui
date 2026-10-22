import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { main } from "../src/cli/main";
import { project, VITE_PROJECT } from "./support/project";
import { indexOf, item, sourceOf } from "./support/registry";

const index = indexOf(item("utils", { type: "lib", files: ["utils.ts"] }));
const registry = sourceOf(index, { "registry/utils/utils.ts": "export const cn = 1;\n" });

/** The commands the completion script must offer (aliases included). */
const COMMANDS = ["init", "add", "list", "diff", "remove", "completion", "help"];

/** Every long flag the help text names (`--yes`, `--dry-run`, ...). */
function longFlagsInHelp(help: string): string[] {
  return [...new Set(help.match(/--[a-z][a-z-]*/g) ?? [])];
}

async function completionOf(shell: string | undefined): Promise<{
  code: number;
  out: string[];
  err: string[];
}> {
  const p = project(registry, VITE_PROJECT);
  const argv = shell === undefined ? ["completion"] : ["completion", shell];
  const code = await main(argv, () => p.ctx);
  return { code, out: p.out, err: p.err };
}

async function helpText(): Promise<string> {
  const p = project(registry, VITE_PROJECT);
  await main(["--help"], () => p.ctx);
  return p.out.join("\n");
}

describe("shadow-ui completion", () => {
  it("[CMP-UI-01] the bash script lists every command and every long flag of the help text", async () => {
    const { code, out } = await completionOf("bash");
    expect(code).toBe(0);
    const script = out.join("\n");
    for (const command of COMMANDS) expect(script).toContain(command);
    const flags = longFlagsInHelp(await helpText());
    expect(flags).toContain("--base-color");
    for (const flag of flags) expect(script).toContain(flag);
  });

  it("[CMP-UI-02] the zsh and fish scripts list every command and every long flag of the help text", async () => {
    const flags = longFlagsInHelp(await helpText());
    for (const shell of ["zsh", "fish"]) {
      const { code, out } = await completionOf(shell);
      expect(code).toBe(0);
      const script = out.join("\n");
      for (const command of COMMANDS) expect(script).toContain(command);
      for (const flag of flags) expect(script).toContain(flag.slice(2));
    }
  });

  it("[CMP-UI-03] the bash script passes `bash -n`", async () => {
    const { out } = await completionOf("bash");
    expect(out.join("\n").length).toBeGreaterThan(0);
    expect(() =>
      execFileSync("bash", ["-n", "-c", out.join("\n")], { stdio: "pipe" }),
    ).not.toThrow();
  });

  it("[CMP-UI-04] a missing or unknown shell writes to stderr and exits 1", async () => {
    for (const shell of [undefined, "powershell"]) {
      const { code, out, err } = await completionOf(shell);
      expect(code).toBe(1);
      expect(out).toEqual([]);
      expect(err.join("\n")).toContain("bash, zsh or fish");
    }
  });

  it("[CMP-UI-05] the help text and the README CLI section mention the completion command", async () => {
    expect(await helpText()).toContain("shadow-ui completion <shell>");
    const readme = readFileSync(
      join(new URL(".", import.meta.url).pathname, "..", "README.md"),
      "utf8",
    );
    const cli = readme.slice(readme.indexOf("## The CLI"), readme.indexOf("## Project setup"));
    expect(cli).toContain("shadow-ui completion <bash|zsh|fish>");
  });
});
