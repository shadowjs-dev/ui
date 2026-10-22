import { describe, expect, it } from "vitest";
import { cn, cva } from "../src/index";

describe("cn and cva", () => {
  it("[UI-LIB-01] joins classes, skips falsy values and resolves Tailwind conflicts last-wins", () => {
    expect(cn("px-2 py-1", false, null, undefined, 0, "px-4")).toBe("py-1 px-4");
    expect(cn(["a", ["b"]], { c: true, d: false }, "text-sm", "text-lg")).toBe("a b c text-lg");
    expect(cn("bg-primary hover:bg-primary/90", "bg-red-500")).toBe(
      "hover:bg-primary/90 bg-red-500",
    );
    expect(cn()).toBe("");
  });

  it("[UI-LIB-02] accepts readonly arrays like the class attribute does", () => {
    const classes: readonly string[] = ["p-1", "p-2"];
    expect(cn(classes)).toBe("p-2");
  });

  it("[UI-LIB-03] re-exports cva with variants and defaults", () => {
    const badge = cva("rounded", {
      variants: { tone: { a: "bg-a", b: "bg-b" } },
      defaultVariants: { tone: "a" },
    });
    expect(badge()).toBe("rounded bg-a");
    expect(badge({ tone: "b" })).toBe("rounded bg-b");
  });
});
