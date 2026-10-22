import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const tailwindNode = "@tailwindcss/node";
type TailwindNode = {
  compile: (
    source: string,
    options: { base: string; onDependency: (path: string) => void },
  ) => Promise<{ build: (candidates: string[]) => string }>;
};

async function built(candidates: string[]): Promise<string> {
  const { compile } = (await import(/* @vite-ignore */ tailwindNode)) as TailwindNode;
  const source = [
    '@import "tailwindcss";',
    `@import "${join(packageRoot, "styles", "theme.css")}";`,
    `@import "${join(packageRoot, "styles", "animations.css")}";`,
  ].join("\n");
  return (await compile(source, { base: packageRoot, onDependency: () => undefined })).build(
    candidates,
  );
}

describe("the shimmer and scroll-fade utilities", () => {
  it("[UI-UTL-01] shimmer paints the text with a moving highlight, and stops under reduced motion and forced colors", async () => {
    const css = await built(["shimmer"]);
    expect(css).toContain(".shimmer");
    expect(css).toContain("background-clip: text");
    expect(css).toContain("animation: shimmer 2s linear infinite");
    expect(css).toContain("@keyframes shimmer");
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/);
    expect(css).toMatch(/forced-colors: active[\s\S]*animation: none/);
  });

  it("[UI-UTL-02] scroll-fade fades the edges from the scroll position itself, with no script", async () => {
    const css = await built(["scroll-fade-y", "scroll-fade-x"]);
    expect(css).toContain(".scroll-fade-y");
    expect(css).toContain(".scroll-fade-x");
    expect(css).toContain("animation-timeline: scroll(self block)");
    expect(css).toContain("animation-timeline: scroll(self inline)");
    expect(css).toContain("mask-image");
    expect(css).toContain("@property --scroll-fade-start");
    expect(css).toContain("@property --scroll-fade-end");
    expect(css).toContain("@keyframes scroll-fade");
  });

  it("[UI-UTL-03] the horizontal fade mirrors in right-to-left text", async () => {
    const css = await built(["scroll-fade-x"]);
    expect(css).toContain(":dir(rtl)");
    expect(css).toContain("to left");
  });

  it("[UI-UTL-04] the rules are appended to animations.css, after the existing ones", () => {
    const source = readFileSync(join(packageRoot, "styles", "animations.css"), "utf8");
    expect(source.indexOf("@keyframes chart-draw")).toBeLessThan(
      source.indexOf("@utility shimmer"),
    );
    expect(source.indexOf("@utility shimmer")).toBeLessThan(
      source.indexOf("@utility scroll-fade-y"),
    );
  });
});
