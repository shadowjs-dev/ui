/**
 * `@shadow-js/ui`: the shadcn/ui replacement for ShadowJS. The components themselves are copied
 * into your project by the `shadow-ui` CLI. This entry ships the helpers they share (`cn`, `cva`),
 * the theme provider and the no-flash script, plus the registry types. The CSS (`theme.css`,
 * `animations.css`) and `registry.json` are separate package exports. The CLI modules are not
 * exported from this entry: the `shadow-ui` command is their public surface.
 * @packageDocumentation
 */
export { cva, type VariantProps } from "class-variance-authority";

export { type ClassValue, cn } from "../registry/utils/utils";
export type { RegistryFile, RegistryIndex, RegistryItem } from "./cli/schema";
export type {
  ResolvedTheme,
  Theme,
  ThemeAttribute,
  ThemeOptions,
} from "./theme/theme-logic";
export {
  applyTheme,
  DEFAULT_STORAGE_KEY,
  isTheme,
  readStoredTheme,
  resolveTheme,
  themeScript,
  themeScriptTag,
  writeStoredTheme,
} from "./theme/theme-logic";
export type { ThemeContextValue, ThemeProviderProps } from "./theme/theme-provider";
export { ThemeProvider, useTheme } from "./theme/theme-provider";
