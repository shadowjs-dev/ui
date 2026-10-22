import { type Accessor, onCleanup, useEffect, useMemo, useSignal } from "@shadow-js/core";
import type { JSX } from "@shadow-js/web";
import type { BundledLanguage, SpecialLanguage } from "shiki";

/**
 * One highlighted piece of a line: its text and the CSS custom properties that color it. The kit's code block
 * colors a piece with `--shiki-light` in the light theme and `--shiki-dark` in the dark one.
 * @since 1.0.0
 * @see {@link highlightCode}
 */
export interface HighlightedToken {
  /** The text of the piece. */
  readonly content: string;
  /** The custom properties that color it, or `undefined` when the piece has no color of its own. */
  readonly style: Readonly<Record<string, string>> | undefined;
}

/** A highlighted line: its pieces, in order. @since 1.0.0 */
export type HighlightedLine = readonly HighlightedToken[];

/** The two themes the code block colors with (Shiki's own names). */
const THEMES = { light: "github-light-high-contrast", dark: "github-dark" } as const;

/** What the part of Shiki's result that this file reads looks like. */
interface ShikiToken {
  readonly content: string;
  readonly htmlStyle?: Readonly<Record<string, string>> | undefined;
}

/** Whether Shiki can highlight this language id or alias: one of its grammars, or plain text and terminal output. */
function isLanguage(
  languages: Readonly<Record<string, unknown>>,
  language: string,
): language is BundledLanguage | SpecialLanguage {
  return language === "text" || language === "ansi" || Object.hasOwn(languages, language);
}

/**
 * Highlights code with Shiki and returns the lines as data, so the same result can be rendered on the server (in a loader, before
 * the page is sent) and in the browser. Shiki loads when this is first called and each grammar when its language is first used, so a page
 * that never highlights code never downloads it. The languages Shiki knows work, among them `bash`, `css`, `diff`, `html`,
 * `javascript`, `json`, `jsx`, `markdown`, `python`, `sql`, `tsx`, `typescript` and `yaml`, with aliases such as `ts`, `js`, `sh` and `yml`,
 * and `ansi` for terminal output with color codes.
 *
 * @param code - The source text.
 * @param language - The language id or alias.
 * @returns One entry per line, or `undefined` when the language is not one Shiki knows (show the lines plain then).
 * @example
 * ```tsx
 * import { highlightCode } from "@/hooks/use-highlighted-code";
 *
 * export async function loadLines() {
 *   return (await highlightCode("const answer = 42;", "ts")) ?? [];
 * }
 * ```
 * @since 1.0.0
 * @see {@link useHighlightedCode}
 */
export async function highlightCode(
  code: string,
  language: string,
): Promise<readonly HighlightedLine[] | undefined> {
  const shiki = await import("shiki");
  if (!isLanguage(shiki.bundledLanguages, language)) return undefined;
  const result = await shiki.codeToTokens(code, {
    lang: language,
    themes: THEMES,
    defaultColor: false,
  });
  return result.tokens.map((line) =>
    line.map((token: ShikiToken) => ({ content: token.content, style: token.htmlStyle })),
  );
}

/** One line of code as an element: the pieces in spans, colored by the custom properties. */
function lineOf(line: HighlightedLine): JSX.Element {
  return (
    <span data-slot="code-block-line" class="block min-h-[1lh]">
      {line.map((token) => (
        <span data-token="" style={token.style}>
          {token.content}
        </span>
      ))}
    </span>
  );
}

/**
 * Highlights code as it changes and returns one element per line. Until the first pass has finished, and for a language Shiki does not know, the
 * lines are plain, so the text is on the page at once and nothing jumps when the colors arrive. The answer to the latest text wins: while
 * a streaming reply grows, an older, slower pass is dropped instead of drawn over the newer text. On the server it returns the plain lines; to color
 * server-rendered code call {@link highlightCode} in a loader. Give the lines to the content of a code block.
 *
 * @param code - The source text, or an accessor of it.
 * @param language - The language id or alias, or an accessor of it.
 * @returns An accessor of the lines, as elements.
 * @example
 * ```tsx
 * import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
 * import { useHighlightedCode } from "@/hooks/use-highlighted-code";
 *
 * export function Snippet() {
 *   const lines = useHighlightedCode("const answer = 42;", "ts");
 *   return (
 *     <CodeBlock>
 *       <CodeBlockContent>{lines()}</CodeBlockContent>
 *     </CodeBlock>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link highlightCode}
 */
export function useHighlightedCode(
  code: string | Accessor<string>,
  language: string | Accessor<string>,
): Accessor<readonly JSX.Element[]> {
  const read = <T,>(value: T | Accessor<T>): T =>
    typeof value === "function" ? (value as Accessor<T>)() : value;
  const plain = (text: string): readonly HighlightedLine[] =>
    text.split("\n").map((line) => [{ content: line, style: undefined }]);
  const [data, setData] = useSignal<readonly HighlightedLine[]>(plain(read(code)));
  useEffect(() => {
    const text = read(code);
    const lang = read(language);
    // Show the new text at once, plain; the colors follow when the pass for exactly this text is done.
    setData(plain(text));
    let current = true;
    onCleanup(() => {
      current = false;
    });
    highlightCode(text, lang).then(
      (highlighted) => {
        if (current && highlighted !== undefined) setData(highlighted);
      },
      (error: unknown) => {
        // A failed load leaves the plain lines in place; the error still goes to the page's reporter.
        globalThis.reportError?.(error);
      },
    );
  });
  // The elements are made here, under this hook's owner, not in the promise callback that has none.
  const lines = useMemo(() => data().map(lineOf));
  return lines;
}
