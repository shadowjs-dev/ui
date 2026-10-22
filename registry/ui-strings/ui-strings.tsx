import { type Accessor, useMemo } from "@shadow-js/core";
import { createPartContext } from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";

/**
 * The values a message takes: strings and numbers, by argument name.
 * @see {@link formatUiString}
 * @since 1.0.0
 */
export type UiStringValues = Readonly<Record<string, string | number>>;

/**
 * A catalog of messages: strings, or objects of strings, as many levels deep as you like. Both
 * `{ dialog: { close: "Close" } }` and `{ "dialog.close": "Close" }` name the key `dialog.close`. The
 * packs of `@shadow-js/ui/locales/*` are catalogs.
 * @see {@link UiStringsProvider}
 * @since 1.0.0
 */
export interface UiStringsCatalog {
  readonly [key: string]: string | UiStringsCatalog;
}

/**
 * Looks up a string by key. The kit's components call it with the English text as `fallback`, which is
 * what they show without a provider or without an entry for the key.
 * @see {@link useUiStrings}
 * @since 1.0.0
 */
export type UiTranslate = (key: string, fallback: string, values?: UiStringValues) => string;

/** One piece of a parsed message. @internal */
type Piece =
  | string
  | { readonly kind: "argument"; readonly name: string }
  | { readonly kind: "number"; readonly name: string; readonly style: string | undefined }
  | { readonly kind: "pound" }
  | {
      readonly kind: "plural";
      readonly name: string;
      readonly offset: number;
      readonly cases: ReadonlyMap<string, readonly Piece[]>;
    };

const NAME = /[^\s,{}]+/y;
const SPACE = /\s*/y;
const PLURAL_CATEGORIES = new Set(["zero", "one", "two", "few", "many", "other"]);

/** Parses a message of the ICU subset the kit uses. @internal */
function parseMessage(message: string): readonly Piece[] {
  let at = 0;
  const fail = (reason: string): never => {
    throw new SyntaxError(`${reason} at position ${at} of "${message}"`);
  };
  const skip = (): void => {
    SPACE.lastIndex = at;
    SPACE.test(message);
    at = SPACE.lastIndex;
  };
  const word = (): string => {
    NAME.lastIndex = at;
    const found = NAME.exec(message);
    if (found === null) return fail("expected a name");
    at = NAME.lastIndex;
    return found[0];
  };
  const consume = (char: string): void => {
    skip();
    if (message[at] !== char) fail(`expected "${char}"`);
    at += 1;
  };
  const sequence = (closing: boolean, plural: boolean): Piece[] => {
    const pieces: Piece[] = [];
    let text = "";
    const flush = (): void => {
      if (text !== "") pieces.push(text);
      text = "";
    };
    while (at < message.length) {
      const char = message[at] as string;
      if (char === "'") {
        const next = message[at + 1];
        if (next === "'") {
          text += "'";
          at += 2;
        } else if (next === "{" || next === "}" || (plural && next === "#")) {
          at += 1;
          for (;;) {
            if (at >= message.length) return fail("unterminated quote");
            const inner = message[at] as string;
            if (inner === "'" && message[at + 1] === "'") {
              text += "'";
              at += 2;
            } else if (inner === "'") {
              at += 1;
              break;
            } else {
              text += inner;
              at += 1;
            }
          }
        } else {
          text += "'";
          at += 1;
        }
      } else if (char === "{") {
        flush();
        at += 1;
        pieces.push(argument());
      } else if (char === "}") {
        if (!closing) return fail("unexpected }");
        flush();
        return pieces;
      } else if (char === "#" && plural) {
        flush();
        pieces.push({ kind: "pound" });
        at += 1;
      } else {
        text += char;
        at += 1;
      }
    }
    if (closing) return fail("missing }");
    flush();
    return pieces;
  };
  const argument = (): Piece => {
    skip();
    const name = word();
    skip();
    if (message[at] === "}") {
      at += 1;
      return { kind: "argument", name };
    }
    consume(",");
    skip();
    const type = word();
    skip();
    if (type === "number") {
      let style: string | undefined;
      if (message[at] === ",") {
        at += 1;
        skip();
        style = word();
        skip();
      }
      consume("}");
      return { kind: "number", name, style };
    }
    if (type !== "plural") return fail(`unsupported argument type "${type}"`);
    consume(",");
    skip();
    let offset = 0;
    if (message.startsWith("offset:", at)) {
      at += "offset:".length;
      offset = Number(word());
      if (!Number.isFinite(offset)) fail("bad offset");
    }
    const cases = new Map<string, readonly Piece[]>();
    for (;;) {
      skip();
      if (message[at] === "}") break;
      const selector = word();
      if (!PLURAL_CATEGORIES.has(selector) && !/^=\d+$/.test(selector)) {
        fail(`unknown plural selector "${selector}"`);
      }
      consume("{");
      cases.set(selector, sequence(true, true));
      consume("}");
    }
    at += 1;
    if (!cases.has("other")) fail('a plural needs an "other" case');
    return { kind: "plural", name, offset, cases };
  };
  return sequence(false, false);
}

