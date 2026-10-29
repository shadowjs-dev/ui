import { afterEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { MAX_TRACE_CELLS, unifiedDiff } from "../src/cli/diff";

const spies: MockInstance[] = [];
afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore();
});

/** Sums the elements of every `Int32Array#slice` result: the memory the edit script keeps. */
function countAllocatedCells(): { total(): number } {
  let cells = 0;
  const original = Int32Array.prototype.slice;
  const spy = vi.spyOn(Int32Array.prototype, "slice").mockImplementation(function (
    this: Int32Array,
    start?: number,
    end?: number,
  ) {
    const copy = original.call(this, start, end);
    cells += copy.length;
    return copy;
  });
  spies.push(spy);
  return { total: () => cells };
}

const lines = (prefix: string, count: number): string =>
  Array.from({ length: count }, (_, index) => `${prefix}${index}`).join("\n");

describe("the diff stays bounded in memory", () => {
  it("[UI-R2-18] two fully different 10,000-line files become one replacement without keeping a gigabyte of trace", () => {
    const counted = countAllocatedCells();
    const diff = unifiedDiff(lines("a", 10_000), lines("b", 10_000), { before: "x", after: "y" });
    const all = diff.split("\n");
    expect(all.filter((line) => line.startsWith("-a"))).toHaveLength(10_000);
    expect(all.filter((line) => line.startsWith("+b"))).toHaveLength(10_000);
    expect(counted.total()).toBeLessThanOrEqual(MAX_TRACE_CELLS + 100_000);
  });

  it("[UI-R2-18] a file with a few hundred changes among thousands of lines still gets a real, minimal diff", () => {
    const before = Array.from({ length: 6_000 }, (_, index) => `line ${index}`);
    const after = [...before];
    for (let at = 50; at < 6_000; at += 40) after[at] = `changed ${at}`;
    const diff = unifiedDiff(before.join("\n"), after.join("\n"), { before: "x", after: "y" });
    const removed = diff.split("\n").filter((line) => line.startsWith("-line"));
    expect(removed).toHaveLength(149);
    // Equal lines between the changes stay out of the replaced lines.
    expect(diff.split("\n").filter((line) => line.startsWith("+changed"))).toHaveLength(149);
  });

  it("[UI-R2-18] the result of a small diff is unchanged", () => {
    expect(unifiedDiff("a\nb\nc\n", "a\nX\nc\n", { before: "x", after: "y" })).toBe(
      ["--- x", "+++ y", "@@ -1,3 +1,3 @@", " a", "-b", "+X", " c"].join("\n"),
    );
  });
});
