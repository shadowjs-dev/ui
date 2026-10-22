import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(packageRoot, "styles", "typeset.css"), "utf8");
/** The stylesheet without its comments, so what is asserted is what is written as rules. */
const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");
const tailwindNode = "@tailwindcss/node";
type TailwindNode = {
  compile: (
    source: string,
    options: { base: string; onDependency: (path: string) => void },
  ) => Promise<{ build: (candidates: string[]) => string }>;
};

/** Every selector list in the stylesheet, one string for each rule. */
function selectors(): string[] {
  return [...rules.matchAll(/([^{}]+)\{[^{}]*\}/g)]
    .map((match) => (match[1] ?? "").trim())
    .filter((s) => s !== "" && !s.startsWith("@"));
}

describe("typeset.css", () => {
  it("[UI-TYP-01] compiles under Tailwind with the theme, and its rules are in the components layer", async () => {
    const { compile } = (await import(/* @vite-ignore */ tailwindNode)) as TailwindNode;
    const source = [
      '@import "tailwindcss";',
      `@import "${join(packageRoot, "styles", "theme.css")}";`,
      `@import "${join(packageRoot, "styles", "typeset.css")}";`,
    ].join("\n");
    const built = (
      await compile(source, { base: packageRoot, onDependency: () => undefined })
    ).build([]);
    expect(built).toContain("--typeset-size");
    expect(built).toContain("@layer components");
    expect(built).toContain(".typeset");
  });

  it("[UI-TYP-02] sets the three controls and gives the presets, so one change rescales the text", () => {
    expect(rules).toContain("--typeset-size:");
    expect(rules).toContain("--typeset-leading:");
    expect(rules).toContain("--typeset-flow:");
    expect(selectors()).toEqual(
      expect.arrayContaining([":where(.typeset-docs)", ":where(.typeset-chat)"]),
    );
    // The sizes of the headings and the gaps are multiples of the controls, never fixed lengths of their own.
    expect(rules).toContain("calc(var(--typeset-flow)");
    expect(rules).toContain("font-size: var(--typeset-size)");
  });

  it("[UI-TYP-03] every selector has zero specificity: it is wrapped in :where(), so utilities and plain CSS win without !important", () => {
    expect(rules).not.toContain("!important");
    for (const selector of selectors()) {
      // After removing the :where() groups nothing is left that has specificity: no class, id, attribute or element outside one.
      let outside = selector;
      for (let guard = 0; guard < 20 && outside.includes(":where("); guard += 1) {
        const start = outside.indexOf(":where(");
        let depth = 0;
        let end = start;
        for (let at = start + 6; at < outside.length; at += 1) {
          if (outside[at] === "(") depth += 1;
          if (outside[at] === ")") {
            depth -= 1;
            if (depth === 0) {
              end = at;
              break;
            }
          }
        }
        outside = outside.slice(0, start) + outside.slice(end + 1);
      }
      expect(outside.replace(/[\s,]/g, ""), selector).toBe("");
    }
  });

  it("[UI-TYP-04] keeps a component out with not-typeset or data-not-typeset, including its descendants", () => {
    expect(rules).toContain(".not-typeset *");
    expect(rules).toContain("[data-not-typeset *]");
    expect(rules).toContain("[data-not-typeset]");
  });

  it("[UI-TYP-05] is safe for streaming: nothing looks ahead, and space comes only from margin-block-start", () => {
    expect(rules).not.toContain(":last-child");
    expect(rules).not.toContain(":has(");
    expect(rules).not.toContain("~");
    expect(rules).not.toContain(":last-of-type");
    expect(rules).not.toContain("margin-block-end");
    expect(rules).not.toContain("margin-bottom");
    expect(rules).not.toMatch(/margin-block:\s*[^;]*\s[^;]*(?<!0);/);
  });

  it("[UI-TYP-06] uses logical properties only, so the text, lists and quotes follow a right-to-left page", () => {
    for (const physical of [
      "margin-left",
      "margin-right",
      "padding-left",
      "padding-right",
      "border-left",
      "border-right",
      "text-align: left",
      "text-align: right",
      "float: left",
      "float: right",
    ]) {
      expect(rules, physical).not.toContain(physical);
    }
    expect(rules).toContain("padding-inline-start");
    expect(rules).toContain("border-inline-start");
    // Code keeps its own direction on every page.
    expect(rules).toContain("direction: ltr");
  });

  it("[UI-TYP-07] scrolls a wide table sideways instead of squeezing it", () => {
    expect(rules).toContain(".typeset-scroll");
    expect(rules).toContain("overflow-x: auto");
    expect(rules).toContain("min-inline-size: max-content");
  });

  it("[UI-TYP-08] colors, fonts and radius come from the theme tokens, not from fixed values", () => {
    for (const token of ["--foreground", "--muted-foreground", "--muted", "--border", "--radius"]) {
      expect(rules, token).toContain(`var(${token}`);
    }
    expect(rules).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(rules).not.toMatch(/\brgb\(|\bhsl\(/);
  });

  it("[UI-TYP-09] is exported from the package as @shadow-js/ui/typeset.css", () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as {
      exports: Record<string, string>;
    };
    expect(manifest.exports["./typeset.css"]).toBe("./styles/typeset.css");
  });
});
