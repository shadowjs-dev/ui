import { onCleanup, splitProps, useSignal } from "@shadow-js/core";
import type { ComponentProps, JSX, JsxChild } from "@shadow-js/web";
import { Index } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * The class list of a code block for each `variant` and `size`. Use it to style any element like a code block.
 *
 * @example
 * ```tsx
 * import { codeBlockVariants } from "@/components/ui/code-block";
 *
 * export const Box = <pre class={codeBlockVariants({ variant: "destructive" })}>boom</pre>;
 * ```
 * @since 1.0.0
 * @see {@link CodeBlock}
 */
const codeBlockVariants = cva(
  "group/code-block relative flex min-w-0 flex-col overflow-hidden rounded-lg border bg-muted/40 text-foreground",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-destructive/40 bg-destructive/5 text-destructive",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/**
 * Props of {@link CodeBlock}: the attributes of a `div` plus `variant` (`"default"` or `"destructive"`, for an
 * error) and `size` (`"default"` or `"sm"`, for tool and trace output).
 * @since 1.0.0
 * @see {@link CodeBlock}
 */
export type CodeBlockProps = ComponentProps<"div"> & VariantProps<typeof codeBlockVariants>;

/**
 * A block of code, terminal output, a log or a diff. Put an optional {@link CodeBlockHeader} (a title and actions), a
 * {@link CodeBlockContent} and an optional {@link CodeBlockFooter} inside. Without a header, {@link CodeBlockActions}
 * float at the top end and show on hover or focus. The text always reads left to right, even on a right-to-left page, because code does. Streaming is
 * cheap: the content keeps one row for each line, so a growing reply rewrites only the last line.
 *
 * Keyboard and ARIA: the block is a plain `div`. The content is focusable by default (`tabindex="0"`), so a
 * keyboard user can scroll it. Floating actions appear on focus as well as on hover. Line numbers are hidden from assistive technology, and
 * diff lines carry `+` and `-` markers, so color is not the only cue.
 *
 * Compared with shadcn/ui: `class` replaces `className`, and every part has a `data-slot`. Highlighting is `useHighlightedCode`
 * (`@/hooks/use-highlighted-code`).
 *
 * @param props - The block props: `variant`, `size` and the `div` attributes.
 * @returns The block.
 * @example
 * ```tsx
 * import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
 *
 * export function Install() {
 *   return (
 *     <CodeBlock>
 *       <CodeBlockContent>{"npm install @shadow-js/ui"}</CodeBlockContent>
 *     </CodeBlock>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CodeBlockContent}
 * @see {@link CodeBlockHeader}
 */
function CodeBlock(props: CodeBlockProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant", "size"]);
  return (
    <div
      data-slot="code-block"
      data-variant={local.variant ?? "default"}
      data-size={local.size ?? "default"}
      dir="ltr"
      class={cn(codeBlockVariants({ variant: local.variant, size: local.size }), local.class)}
      {...rest}
    />
  );
}

/**
 * The bar above the code: a {@link CodeBlockTitle} at the start and {@link CodeBlockActions} at the end.
 *
 * Keyboard and ARIA: a plain `div`; no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The header.
 * @example
 * ```tsx
 * import { CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block";
 *
 * export const Header = (
 *   <CodeBlockHeader>
 *     <CodeBlockTitle>src/app.tsx</CodeBlockTitle>
 *   </CodeBlockHeader>
 * );
 * ```
 * @since 1.0.0
 * @see {@link CodeBlock}
 */
function CodeBlockHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="code-block-header"
      class={cn(
        "flex min-h-10 items-center justify-between gap-2 border-b px-3 py-1.5",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The title in the header: a file name or a command. It truncates.
 *
 * Keyboard and ARIA: a plain `div`; no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The title.
 * @example
 * ```tsx
 * import { CodeBlockTitle } from "@/components/ui/code-block";
 *
 * export const Title = <CodeBlockTitle>src/app.tsx</CodeBlockTitle>;
 * ```
 * @since 1.0.0
 * @see {@link CodeBlockHeader}
 */
function CodeBlockTitle(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="code-block-title"
      class={cn("min-w-0 truncate font-mono text-xs text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * Holds the actions (a copy button, a wrap toggle). In a header it sits at the end; directly in the block, without a header, it floats
 * at the top end and shows on hover or focus.
 *
 * Keyboard and ARIA: a plain `div`; the buttons inside are the focus stops. A toggle button should carry `aria-pressed` or
 * `aria-expanded`, with `aria-controls` pointing at the content's `id`.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The actions container.
 * @example
 * ```tsx
 * import { CodeBlockActions, CodeBlockCopyButton } from "@/components/ui/code-block";
 *
 * export const Actions = (
 *   <CodeBlockActions>
 *     <CodeBlockCopyButton value="npm install @shadow-js/ui" />
 *   </CodeBlockActions>
 * );
 * ```
 * @since 1.0.0
 * @see {@link CodeBlockCopyButton}
 */
function CodeBlockActions(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="code-block-actions"
      class={cn(
        "absolute end-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-focus-within/code-block:opacity-100 group-hover/code-block:opacity-100 motion-reduce:transition-none group-has-data-[slot=code-block-header]/code-block:static group-has-data-[slot=code-block-header]/code-block:opacity-100",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Props of {@link CodeBlockCopyButton}: every prop of {@link Button} plus the `value` to copy.
 * @since 1.0.0
 * @see {@link CodeBlockCopyButton}
 */
export type CodeBlockCopyButtonProps = Omit<ButtonProps, "children" | "onClick"> & {
  /** The text to copy. It is the source, so it never holds line numbers or diff markers. */
  readonly value: string;
  /** Called after the text was copied. @default none */
  readonly onCopy?: (() => void) | undefined;
  /** How long the check mark stays, in milliseconds. @default 2000 */
  readonly feedbackDuration?: number | undefined;
};

/**
 * A ghost icon button that copies `value` to the clipboard, then shows a check mark for two seconds and says "Copied" through a
 * polite live region. It copies the source text you pass, not what is on screen, so line numbers and diff markers are never in it.
 * If the browser refuses (no permission, an insecure page) nothing is shown as copied and the error goes to the page's error reporter.
 *
 * Keyboard and ARIA: a native button (Enter and Space), named "Copy code" (the kit's string `codeBlock.copy`). The text "Copied" is in a visually
 * hidden `role="status"` region that is always present, so its change is announced.
 *
 * @param props - The button props, `value` and `onCopy`.
 * @returns The button.
 * @example
 * ```tsx
 * import { CodeBlockCopyButton } from "@/components/ui/code-block";
 *
 * export const Copy = <CodeBlockCopyButton value="npm install @shadow-js/ui" />;
 * ```
 * @since 1.0.0
 * @see {@link CodeBlockActions}
 */
function CodeBlockCopyButton(props: CodeBlockCopyButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "class",
    "value",
    "onCopy",
    "feedbackDuration",
    "variant",
    "size",
  ]);
  const t = useUiStrings();
  const [copied, setCopied] = useSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));
  const copy = (): void => {
    navigator.clipboard.writeText(local.value).then(
      () => {
        setCopied(true);
        local.onCopy?.();
        clearTimeout(timer);
        timer = setTimeout(() => setCopied(false), local.feedbackDuration ?? 2000);
      },
      (error: unknown) => {
        globalThis.reportError?.(error);
      },
    );
  };
  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        type="button"
        variant={local.variant ?? "ghost"}
        size={local.size ?? "icon-sm"}
        aria-label={t("codeBlock.copy", "Copy code")}
        class={cn("text-muted-foreground", local.class)}
        onClick={copy}
        {...rest}
      >
        {copied() ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span role="status" class="sr-only">
        {copied() ? t("codeBlock.copied", "Copied") : ""}
      </span>
    </>
  );
}

/**
 * Props of {@link CodeBlockContent}: the attributes of a `pre` plus the options below. `children` is the code as a
 * string, or {@link CodeBlockLine} elements (what `useHighlightedCode` returns).
 * @since 1.0.0
 * @see {@link CodeBlockContent}
 */
export interface CodeBlockContentProps extends Omit<ComponentProps<"pre">, "children"> {
  /** The code: a string (split into lines), or line elements. @default none */
  readonly children?: string | JsxChild;
  /** Wraps long lines instead of scrolling sideways. Use it for error output. @default false */
  readonly wrap?: boolean | undefined;
  /** Numbers the lines. The numbers are drawn by CSS, so copying the text never includes them. @default false */
  readonly lineNumbers?: boolean | undefined;
  /** The number of the first line. @default 1 */
  readonly startLine?: number | undefined;
}

/** The text of a string as lines, with a final line break not counted as an empty line. */
function linesOf(text: string): string[] {
  const lines = text.split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

/**
 * The code itself, in a `pre` that scrolls. A string becomes one {@link CodeBlockLine} for each line; pass your own line elements for
 * highlighted tokens or line variants. `lineNumbers` and `startLine` number the lines, `wrap` wraps them, and a `max-h-*` class caps the height
 * (the content scrolls inside).
 *
 * Keyboard and ARIA: the `pre` is focusable (`tabindex="0"`, set `tabindex="-1"` to remove it) so its scrolling works from the keyboard; give it
 * an `aria-label` when the page has several blocks. Line numbers are generated by CSS, so they are not in the text a screen reader reads.
 *
 * @param props - The content props.
 * @returns The content.
 * @example
 * ```tsx
 * import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block";
 *
 * export function Numbered() {
 *   return (
 *     <CodeBlock>
 *       <CodeBlockContent lineNumbers startLine={10} class="max-h-48">
 *         {"const a = 1;\nconst b = 2;"}
 *       </CodeBlockContent>
 *     </CodeBlock>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CodeBlockLine}
 */
function CodeBlockContent(props: CodeBlockContentProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "wrap",
    "lineNumbers",
    "startLine",
    "tabindex",
    "style",
  ]);
  const text = (): string | undefined =>
    typeof local.children === "string" ? local.children : undefined;
  // The counter starts one before the first line, because each numbered line counts itself up first. Your own style is kept.
  const style = (): ComponentProps<"pre">["style"] => {
    if (local.lineNumbers !== true) return local.style;
    const reset = `line ${(local.startLine ?? 1) - 1}`;
    return typeof local.style === "string"
      ? `counter-reset: ${reset}; ${local.style}`
      : { ...local.style, "counter-reset": reset };
  };
  return (
    <pre
      data-slot="code-block-content"
      data-line-numbers={local.lineNumbers === true ? "" : undefined}
      tabindex={local.tabindex ?? 0}
      style={style()}
      class={cn(
        "group/code-content m-0 min-w-0 overflow-auto p-3 font-mono leading-relaxed outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.wrap === true ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        "[&_[data-token]]:text-(--shiki-light) dark:[&_[data-token]]:text-(--shiki-dark)",
        local.class,
      )}
      {...rest}
    >
      <code class="block min-w-fit">
        {text() === undefined ? (
          local.children
        ) : (
          <Index each={linesOf(text() ?? "")}>
            {(line) => <CodeBlockLine>{line()}</CodeBlockLine>}
          </Index>
        )}
      </code>
    </pre>
  );
}

const lineVariants = cva(
  "relative block min-h-[1lh] group-data-[line-numbers]/code-content:before:me-4 group-data-[line-numbers]/code-content:before:inline-block group-data-[line-numbers]/code-content:before:w-8 group-data-[line-numbers]/code-content:before:text-end group-data-[line-numbers]/code-content:before:text-muted-foreground group-data-[line-numbers]/code-content:before:content-[counter(line)] group-data-[line-numbers]/code-content:[counter-increment:line] group-data-[line-numbers]/code-content:before:select-none",
  {
    variants: {
      variant: {
        default: "",
        added:
          "-mx-3 bg-green-500/10 px-3 after:absolute after:start-0.5 after:top-0 after:text-green-600 after:content-['+'] dark:after:text-green-400",
        removed:
          "-mx-3 bg-red-500/10 px-3 after:absolute after:start-0.5 after:top-0 after:text-red-600 after:content-['-'] dark:after:text-red-400",
        highlighted: "-mx-3 bg-accent px-3",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/**
 * Props of {@link CodeBlockLine}: the attributes of a `span` plus `variant`, which is `"default"`, `"added"`, `"removed"` or `"highlighted"`.
 * @since 1.0.0
 * @see {@link CodeBlockLine}
 */
export type CodeBlockLineProps = ComponentProps<"span"> & VariantProps<typeof lineVariants>;

/**
 * One line of code. `added` and `removed` tint the line and put a `+` or `-` in the margin, drawn by CSS so it is not part of the
 * copied text and not read as code; `highlighted` marks a line to look at.
 *
 * Keyboard and ARIA: a plain `span` with no role and no keys. The diff markers are visual: say what a diff changed in the text around the block.
 *
 * @param props - The line props: `variant` and the `span` attributes.
 * @returns The line.
 * @example
 * ```tsx
 * import { CodeBlock, CodeBlockContent, CodeBlockLine } from "@/components/ui/code-block";
 *
 * export function Diff() {
 *   return (
 *     <CodeBlock>
 *       <CodeBlockContent>
 *         <CodeBlockLine variant="removed">const a = 1;</CodeBlockLine>
 *         <CodeBlockLine variant="added">const a = 2;</CodeBlockLine>
 *       </CodeBlockContent>
 *     </CodeBlock>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CodeBlockContent}
 */
function CodeBlockLine(props: CodeBlockLineProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  return (
    <span
      data-slot="code-block-line"
      data-variant={local.variant ?? "default"}
      class={cn(lineVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

/**
 * A row under the code, for a "Show more" toggle or a note. A toggle button in it should carry `aria-expanded` and `aria-controls` that
 * names the content's `id`.
 *
 * Keyboard and ARIA: a plain `div`; no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The footer.
 * @example
 * ```tsx
 * import { CodeBlockFooter } from "@/components/ui/code-block";
 *
 * export const Footer = <CodeBlockFooter>42 lines</CodeBlockFooter>;
 * ```
 * @since 1.0.0
 * @see {@link CodeBlock}
 */
function CodeBlockFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="code-block-footer"
      class={cn(
        "flex items-center justify-between gap-2 border-t px-3 py-1.5 text-xs text-muted-foreground",
        local.class,
      )}
      {...rest}
    />
  );
}

export {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
  codeBlockVariants,
};
