import { splitProps } from "@shadow-js/core";
import { Polymorphic, type PolymorphicProps, type PolymorphicTarget } from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * The class list of a marker for each `variant`. Use it to give another element the look of a marker.
 *
 * @example
 * ```tsx
 * import { markerVariants } from "@/components/ui/marker";
 *
 * export function Divider() {
 *   return <p class={markerVariants({ variant: "separator" })}>Today</p>;
 * }
 * ```
 * @since 1.0.0
 * @see {@link Marker}
 */
const markerVariants = cva(
  "group/marker flex w-full min-w-0 items-center gap-2 text-sm text-muted-foreground outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [a&]:transition-colors [a&]:hover:text-foreground [button&]:transition-colors [button&]:hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
  {
    variants: {
      variant: {
        default: "",
        border: "border-b pb-2",
        separator:
          "justify-center gap-3 text-xs before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/** The props as the implementation sees them. */
type Loose = VariantProps<typeof markerVariants> & {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link Marker}: every attribute of the chosen element plus `variant`, which is
 * `"default"` (an inline note), `"border"` (a rule under the row) or `"separator"` (a centered label
 * between two lines). The `as` prop picks the element (a `div` by default).
 * @since 1.0.0
 * @see {@link Marker}
 */
export type MarkerProps<T extends PolymorphicTarget = "div"> = PolymorphicProps<
  "div",
  VariantProps<typeof markerVariants>,
  T
>;

/**
 * An inline note between the messages of a conversation: "Checking the logs...", "Ada joined", a
 * date, or a place the thread can be restored to. It is a row with an optional {@link MarkerIcon} and
 * a {@link MarkerContent}. Render a link or a button with `as` to make the whole row interactive.
 *
 * Keyboard and ARIA: a marker is presentational and has no role of its own, so choose one for its
 * purpose: `role="status"` for work in progress (with a `Spinner` in the icon, so the change is
 * announced). Do not give a labeled separator `role="separator"`: a separator has no name, so its text
 * would not be announced. As a `button` or a link it takes the native keys and shows a focus ring.
 *
 * Compared with shadcn/ui: `as` replaces `render`, `class` replaces `className`, and every part has a `data-slot`.
 *
 * @param props - The marker props: `variant`, `as`, `children` and the attributes of the element.
 * @returns The marker element.
 * @example
 * ```tsx
 * import { Marker, MarkerContent } from "@/components/ui/marker";
 *
 * export function Today() {
 *   return (
 *     <Marker variant="separator">
 *       <MarkerContent>Today</MarkerContent>
 *     </Marker>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link MarkerIcon}
 * @see {@link MarkerContent}
 */
function Marker<T extends PolymorphicTarget = "div">(props: MarkerProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class", "variant"]);
  return (
    <Polymorphic
      as={local.as ?? "div"}
      data-slot="marker"
      data-variant={local.variant ?? "default"}
      class={cn(markerVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

/**
 * The icon of a marker, before its content. It is decorative: it is hidden from assistive
 * technology, so a marker that shows only an icon needs an `aria-label` or visible text.
 *
 * Keyboard and ARIA: no keys, and `aria-hidden="true"`.
 *
 * @param props - The `span` attributes and `class`.
 * @returns The icon slot.
 * @example
 * ```tsx
 * import { CheckIcon } from "@/components/ui/icons";
 * import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
 *
 * export function Done() {
 *   return (
 *     <Marker>
 *       <MarkerIcon>
 *         <CheckIcon />
 *       </MarkerIcon>
 *       <MarkerContent>Changes saved</MarkerContent>
 *     </Marker>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Marker}
 */
function MarkerIcon(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      class={cn("inline-flex shrink-0 items-center", local.class)}
      {...rest}
    />
  );
}

/**
 * The text of a marker. It truncates in a row; in a separator it is the label between the lines. Add the
 * `shimmer` class from `animations.css` to a streaming line.
 *
 * Keyboard and ARIA: no keys and no role. The text is what a screen reader reads.
 *
 * @param props - The `span` attributes and `class`.
 * @returns The content slot.
 * @example
 * ```tsx
 * import { Marker, MarkerContent } from "@/components/ui/marker";
 *
 * export function Thinking() {
 *   return (
 *     <Marker role="status">
 *       <MarkerContent class="shimmer">Checking the logs...</MarkerContent>
 *     </Marker>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Marker}
 */
function MarkerContent(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="marker-content"
      class={cn(
        "min-w-0 truncate group-data-[variant=separator]/marker:overflow-visible",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Marker, MarkerContent, MarkerIcon, markerVariants };
