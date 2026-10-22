/**
 * Pure theme logic, shared by the provider and the no-flash script so both agree on what
 * "system", "light" and "dark" mean. Nothing here touches `window` unless it is handed an object.
 * @packageDocumentation
 */

/**
 * The theme a user picks: `"light"`, `"dark"`, or `"system"` to follow the operating system.
 * @since 1.0.0
 */
export type Theme = "light" | "dark" | "system";

/**
 * The theme that is actually shown: `"light"` or `"dark"`.
 * @since 1.0.0
 */
export type ResolvedTheme = "light" | "dark";

/**
 * Where the resolved theme is written on the root element. `"class"` (the default) sets a `light`
 * or `dark` class, which the generated stylesheet matches for its dark styles (the `dark` variant of
 * Tailwind is `.dark`). A `data-*` name such as `"data-theme"` sets that attribute to `"light"` or
 * `"dark"` instead; the stylesheet then has to match that attribute as well.
 * @since 1.0.0
 */
export type ThemeAttribute = "class" | `data-${string}`;

/**
 * Options shared by `ThemeProvider` and `themeScript`. Pass the same values to both, or the page can
 * show one theme before the provider switches to another.
 * @since 1.0.0
 */
export interface ThemeOptions {
  /**
   * `localStorage` key that persists the choice. The stored value is `"light"`, `"dark"` or
   * `"system"`; a missing or invalid value falls back to `defaultTheme`.
   * @default "shadow-ui-theme"
   */
  readonly storageKey?: string | undefined;
  /**
   * Theme used before the user chooses one, and when the stored value is missing or invalid.
   * @default "system"
   */
  readonly defaultTheme?: Theme | undefined;
  /**
   * Where the resolved theme is written: `"class"` for a `light` or `dark` class on `<html>`, or a
   * `data-*` attribute name such as `"data-theme"` (see {@link ThemeAttribute}).
   * @default "class"
   */
  readonly attribute?: ThemeAttribute | undefined;
  /**
   * Follow `prefers-color-scheme` while the theme is `"system"`. When `false`, `"system"` shows light.
   * @default true
   */
  readonly enableSystem?: boolean | undefined;
}

/**
 * The `localStorage` key that holds the theme choice when `storageKey` is not given.
 * @example
 * import { DEFAULT_STORAGE_KEY } from "@shadow-js/ui";
 *
 * window.localStorage.getItem(DEFAULT_STORAGE_KEY);
 * @since 1.0.0
 */
export const DEFAULT_STORAGE_KEY = "shadow-ui-theme";

/**
 * Narrows an unknown value to a {@link Theme}. Use it on anything read from storage or from an event
 * before trusting it.
 *
 * @param value Anything, such as a value read from storage.
 * @returns `true` for `"light"`, `"dark"` and `"system"`, and `false` for everything else.
 * @example
 * import { DEFAULT_STORAGE_KEY, isTheme } from "@shadow-js/ui";
 *
 * isTheme(window.localStorage.getItem(DEFAULT_STORAGE_KEY)); // false when nothing is stored
 * @since 1.0.0
 */
export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Turns a theme choice into the theme to show. Only `"system"` depends on the operating system.
 *
 * @param theme The user's choice.
 * @param systemPrefersDark Whether the operating system prefers a dark scheme.
 * @param enableSystem When `false`, `"system"` resolves to light. Default `true`.
 * @returns `"light"` or `"dark"`.
 * @example
 * import { resolveTheme } from "@shadow-js/ui";
 *
 * resolveTheme("system", true); // "dark"
 * @since 1.0.0
 */
export function resolveTheme(
  theme: Theme,
  systemPrefersDark: boolean,
  enableSystem = true,
): ResolvedTheme {
  if (theme === "system") return enableSystem && systemPrefersDark ? "dark" : "light";
  return theme;
}

/**
 * Writes the resolved theme to the root element: sets the `light` or `dark` class (removing the
 * other) or the `data-*` attribute, and sets `color-scheme` so form controls and scrollbars follow.
 *
 * @param root The element to write to, usually `document.documentElement`.
 * @param resolved The theme to show.
 * @param attribute Where to write it: `"class"` (the default) or a `data-*` attribute name.
 * @example
 * import { applyTheme } from "@shadow-js/ui";
 *
 * applyTheme(document.documentElement, "dark");
 * @since 1.0.0
 */
export function applyTheme(
  root: HTMLElement,
  resolved: ResolvedTheme,
  attribute: ThemeAttribute = "class",
): void {
  if (attribute === "class") {
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
  } else {
    root.setAttribute(attribute, resolved);
  }
  root.style.colorScheme = resolved;
}

/** The storage error names a locked-down browser raises; anything else is a bug and propagates. */
function isStorageUnavailable(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "SecurityError" ||
      error.name === "QuotaExceededError" ||
      error.name === "NotAllowedError")
  );
}

