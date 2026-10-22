import { splitProps } from "@shadow-js/core";
import {
  ScrollArea as ScrollAreaPrimitive,
  type ScrollAreaProps as ScrollAreaPrimitiveProps,
  type ScrollAreaScrollbarProps as ScrollAreaScrollbarPrimitiveProps,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A scrollable region with thin, styled scrollbars. The scrollbars show on hover by default; set
 * `type` to change that (`"auto"`, `"scroll"` or `"always"`). The thumb can be dragged, and a press
 * on the track outside the thumb pages the content.
 *
 * Keyboard and ARIA: the viewport is the tab stop while the content overflows, and the browser's
 * native scroll keys (arrow keys, Page Up, Page Down, Home and End) move it. The bars and thumbs
 * take no focus and have no key handling. The component sets no role or name; the bars are
 * `role="presentation"`. If the scrolled content needs a name, pass a `role` and an `aria-label`
 * to the root (for example `role="region"`).
 *
 * shadcn/ui differences: `class` replaces `className`, and the viewport, both scrollbars, their
 * thumbs and the corner are rendered for you, each with its `data-slot`.
 *
 * @example
 * ```tsx
 * import { ScrollArea } from "@/components/ui/scroll-area";
 *
 * export function Notes() {
 *   return (
 *     <ScrollArea class="h-72 w-48 rounded-md border">
 *       <div class="p-4">Long content goes here.</div>
 *     </ScrollArea>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ScrollArea}
 */
export type ScrollAreaProps = ScrollAreaPrimitiveProps;

/**
 * The scroll area: a viewport that scrolls, two scrollbars and a corner, styled. Pass the content
 * as children; the component adds the rest.
 *
 * @param props - The props, see {@link ScrollAreaProps}.
 * @returns The root `div` with the viewport, the scrollbars and the corner inside.
 * @example
 * ```tsx
 * import { ScrollArea } from "@/components/ui/scroll-area";
 *
 * export function Feed() {
 *   return (
 *     <ScrollArea type="always" class="h-40 w-64">
 *       <p>Scrollable text.</p>
 *     </ScrollArea>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ScrollBar}
 */
function ScrollArea(props: ScrollAreaProps): JSX.Element {
  const [local, rest] = splitProps(
    props as ScrollAreaProps & { readonly class?: unknown; readonly children?: unknown },
    ["class", "children"],
  );
  return (
    <ScrollAreaPrimitive
      data-slot="scroll-area"
      class={cn("relative", local.class as string | undefined)}
      {...rest}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        class="ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1 motion-reduce:transition-none"
      >
        {local.children as JSX.Element}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive>
  );
}

/**
 * Props of {@link ScrollBar}: the primitive's scrollbar props (`orientation` and `forceMount`) and
 * the attributes of the track `div`.
 * @since 1.0.0
 * @see {@link ScrollBar}
 */
export type ScrollBarProps = ScrollAreaScrollbarPrimitiveProps;

/**
 * One scrollbar of a scroll area: a track along the viewport's end edge (vertical) or bottom edge
 * (horizontal), with its thumb. {@link ScrollArea} already renders one of each, so you rarely need
 * this component. It is exported for areas built from `@shadow-js/primitives` directly. Its
 * `orientation` defaults to `"vertical"`.
 *
 * Keyboard and ARIA: the track is pointer only and has `role="presentation"`; it is hidden while the
 * root's `type` says it should not show.
 *
 * @param props - The props, see {@link ScrollBarProps}.
 * @returns The track element, with its thumb inside.
 * @example
 * ```tsx
 * import { ScrollArea as ScrollAreaPrimitive } from "@shadow-js/primitives";
 * import { ScrollBar } from "@/components/ui/scroll-area";
 *
 * export function WideList() {
 *   return (
 *     <ScrollAreaPrimitive class="relative h-40 w-64">
 *       <ScrollAreaPrimitive.Viewport class="size-full">
 *         <p class="w-[400px]">Wide content.</p>
 *       </ScrollAreaPrimitive.Viewport>
 *       <ScrollBar orientation="horizontal" />
 *     </ScrollAreaPrimitive>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ScrollArea}
 */
function ScrollBar(props: ScrollBarProps): JSX.Element {
  const [local, rest] = splitProps(
    props as ScrollBarProps & { readonly class?: unknown; readonly orientation?: unknown },
    ["class", "orientation"],
  );
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={(local.orientation as "vertical" | "horizontal" | undefined) ?? "vertical"}
      class={cn(
        "flex touch-none p-px transition-colors select-none",
        "data-[orientation=vertical]:absolute data-[orientation=vertical]:inset-y-0 data-[orientation=vertical]:end-0 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-s data-[orientation=vertical]:border-s-transparent",
        "data-[orientation=horizontal]:absolute data-[orientation=horizontal]:inset-x-0 data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent",
        local.class as string | undefined,
      )}
      {...rest}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        class="relative flex-1 rounded-full bg-border forced-colors:bg-[CanvasText] motion-reduce:transition-none"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
