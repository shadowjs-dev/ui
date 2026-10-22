import { splitProps } from "@shadow-js/core";
import { mergeElementProps } from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * Own props of {@link AspectRatio}. The rest of its props are the `div` attributes.
 * @since 1.0.0
 * @see {@link AspectRatio}
 */
export interface AspectRatioExtraProps {
  /**
   * Width divided by height, for example `16 / 9`. It is written to the CSS `aspect-ratio`
   * property.
   * @default 1
   */
  readonly ratio?: number | undefined;
}

/**
 * Props of {@link AspectRatio}: the attributes of a `div` plus `ratio`.
 * @since 1.0.0
 * @see {@link AspectRatio}
 */
export type AspectRatioProps = ComponentProps<"div"> & AspectRatioExtraProps;

/**
 * Keeps its content at a fixed width-to-height ratio, using the CSS `aspect-ratio` property. Make
 * the child fill the box, for example with `class="size-full object-cover"` on an image.
 *
 * Keyboard and ARIA: the box is not interactive and has no role. It adds no keys and no ARIA
 * attributes. Give an image inside it an `alt` text.
 *
 * Compared with shadcn/ui: `class` replaces `className`, and the element carries `data-slot`. A
 * `style` you pass is merged with the ratio, not replaced.
 *
 * @param props - The box props: `ratio`, `children`, and the `div` attributes.
 * @returns The box element.
 * @example
 * ```tsx
 * import { AspectRatio } from "@/components/ui/aspect-ratio";
 *
 * export function Cover() {
 *   return (
 *     <AspectRatio ratio={16 / 9}>
 *       <img src="/cover.jpg" alt="Cover" class="size-full object-cover" />
 *     </AspectRatio>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AspectRatioProps}
 */
function AspectRatio(props: AspectRatioProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "ratio", "children"]);
  const merged = mergeElementProps(
    {
      get style() {
        return { "aspect-ratio": String(local.ratio ?? 1) };
      },
    },
    rest,
  );
  return (
    <div data-slot="aspect-ratio" class={cn("relative w-full", local.class)} {...merged}>
      {local.children}
    </div>
  );
}

export { AspectRatio };