const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur", "ps", "sd", "ug", "yi", "dv", "ckb", "ks"]);
const DIRECTIONS = new Map<string, boolean>();

/** Whether a locale is written right to left, from its tag. @internal */
function isRightToLeft(locale: string): boolean {
  let known = DIRECTIONS.get(locale);
  if (known === undefined) {
    try {
      const parsed = new Intl.Locale(locale) as Intl.Locale & {
        getTextInfo?: () => { direction?: string };
        textInfo?: { direction?: string };
      };
      const direction = (parsed.getTextInfo?.() ?? parsed.textInfo)?.direction;
      known = direction === undefined ? RTL_LANGUAGES.has(parsed.language) : direction === "rtl";
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      known = false;
    }
    DIRECTIONS.set(locale, known);
  }
  return known;
}

const PARSED = new Map<string, readonly Piece[]>();
const NUMBER_FORMATS = new Map<string, Intl.NumberFormat>();
const PLURAL_RULES = new Map<string, Intl.PluralRules>();

/** A cached `Intl.NumberFormat`. @internal */
function numberFormat(locale: string, style: string | undefined): Intl.NumberFormat {
  const key = `${locale}|${style ?? ""}`;
  let format = NUMBER_FORMATS.get(key);
  if (format === undefined) {
    format = new Intl.NumberFormat(
      locale,
      style === "percent"
        ? { style: "percent" }
        : style === "integer"
          ? { maximumFractionDigits: 0 }
          : undefined,
    );
    NUMBER_FORMATS.set(key, format);
  }
  return format;
}

/** Writes the pieces of a message with the given values. @internal */
function write(
  pieces: readonly Piece[],
  values: UiStringValues | undefined,
  locale: string,
  pound: number | undefined,
): string {
  let out = "";
  for (const piece of pieces) {
    if (typeof piece === "string") out += piece;
    else if (piece.kind === "pound") {
      out += numberFormat(locale, undefined).format(pound ?? 0);
    } else if (piece.kind === "argument") {
      const value = values?.[piece.name];
      // A string put into right-to-left text is fenced in isolates, so its own direction cannot reorder
      // the words and punctuation around it (the same rule as @shadow-js/i18n).
      out +=
        typeof value === "string" && value !== "" && isRightToLeft(locale)
          ? `\u2068${value}\u2069`
          : String(value ?? "");
    } else if (piece.kind === "number") {
      out += numberFormat(locale, piece.style).format(Number(values?.[piece.name] ?? 0));
    } else {
      const count = Number(values?.[piece.name] ?? 0);
      let rules = PLURAL_RULES.get(locale);
      if (rules === undefined) {
        rules = new Intl.PluralRules(locale);
        PLURAL_RULES.set(locale, rules);
      }
      const shifted = count - piece.offset;
      const chosen =
        piece.cases.get(`=${count}`) ??
        piece.cases.get(rules.select(shifted)) ??
        piece.cases.get("other") ??
        [];
      out += write(chosen, values, locale, shifted);
    }
  }
  return out;
}

/**
 * Fills a message with values. The message is a subset of ICU MessageFormat, the format of
 * `@shadow-js/i18n`: `{name}` inserts a value, `{n, number}` (also `percent` and `integer`) formats a
 * number for the locale, and `{n, plural, =0 {none} one {# item} other {# items}}` picks a case by the
 * plural rules of the locale (`#` is the number; the categories are `zero`, `one`, `two`, `few`, `many`
 * and `other`, and Arabic uses all six). `''` is an apostrophe, and `'{'` quotes a brace. In a
 * right-to-left locale a string value is fenced in bidirectional isolates (U+2068 and U+2069), so a Latin
 * name inside Arabic text does not reorder its neighbors. The same messages work in `@shadow-js/i18n`,
 * which supports more and prints them the same way.
 *
 * @param message The message.
 * @param values The values of its arguments.
 * @param locale The locale for numbers and plural rules, such as `"en"` or `"ar"`.
 * @returns The text.
 * @throws SyntaxError when the message is not valid, or uses a feature outside the subset (such as
 * `select`).
 * @example
 * import { formatUiString } from "@/lib/ui-strings";
 *
 * export const label = formatUiString("Page {page} of {pages}", { page: 2, pages: 9 }, "en");
 * @see {@link UiStringsProvider}
 * @since 1.0.0
 */
export function formatUiString(
  message: string,
  values: UiStringValues | undefined,
  locale: string,
): string {
  let pieces = PARSED.get(message);
  if (pieces === undefined) {
    pieces = parseMessage(message);
    if (PARSED.size >= 500) PARSED.clear();
    PARSED.set(message, pieces);
  }
  return write(pieces, values, locale, undefined);
}

/** What the provider shares: the translate function and the locale. @internal */
interface UiStringsContextValue {
  readonly translate: (key: string, values: UiStringValues | undefined) => string | undefined;
  readonly locale: Accessor<string | undefined>;
}

const stringsContext = createPartContext<UiStringsContextValue>("UiStringsProvider");

