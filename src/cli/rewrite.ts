/**
 * Import path rewriting: registry sources import each other through the canonical aliases
 * (`@/components/ui/button`, `@/lib/utils`, `@/hooks/use-mobile`); a project may configure other
 * aliases in `components.json`. Pure string functions.
 * @packageDocumentation
 */
import type { ComponentsAliases } from "./schema";

/**
 * Maps one import specifier from the registry layout to the project's aliases.
 *
 * @param specifier An import specifier such as `@/components/ui/button`.
 * @param aliases The aliases from `components.json`.
 * @returns The rewritten specifier, or the input unchanged when it is not a registry alias.
 * @example
 * rewriteSpecifier("@/lib/utils", { ...aliases, utils: "~/helpers/cn" }); // "~/helpers/cn"
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function rewriteSpecifier(specifier: string, aliases: ComponentsAliases): string {
  if (specifier === "@/lib/utils") return aliases.utils;
  if (specifier.startsWith("@/components/ui/")) {
    return `${aliases.ui}/${specifier.slice("@/components/ui/".length)}`;
  }
  if (specifier.startsWith("@/hooks/"))
    return `${aliases.hooks}/${specifier.slice("@/hooks/".length)}`;
  if (specifier.startsWith("@/lib/")) return `${aliases.lib}/${specifier.slice("@/lib/".length)}`;
  return specifier;
}

/** `from "x"`, `import "x"`, `import("x")` and `export ... from "x"` specifiers. */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(@\/[^"'\n]+)\2/g;

/**
 * Rewrites every registry-alias import in `source` to the project's aliases. Only module
 * specifiers are touched (static imports, re-exports, dynamic imports); other strings are not.
 *
 * @param source A registry file's text.
 * @param aliases The aliases from `components.json`.
 * @returns The text with rewritten specifiers.
 * @example
 * rewriteImports('import { cn } from "@/lib/utils";', aliases);
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function rewriteImports(source: string, aliases: ComponentsAliases): string {
  return source.replace(
    SPECIFIER,
    (_match, lead: string, quote: string, specifier: string) =>
      `${lead}${quote}${rewriteSpecifier(specifier, aliases)}${quote}`,
  );
}
