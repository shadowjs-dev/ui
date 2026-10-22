import { splitProps } from "@shadow-js/core";
import { Polymorphic, type PolymorphicProps, type PolymorphicTarget } from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * The class list of a bubble's frame for each `variant` and `align`. The look of the text surface is on
 * {@link BubbleContent}, which reads the variant from this element; this list is the box around it.
 *
 * @example
 * ```tsx
 * import { bubbleVariants } from "@/components/ui/bubble";
 *
 * export function Frame() {
 *   return <div class={bubbleVariants({ align: "end" })}>Custom row</div>;
 * }
 * ```
 * @since 1.0.0
 * @see {@link Bubble}
 */
const bubbleVariants = cva("group/bubble relative flex min-w-0 flex-col", {
  variants: {
    variant: {
      default: "",
      secondary: "",
      muted: "",
      tinted: "",
      outline: "",
      ghost: "w-full max-w-full",
      destructive: "",
    },
    align: {
      start: "me-auto items-start",
      end: "ms-auto items-end",
    },
  },
  compoundVariants: [
    {
      variant: ["default", "secondary", "muted", "tinted", "outline", "destructive"],
      class: "w-fit max-w-[85%]",
    },
  ],
  defaultVariants: { variant: "default", align: "start" },
});

/**
 * Props of {@link Bubble}: the attributes of a `div` plus `variant` (`"default"`, `"secondary"`,
 * `"muted"`, `"tinted"`, `"outline"`, `"ghost"` or `"destructive"`) and `align` (`"start"` or `"end"`).
 * @since 1.0.0
 * @see {@link Bubble}
 */
export type BubbleProps = ComponentProps<"div"> & VariantProps<typeof bubbleVariants>;

/**
 * A framed message in a conversation: a {@link BubbleContent} with an optional {@link BubbleReactions}.
 * `variant` picks the surface and `align` the side. A `ghost` bubble has no frame and uses the full width,
 * for a reply that reads as a document. In a chat, set `align` on a {@link Message} instead, which aligns the bubbles inside it.
 *
 * Keyboard and ARIA: a bubble has no role and no keys. Color is never the only signal: tell sender and meaning
 * apart by alignment, a name or an icon too.
 *
 * Compared with shadcn/ui: `class` replaces `className`, and every part has a `data-slot`.
 *
 * @param props - The bubble props: `variant`, `align`, `children` and the `div` attributes.
 * @returns The bubble.
 * @example
 * ```tsx
 * import { Bubble, BubbleContent } from "@/components/ui/bubble";
 *
 * export function Question() {
 *   return (
 *     <Bubble align="end" variant="muted">
 *       <BubbleContent>How do I add a dialog?</BubbleContent>
 *     </Bubble>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link BubbleContent}
 * @see {@link BubbleReactions}
 * @see {@link BubbleGroup}
 */
function Bubble(props: BubbleProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant", "align"]);
  return (
    <div
      data-slot="bubble"
      data-variant={local.variant ?? "default"}
      data-align={local.align ?? "start"}
      class={cn(bubbleVariants({ variant: local.variant, align: local.align }), local.class)}
      {...rest}
    />
  );
}

/** The props as the implementation sees them. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link BubbleContent}: every attribute of the chosen element. The `as` prop picks the element
 * (a `div` by default); pass `"a"` or `"button"` to make the bubble a link or a button.
 * @since 1.0.0
 * @see {@link BubbleContent}
 */
export type BubbleContentProps<T extends PolymorphicTarget = "div"> = PolymorphicProps<
  "div",
  object,
  T
>;

/**
 * The text surface of a {@link Bubble}: the rounded, colored box that holds the message. It takes its
 * colors from the bubble's `variant`. Render it as a link or a button with `as` for a bubble that does something.
 *
 * Keyboard and ARIA: no role of its own. A clickable bubble must be a real `button` or `a` (with `as`), so it takes
 * focus and the native keys; a `div` with a click handler is not reachable by keyboard.
 *
 * @param props - The content props: `as`, `children` and the attributes of the element.
 * @returns The content element.
 * @example
 * ```tsx
 * import { Bubble, BubbleContent } from "@/components/ui/bubble";
 *
 * export function Suggestion() {
 *   return (
 *     <Bubble variant="outline">
 *       <BubbleContent as="button" type="button">
 *         Summarize this page
 *       </BubbleContent>
 *     </Bubble>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Bubble}
 */
