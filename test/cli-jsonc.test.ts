import { describe, expect, it } from "vitest";
import { parseJsonc } from "../src/cli/paths";

describe("parseJsonc", () => {
  it("[UI-CLI-95] drops trailing commas outside strings only: a string that ends in ,] or ,} is kept as written", () => {
    expect(parseJsonc('{ "a": "x,]", "b": "y,}", "c": ["p,]", "q"], }')).toEqual({
      a: "x,]",
      b: "y,}",
      c: ["p,]", "q"],
    });
  });
});
