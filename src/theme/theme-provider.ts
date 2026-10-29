import {
  type Accessor,
  batch,
  createContext,
  onCleanup,
  onMount,
  untrack,
  useContext,
  useEffect,
  useMemo,
  useSignal,
} from "@shadow-js/core";
import type { JsxChild } from "@shadow-js/web/jsx-runtime";
import {
  applyTheme,
  DEFAULT_STORAGE_KEY,
  isTheme,
  type ResolvedTheme,
  readStoredTheme,
  resolveTheme,
  type Theme,
  type ThemeOptions,
  writeStoredTheme,
} from "./theme-logic";

/**
 * What {@link useTheme} returns. Every value is an accessor: call it to read.
 * @since 1.0.0
 */
export interface ThemeContextValue {
  /** The user's choice: `"light"`, `"dark"` or `"system"`. Call it to read the value. */
  readonly theme: Accessor<Theme>;
  /**
   * The theme that is shown: `"light"` or `"dark"`. `undefined` on the server and until the provider
   * has mounted, so markup that depends on it hydrates without a mismatch.
   */
  readonly resolvedTheme: Accessor<ResolvedTheme | undefined>;
  /**
   * The operating system preference: `"light"` or `"dark"`. `undefined` on the server and until the
   * provider has mounted.
   */
  readonly systemTheme: Accessor<ResolvedTheme | undefined>;
  /**
   * Chooses a theme, or derives one from the previous choice, and stores it under the provider's
   * `storageKey`. Throws a `TypeError` for a value that is not `"light"`, `"dark"` or `"system"`.
   */
  readonly setTheme: (theme: Theme | ((previous: Theme) => Theme)) => void;
}

/**
 * Props of {@link ThemeProvider}: the {@link ThemeOptions} plus a transition switch and the children.
 * @since 1.0.0
 */
export interface ThemeProviderProps extends ThemeOptions {
  /**
   * Stops CSS transitions for one frame while the theme changes, so colors flip at once instead
   * of fading piecemeal.
   * @default false
   */
  readonly disableTransitionOnChange?: boolean | undefined;
  /** The app to render inside the theme context. */
  readonly children?: JsxChild | undefined;
}

const MISSING: ThemeContextValue = {
  theme: () => "system",
  resolvedTheme: () => undefined,
  systemTheme: () => undefined,
  setTheme: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(MISSING, { name: "ShadowUITheme" });

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Disables transitions until the next frame; returns nothing, cleans itself up. */
function suppressTransitions(): void {
  const style = document.createElement("style");
  style.textContent =
    "*,*::before,*::after{transition:none!important;animation-duration:0s!important}";
  document.head.append(style);
  // Reading a computed style forces the browser to apply the change with transitions off.
  window.getComputedStyle(document.body).getPropertyValue("opacity");
  window.setTimeout(() => style.remove(), 1);
}

/**
 * The page's `localStorage`, or `undefined` when the browser blocks it: reading the property
 * itself throws a `DOMException` in some sandboxed and locked-down contexts.
 */
function localStorageOrUndefined(): Storage | undefined {
  try {
    return window.localStorage;
  } catch (error) {
    if (error instanceof DOMException) return undefined;
    throw error;
  }
}

/**
 * Provides the color theme to the app: `"light"`, `"dark"` or `"system"`. The choice is persisted in
 * `localStorage`, applied to `<html>` as a `light` or `dark` class (or a `data-*` attribute), and kept
 * in sync across tabs and with the operating system. The provider renders no element of its own, and
 * nothing touches the DOM until it has mounted, so it is safe to render on the server. Pair it with
 * {@link themeScript} in the document head so the first paint already has the right theme.
 *
 * @param props The {@link ThemeProviderProps}: theme options (`storageKey`, `defaultTheme`,
 *   `attribute`, `enableSystem`), `disableTransitionOnChange` and `children`.
 * @returns The children inside the theme context.
 * @example
 * import { ThemeProvider } from "@shadow-js/ui";
 *
 * function App() {
 *   return <p>Hello</p>;
 * }
 *
 * export const root = (
 *   <ThemeProvider defaultTheme="system">
 *     <App />
 *   </ThemeProvider>
 * );
 * @see {@link useTheme}
 * @since 1.0.0
 */
export function ThemeProvider(props: ThemeProviderProps): JsxChild {
  const storageKey = (): string => props.storageKey ?? DEFAULT_STORAGE_KEY;
  const defaultTheme = (): Theme => props.defaultTheme ?? "system";
  const attribute = (): "class" | `data-${string}` => props.attribute ?? "class";
  const enableSystem = (): boolean => props.enableSystem ?? true;

  const [theme, setThemeState] = useSignal<Theme>(untrack(defaultTheme));
  const [systemDark, setSystemDark] = useSignal<boolean | undefined>(undefined);
  const resolved = useMemo((): ResolvedTheme | undefined => {
    const dark = systemDark();
    if (dark === undefined) return undefined;
    return resolveTheme(theme(), dark, enableSystem());
  });
  const system = useMemo((): ResolvedTheme | undefined => {
    const dark = systemDark();
    return dark === undefined ? undefined : dark ? "dark" : "light";
  });

  onMount(() => {
    const query = window.matchMedia(DARK_QUERY);
    batch(() => {
      const storage = localStorageOrUndefined();
      const stored = storage === undefined ? undefined : readStoredTheme(storage, storageKey());
      if (stored !== undefined) setThemeState(stored);
      setSystemDark(query.matches);
    });
    const onSystemChange = (event: MediaQueryListEvent): void => {
      setSystemDark(event.matches);
    };
    const onStorage = (event: StorageEvent): void => {
      // A null key is `storage.clear()`: the stored theme is gone, like a removed key.
      if (event.key !== null && event.key !== storageKey()) return;
      setThemeState(isTheme(event.newValue) ? event.newValue : defaultTheme());
    };
    query.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    onCleanup(() => {
      query.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    });
  });

  useEffect(() => {
    const value = resolved();
    if (value === undefined) return;
    const attributeName = attribute();
    const current = document.documentElement;
    if (props.disableTransitionOnChange === true) suppressTransitions();
    applyTheme(current, value, attributeName);
  });

  const value: ThemeContextValue = {
    theme,
    resolvedTheme: resolved,
    systemTheme: system,
    setTheme(next) {
      const chosen = typeof next === "function" ? next(untrack(theme)) : next;
      if (!isTheme(chosen)) {
        throw new TypeError(
          `setTheme: expected "light", "dark" or "system", received ${String(chosen)}`,
        );
      }
      setThemeState(chosen);
      const storage = localStorageOrUndefined();
      if (storage !== undefined) writeStoredTheme(storage, untrack(storageKey), chosen);
    },
  };

  return ThemeContext.Provider({
    value,
    get children() {
      return props.children;
    },
  }) as JsxChild;
}

/**
 * Reads the theme and its setter. Call it inside a component rendered under {@link ThemeProvider}.
 *
 * @returns The {@link ThemeContextValue}: accessors for the chosen, the resolved and the system
 *   theme, and `setTheme`.
 * @throws Error when no `ThemeProvider` is above the caller.
 * @example
 * import { useTheme } from "@shadow-js/ui";
 *
 * export function ThemeToggle() {
 *   const { resolvedTheme, setTheme } = useTheme();
 *   return (
 *     <button onClick={() => setTheme(resolvedTheme() === "dark" ? "light" : "dark")}>
 *       Toggle theme
 *     </button>
 *   );
 * }
 * @see {@link ThemeProvider}
 * @since 1.0.0
 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === MISSING) throw new Error("useTheme() must be used within <ThemeProvider>");
  return value;
}