function BubbleContent<T extends PolymorphicTarget = "div">(
  props: BubbleContentProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class"]);
  return (
    <Polymorphic
      as={local.as ?? "div"}
      data-slot="bubble-content"
      class={cn(
        "min-w-0 rounded-2xl px-3.5 py-2 text-start text-sm leading-relaxed text-pretty break-words outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [a&]:transition-colors [button&]:transition-colors motion-reduce:transition-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        "group-data-[variant=default]/bubble:bg-primary group-data-[variant=default]/bubble:text-primary-foreground [a&]:group-data-[variant=default]/bubble:hover:bg-primary/90 [button&]:group-data-[variant=default]/bubble:hover:bg-primary/90",
        "group-data-[variant=secondary]/bubble:bg-secondary group-data-[variant=secondary]/bubble:text-secondary-foreground",
        "group-data-[variant=muted]/bubble:bg-muted group-data-[variant=muted]/bubble:text-foreground",
        "group-data-[variant=tinted]/bubble:bg-primary/10 group-data-[variant=tinted]/bubble:text-foreground",
        "group-data-[variant=outline]/bubble:border group-data-[variant=outline]/bubble:bg-background group-data-[variant=outline]/bubble:text-foreground [a&]:group-data-[variant=outline]/bubble:hover:bg-accent [button&]:group-data-[variant=outline]/bubble:hover:bg-accent",
        "group-data-[variant=ghost]/bubble:rounded-none group-data-[variant=ghost]/bubble:px-0 group-data-[variant=ghost]/bubble:py-0 group-data-[variant=ghost]/bubble:text-foreground",
        "group-data-[variant=destructive]/bubble:bg-destructive/10 group-data-[variant=destructive]/bubble:text-destructive",
        "forced-colors:border forced-colors:border-[CanvasText]",
        local.class,
      )}
      {...rest}
    />
  );
}

const reactionsVariants = cva(
  "absolute z-10 flex items-center gap-0.5 rounded-full border bg-background px-1.5 py-0.5 text-xs text-foreground shadow-xs [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      side: { top: "-top-3", bottom: "-bottom-3" },
      align: { start: "start-3", end: "end-3" },
    },
    defaultVariants: { side: "bottom", align: "end" },
  },
);

/**
 * Props of {@link BubbleReactions}: the attributes of a `div` plus `side` (`"top"` or `"bottom"`, the
 * default) and `align` (`"start"` or `"end"`, the default).
 * @since 1.0.0
 * @see {@link BubbleReactions}
 */
export type BubbleReactionsProps = ComponentProps<"div"> & VariantProps<typeof reactionsVariants>;

/**
 * A row of reactions that overlaps an edge of the bubble. Group them with `role="img"` and a descriptive
 * `aria-label` ("2 people liked this") when they are only a summary, or make each one a real button with a
 * label when they can be pressed. The bubble gains room under it for the overlap.
 *
 * Keyboard and ARIA: no role and no keys of its own; the buttons inside keep theirs.
 *
 * @param props - The reactions props: `side`, `align` and the `div` attributes.
 * @returns The reactions row.
 * @example
 * ```tsx
 * import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble";
 *
 * export function Liked() {
 *   return (
 *     <Bubble variant="muted">
 *       <BubbleContent>Shipped!</BubbleContent>
 *       <BubbleReactions role="img" aria-label="2 people liked this">
 *         <span aria-hidden="true">👍 2</span>
 *       </BubbleReactions>
 *     </Bubble>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Bubble}
 */
function BubbleReactions(props: BubbleReactionsProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "side", "align"]);
  return (
    <div
      data-slot="bubble-reactions"
      data-side={local.side ?? "bottom"}
      data-align={local.align ?? "end"}
      class={cn(reactionsVariants({ side: local.side, align: local.align }), local.class)}
      {...rest}
    />
  );
}

/**
 * Stacks consecutive bubbles from one sender with a small gap between them.
 *
 * Keyboard and ARIA: a plain `div`; it has no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The group.
 * @example
 * ```tsx
 * import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble";
 *
 * export function Burst() {
 *   return (
 *     <BubbleGroup>
 *       <Bubble variant="muted">
 *         <BubbleContent>First</BubbleContent>
 *       </Bubble>
 *       <Bubble variant="muted">
 *         <BubbleContent>Second</BubbleContent>
 *       </Bubble>
 *     </BubbleGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Bubble}
 */
function BubbleGroup(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div data-slot="bubble-group" class={cn("flex w-full flex-col gap-1", local.class)} {...rest} />
  );
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleVariants };
