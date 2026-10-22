import { splitProps } from "@shadow-js/core";
import type {
  CollapsibleContentProps,
  CollapsibleProps,
  CollapsibleTriggerProps,
  PolymorphicTarget,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * A list of the steps an agent takes: each is a line with an icon, a title and an optional description
 * and status. A line can expand with {@link TraceCollapsible}, or be wrapped in a link or the trigger of a
 * dialog, sheet, drawer or popover. Use `Trace` for the steps, `Message` for the reply and `Marker` for notes
 * between turns.
 *
 * Keyboard and ARIA: the container is a plain `div` with no role. A {@link TraceLine} on its own is text and is
 * not focusable. The line becomes a button when wrapped in {@link TraceCollapsibleTrigger}, or takes the keys of a link or
 * dialog trigger it is wrapped in. Status is shown with color and motion, so say it in the title too ("Running tests",
 * "Failed to run lint"). Inside a message scroller each added line is announced once.
 *
 * Compared with shadcn/ui: `as` replaces `render`, `class` replaces `className`, and every part has a `data-slot`.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The trace container.
 * @example
 * ```tsx
 * import { SearchIcon } from "@/components/ui/icons";
 * import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
 *
 * export function Step() {
 *   return (
 *     <Trace>
 *       <TraceLine>
 *         <TraceIcon>
 *           <SearchIcon />
 *         </TraceIcon>
 *         <TraceTitle>Searched for minimumReleaseAge</TraceTitle>
 *       </TraceLine>
 *     </Trace>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link TraceLine}
 * @see {@link TraceCollapsible}
 */
function Trace(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div data-slot="trace" class={cn("flex min-w-0 flex-col gap-1.5", local.class)} {...rest} />
  );
}

/**
 * The state of the work a {@link TraceLine} reports. A line with no status is finished work.
 * @since 1.0.0
 * @see {@link TraceLine}
 */
export type TraceStatus = "running" | "error" | "pending";

/**
 * Props of {@link TraceLine}: the attributes of a `span` plus `status` (`"running"`, `"error"` or `"pending"`).
 * Leave `status` out for work that finished.
 * @since 1.0.0
 * @see {@link TraceLine}
 */
export type TraceLineProps = ComponentProps<"span"> & { readonly status?: TraceStatus | undefined };

/**
 * One step: an icon, a title, an optional description. `status` says how the work is going: `running` shimmers the
 * title, `error` colors the line, `pending` italicizes the title and dims the icon. The line is a `span` and not a tab stop on its own: wrap it
 * in a trigger or a link to make it interactive.
 *
 * Keyboard and ARIA: no role and no keys. The title is the accessible name, so write it as a sentence, with the state in it.
 *
 * @param props - The line props: `status` and the `span` attributes.
 * @returns The line.
 * @example
 * ```tsx
 * import { Spinner } from "@/components/ui/spinner";
 * import { TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
 *
 * export const Running = (
 *   <TraceLine status="running">
 *     <TraceIcon>
 *       <Spinner aria-hidden="true" />
 *     </TraceIcon>
 *     <TraceTitle>Running pnpm build</TraceTitle>
 *   </TraceLine>
 * );
 * ```
 * @since 1.0.0
 * @see {@link Trace}
 */
function TraceLine(props: TraceLineProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "status"]);
  return (
    <span
      data-slot="trace-line"
      data-status={local.status}
      class={cn(
        "group/trace-line flex min-w-0 items-center gap-2 text-sm text-muted-foreground data-[status=error]:text-destructive data-[status=pending]:italic data-[status=pending]:[&_[data-slot=trace-icon]]:opacity-60",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The icon of a line. It is decorative and hidden from assistive technology. Before the title it names the
 * action; after the title it acts as an indicator.
 *
 * Keyboard and ARIA: `aria-hidden="true"`, no role and no keys.
 *
 * @param props - The `span` attributes and `class`.
 * @returns The icon slot.
 * @example
 * ```tsx
 * import { TerminalIcon } from "@/components/ui/icons";
 * import { TraceIcon } from "@/components/ui/trace";
 *
 * export const Icon = (
 *   <TraceIcon>
 *     <TerminalIcon />
 *   </TraceIcon>
 * );
 * ```
 * @since 1.0.0
 * @see {@link TraceLine}
 */
function TraceIcon(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      class={cn(
        "inline-flex shrink-0 items-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The text of a line: one line that truncates, and shimmers while the line is `running`.
 *
 * Keyboard and ARIA: no role and no keys. The text is the accessible name of the line (and of the trigger around it).
 *
 * @param props - The `span` attributes and `class`.
 * @returns The title.
 * @example
 * ```tsx
 * import { TraceTitle } from "@/components/ui/trace";
 *
 * export const Title = <TraceTitle>Read the build log</TraceTitle>;
 * ```
 * @since 1.0.0
 * @see {@link TraceLine}
 */
function TraceTitle(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="trace-title"
      class={cn("min-w-0 truncate group-data-[status=running]/trace-line:shimmer", local.class)}
      {...rest}
    />
  );
}

/**
 * Secondary text after the title: a diff stat, a duration, a count. It does not truncate.
 *
 * Keyboard and ARIA: no role and no keys.
 *
 * @param props - The `span` attributes and `class`.
 * @returns The description.
 * @example
 * ```tsx
 * import { TraceDescription } from "@/components/ui/trace";
 *
 * export const Count = <TraceDescription>2 of 5 done</TraceDescription>;
 * ```
 * @since 1.0.0
 * @see {@link TraceLine}
 */
function TraceDescription(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="trace-description"
      class={cn("shrink-0 text-xs text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * An expandable row: put a {@link TraceLine} in a {@link TraceCollapsibleTrigger} and the detail in a
 * {@link TraceCollapsibleContent}. It takes the props of Collapsible: `open` with `onOpenChange` to control it,
 * `defaultOpen` to start open. To open a row while it streams and still respect the reader's click, pass
 * `open={open ?? running}` with the reader's choice in `open`.
 *
 * Keyboard and ARIA: see {@link TraceCollapsibleTrigger}.
 *
 * @param props - The collapsible props.
 * @returns The row.
 * @example
 * ```tsx
 * import { TerminalIcon } from "@/components/ui/icons";
 * import {
 *   Trace,
 *   TraceCollapsible,
 *   TraceCollapsibleContent,
 *   TraceCollapsibleTrigger,
 *   TraceIcon,
 *   TraceLine,
 *   TraceTitle,
 * } from "@/components/ui/trace";
 *
 * export function Command() {
 *   return (
 *     <Trace>
 *       <TraceCollapsible>
 *         <TraceCollapsibleTrigger>
 *           <TraceLine>
 *             <TraceIcon>
 *               <TerminalIcon />
 *             </TraceIcon>
 *             <TraceTitle>Ran node --version</TraceTitle>
 *           </TraceLine>
 *         </TraceCollapsibleTrigger>
 *         <TraceCollapsibleContent>v24.18.0</TraceCollapsibleContent>
 *       </TraceCollapsible>
 *     </Trace>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Trace}
 */
function TraceCollapsible(props: CollapsibleProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <Collapsible
      data-slot="trace-collapsible"
      class={cn("group/trace-collapsible flex min-w-0 flex-col gap-1.5", local.class)}
      {...rest}
    />
  );
}

/**
 * The button that toggles a row. Put a {@link TraceLine} inside it; it adds a chevron at the end. Buttons cannot be
 * nested in it, so put row actions beside it, not inside.
 *
 * Keyboard and ARIA: a native button (Enter and Space) with `aria-expanded` and, while the panel is mounted,
 * `aria-controls`. The accessible name is the title of the line inside.
 *
 * @param props - The trigger props.
 * @returns The trigger button.
 * @example
 * ```tsx
 * import { TraceCollapsibleTrigger, TraceLine, TraceTitle } from "@/components/ui/trace";
 *
 * export const Row = (
 *   <TraceCollapsibleTrigger>
 *     <TraceLine>
 *       <TraceTitle>Researched in 3 steps</TraceTitle>
 *     </TraceLine>
 *   </TraceCollapsibleTrigger>
 * );
 * ```
 * @since 1.0.0
 * @see {@link TraceCollapsible}
 */
function TraceCollapsibleTrigger<T extends PolymorphicTarget = "button">(
  props: CollapsibleTriggerProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as { readonly class?: string; readonly children?: JSX.Element },
    ["class", "children"],
  );
  return (
    <CollapsibleTrigger
      data-slot="trace-collapsible-trigger"
      class={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-md text-start outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...(rest as object)}
    >
      <span class="flex min-w-0 flex-1 items-center">{local.children}</span>
      <ChevronRightIcon
        aria-hidden="true"
        class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/trace-collapsible:rotate-90 rtl:rotate-180 rtl:group-data-[state=open]/trace-collapsible:rotate-90 motion-reduce:transition-none"
      />
    </CollapsibleTrigger>
  );
}

/**
 * Props of {@link TraceCollapsibleContent}: the props of Collapsible's content plus `keepMounted`.
 * @since 1.0.0
 * @see {@link TraceCollapsibleContent}
 */
export type TraceCollapsibleContentProps = CollapsibleContentProps & {
  /** Keeps the detail mounted while the row is closed, so nested rows keep their open state. @default false */
  readonly keepMounted?: boolean | undefined;
};

/**
 * The expandable detail of a row: text, a code block, or a nested {@link Trace}. It is muted, so add `text-foreground` to a
 * block with its own background inside it. `keepMounted` keeps nested rows alive while this one is closed.
 *
 * Keyboard and ARIA: no role and no keys; it is the target of the trigger's `aria-controls`.
 *
 * @param props - The content props.
 * @returns The content.
 * @example
 * ```tsx
 * import { TraceCollapsibleContent } from "@/components/ui/trace";
 *
 * export const Detail = <TraceCollapsibleContent keepMounted>v24.18.0</TraceCollapsibleContent>;
 * ```
 * @since 1.0.0
 * @see {@link TraceCollapsible}
 */
function TraceCollapsibleContent(props: TraceCollapsibleContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "keepMounted"]);
  return (
    <CollapsibleContent
      data-slot="trace-collapsible-content"
      forceMount={local.keepMounted === true ? true : undefined}
      class={cn("ms-2 border-s ps-4 text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

export {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
};