/**
 * Reads the stored theme. A missing or invalid value gives `undefined`. A storage the browser
 * blocks (private windows, disabled site data) or has run out of room for also gives `undefined`:
 * those raise a `SecurityError`, `NotAllowedError` or `QuotaExceededError` `DOMException`.
 *
 * @param storage The storage to read, usually `window.localStorage`.
 * @param key The storage key, such as {@link DEFAULT_STORAGE_KEY}.
 * @returns The stored theme, or `undefined` when it is missing, invalid or unavailable.
 * @throws The original error when it is not one of the storage errors above, because that is a bug.
 * @example
 * import { DEFAULT_STORAGE_KEY, readStoredTheme } from "@shadow-js/ui";
 *
 * readStoredTheme(window.localStorage, DEFAULT_STORAGE_KEY);
 * @since 1.0.0
 */
export function readStoredTheme(storage: Storage, key: string): Theme | undefined {
  try {
    const value = storage.getItem(key);
    return isTheme(value) ? value : undefined;
  } catch (error) {
    if (isStorageUnavailable(error)) return undefined;
    throw error;
  }
}

/**
 * Stores the theme under the key. A storage that is blocked or full does not throw: the function
 * returns `false` instead.
 *
 * @param storage The storage to write, usually `window.localStorage`.
 * @param key The storage key, such as {@link DEFAULT_STORAGE_KEY}.
 * @param theme The theme to store.
 * @returns `true` when the value was written, `false` when the storage refused it.
 * @throws The original error when it is not one of the storage errors listed in {@link readStoredTheme}.
 * @example
 * import { DEFAULT_STORAGE_KEY, writeStoredTheme } from "@shadow-js/ui";
 *
 * writeStoredTheme(window.localStorage, DEFAULT_STORAGE_KEY, "dark");
 * @since 1.0.0
 */
export function writeStoredTheme(storage: Storage, key: string, theme: Theme): boolean {
  try {
    storage.setItem(key, theme);
    return true;
  } catch (error) {
    if (isStorageUnavailable(error)) return false;
    throw error;
  }
}

/**
 * The inline script that applies the stored theme before the first paint, so a dark-mode user does
 * not see a flash of the light theme. Put the returned text in a `<script>` in the document
 * `<head>`: a `<script>` in `index.html`, or the `document.head` option of Dusk's `createHandler`.
 * An inline script in the head runs before the body is rendered. Pass the same options to
 * `ThemeProvider`.
 *
 * The script is plain ES5 with no dependencies. It reads the stored theme, falls back to
 * `defaultTheme` when the value is missing or invalid or when storage is blocked, and writes the same
 * class or attribute and `color-scheme` as {@link applyTheme}. The function returns text only, so you
 * place the tag yourself. {@link themeScriptTag} returns the same script in a tag with a CSP `nonce`.
 *
 * @param options Must match the `ThemeProvider` options.
 * @returns JavaScript source text, without `<script>` tags.
 * @example
 * import { themeScript } from "@shadow-js/ui";
 *
 * const html = `<script>${themeScript({ defaultTheme: "dark" })}</script>`;
 * @see {@link themeScriptTag}
 * @since 1.0.0
 */
export function themeScript(options: ThemeOptions = {}): string {
  const key = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const fallback = options.defaultTheme ?? "system";
  const attribute = options.attribute ?? "class";
  const system = options.enableSystem ?? true;
  // `<` is escaped so a stored value can never close the surrounding <script> element.
  const literal = (value: unknown): string => JSON.stringify(value).replace(/</g, "\\u003c");
  return [
    "(function(){",
    `var k=${literal(key)},f=${literal(fallback)},a=${literal(attribute)},s=${literal(system)};`,
    "var r=document.documentElement;",
    "function p(t){if(t==='system')return s&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';return t}",
    "function w(m){if(a==='class'){r.classList.remove('light','dark');r.classList.add(m)}else{r.setAttribute(a,m)}r.style.colorScheme=m}",
    "try{var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'&&t!=='system')t=f;w(p(t))}",
    "catch(e){w(p(f))}",
    "})();",
  ].join("");
}

/**
 * {@link themeScript} wrapped in a `<script>` element, as an HTML string, for a server that builds the
 * document. Pass the page's CSP nonce so the inline script is allowed by a policy that uses nonces. In
 * Dusk, the nonce of each response is `event.nonce`, available in the `document.head` function.
 * Only base64 characters (`A-Z`, `a-z`, `0-9`, `+`, `/`, `=`, `_`, `-`) are kept from the nonce.
 *
 * @param options The theme options plus the CSP `nonce` of the page. Without a nonce the tag has no
 *   `nonce` attribute.
 * @returns A `<script>` element as HTML text.
 * @example
 * import { createHandler, type DuskRuntimeManifest } from "@shadow-js/dusk/server";
 * import { pages } from "@shadow-js/dusk/features/pages";
 * import { themeScriptTag } from "@shadow-js/ui";
 *
 * declare const manifest: DuskRuntimeManifest;
 *
 * export const handler = createHandler({
 *   features: [pages()],
 *   manifest,
 *   security: { csp: {} },
 *   document: { head: (event) => themeScriptTag({ nonce: event.nonce }) },
 * });
 * @see {@link themeScript}
 * @since 1.0.0
 */
export function themeScriptTag(
  options: ThemeOptions & { readonly nonce?: string | undefined } = {},
): string {
  const nonce =
    options.nonce === undefined
      ? ""
      : ` nonce="${options.nonce.replace(/[^A-Za-z0-9+/=_-]/g, "")}"`;
  return `<script${nonce}>${themeScript(options)}</script>`;
}