/** Adds the entries of a catalog to a flat map of dotted keys. @internal */
function flatten(catalog: UiStringsCatalog, prefix: string, into: Map<string, string>): void {
  for (const [name, value] of Object.entries(catalog)) {
    const key = prefix === "" ? name : `${prefix}.${name}`;
    if (typeof value === "string") into.set(key, value);
    else flatten(value, key, into);
  }
}

/**
 * Props of {@link UiStringsProvider}.
 * @see {@link UiStringsProvider}
 * @since 1.0.0
 */
export interface UiStringsProviderProps {
  /**
   * The messages, such as the pack `@shadow-js/ui/locales/ar`. A key that is missing keeps its English
   * text, or the text of an outer provider.
   * @default none
   */
  readonly strings?: UiStringsCatalog | undefined;
  /**
   * The locale of the messages, for plural rules and number formats.
   * @default the locale of the outer provider, else `"en"`
   */
  readonly locale?: string | undefined;
  /**
   * Looks a key up in your own i18n library. It is asked first; return `undefined` to decline. It may
   * read signals, so a change of language updates the text.
   * @default none
   */
  readonly translate?:
    | ((key: string, values: UiStringValues | undefined) => string | undefined)
    | undefined;
  /**
   * The app, or the part of it, that speaks this language.
   * @default none
   */
  readonly children?: JSX.Element | undefined;
}

/**
 * Sets the words the kit's components show to the user, for the part of the app below it: the labels of
 * icon buttons (Close, Next), the names of landmarks, "Page 2 of 9". Pass a pack such as
 * `@shadow-js/ui/locales/ar` as `strings`, or connect your i18n library with `translate`. A prop on a
 * component (a `labels` object, a `toggleLabel`) still wins over the provider.
 *
 * Without a provider every component shows its English text. A provider inside another one answers
 * first and leaves what it lacks to the outer one. The provider renders no element and handles no keys.
 *
 * @param props See {@link UiStringsProviderProps}.
 * @returns The children.
 * @example
 * import { UiStringsProvider } from "@/lib/ui-strings";
 *
 * export function Page() {
 *   return (
 *     <UiStringsProvider strings={{ dialog: { close: "Fermer" } }} locale="fr">
 *       <p>Content</p>
 *     </UiStringsProvider>
 *   );
 * }
 * @see {@link useUiStrings}
 * @since 1.0.0
 */
function UiStringsProvider(props: UiStringsProviderProps): JSX.Element {
  const parent = stringsContext.useOptional();
  const flat = useMemo(() => {
    const into = new Map<string, string>();
    if (props.strings !== undefined) flatten(props.strings, "", into);
    return into;
  });
  const locale = (): string | undefined => props.locale ?? parent?.locale();
  const translate = (key: string, values: UiStringValues | undefined): string | undefined => {
    const own = props.translate?.(key, values);
    if (typeof own === "string") return own;
    const message = flat().get(key);
    if (message !== undefined) {
      try {
        return formatUiString(message, values, locale() ?? "en");
      } catch (error) {
        // A broken translation must not break the page: the caller shows the English text instead.
        globalThis.reportError?.(error);
        return undefined;
      }
    }
    return parent?.translate(key, values);
  };
  return (
    <stringsContext.Provider value={{ translate, locale }}>
      {props.children}
    </stringsContext.Provider>
  );
}

/**
 * The translate function of the nearest {@link UiStringsProvider}: `t(key, fallback, values)` returns the
 * provider's message for the key, or the English `fallback` (filled in) without a provider or entry. The
 * kit's components use it for their built-in words; use it for your own parts of a copied component.
 *
 * @returns The translate function. Call it where the text is used (in JSX), not in setup, so a change of
 * language updates the text.
 * @example
 * import { useUiStrings } from "@/lib/ui-strings";
 *
 * export function CloseLabel() {
 *   const t = useUiStrings();
 *   return <span class="sr-only">{t("dialog.close", "Close")}</span>;
 * }
 * @see {@link UiStringsProvider}
 * @since 1.0.0
 */
function useUiStrings(): UiTranslate {
  const context = stringsContext.useOptional();
  return (key, fallback, values) => {
    const found = context?.translate(key, values);
    if (found !== undefined) return found;
    try {
      return formatUiString(fallback, values, "en");
    } catch (error) {
      globalThis.reportError?.(error);
      return fallback;
    }
  };
}

/**
 * The locale of the nearest {@link UiStringsProvider} that has one, or `undefined`. Components that
 * format numbers (the chart) use it as their default locale.
 *
 * @returns An accessor of the locale.
 * @example
 * import { useUiLocale } from "@/lib/ui-strings";
 *
 * export function Digits(props: { value: number }) {
 *   const locale = useUiLocale();
 *   return <span>{new Intl.NumberFormat(locale()).format(props.value)}</span>;
 * }
 * @see {@link UiStringsProvider}
 * @since 1.0.0
 */
function useUiLocale(): Accessor<string | undefined> {
  const context = stringsContext.useOptional();
  return () => context?.locale();
}

export { UiStringsProvider, useUiLocale, useUiStrings };
