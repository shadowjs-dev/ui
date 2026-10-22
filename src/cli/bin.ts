/**
 * The `shadow-ui` executable: wires the real filesystem, terminal and package manager into
 * {@link main}. Kept tiny; everything testable lives in the other modules.
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import type { CliContext } from "./commands";
import { nodeFs } from "./fs";
import { installCrashHandlers, wantsJson } from "./json";
import { main } from "./main";
import { loadRegistrySource } from "./registry-source";

function realContext(cwd: string | undefined): CliContext {
  return {
    cwd: resolve(cwd ?? process.cwd()),
    fs: nodeFs(),
    registry: loadRegistrySource(),
    // Replaced by the build with the version in package.json (the registry carries its own).
    version: __VERSION__,
    out: (line) => process.stdout.write(`${line}\n`),
    err: (line) => process.stderr.write(`${line}\n`),
    async confirm(question) {
      if (!process.stdin.isTTY) return false;
      const prompt = createInterface({ input: process.stdin, output: process.stdout });
      try {
        const answer = await prompt.question(`${question} (y/N) `);
        return /^y(es)?$/i.test(answer.trim());
      } finally {
        prompt.close();
      }
    },
    install: ({ cwd: directory, manager, packages, output }) =>
      new Promise<void>((done, reject) => {
        const args = manager === "npm" ? ["install", ...packages] : ["add", ...packages];
        const child = spawn(manager, args, {
          cwd: directory,
          // A `--json` run keeps stdout for the document: the installer's output goes to stderr.
          stdio: output === "stderr" ? ["inherit", 2, 2] : "inherit",
          shell: process.platform === "win32",
        });
        child.on("error", reject);
        child.on("close", (code) =>
          code === 0 ? done() : reject(new Error(`${manager} exited with code ${code}`)),
        );
      }),
  };
}

const argv = process.argv.slice(2);
// A crash is JSON too: stdout carries one document whatever happens.
if (wantsJson(argv)) installCrashHandlers(argv);
process.exitCode = await main(argv, realContext);
