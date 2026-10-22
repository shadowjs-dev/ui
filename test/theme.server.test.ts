import type { JsxChild } from "@shadow-js/web/jsx-runtime";
import { createComponent, renderToString } from "@shadow-js/web/server";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "../src/theme/theme-provider";

describe("ThemeProvider on the server", () => {
  it("[UI-THM-20] renders its children without a window and reports undefined resolved themes", () => {
    expect(typeof window).toBe("undefined");
    const seen: Array<string | undefined> = [];
    const html = renderToString(() =>
      ThemeProvider({
        get children() {
          return createComponent(() => {
            const { resolvedTheme, systemTheme, theme } = useTheme();
            seen.push(resolvedTheme(), systemTheme(), theme());
            return "ok";
          }, {}) as JsxChild;
        },
      }),
    );
    expect(html).toContain("ok");
    expect(seen).toEqual([undefined, undefined, "system"]);
  });

  it("[UI-THM-21] honors defaultTheme on the server", () => {
    let chosen: string | undefined;
    renderToString(() =>
      ThemeProvider({
        defaultTheme: "dark",
        get children() {
          return createComponent(() => {
            chosen = useTheme().theme();
            return "";
          }, {}) as JsxChild;
        },
      }),
    );
    expect(chosen).toBe("dark");
  });
});
