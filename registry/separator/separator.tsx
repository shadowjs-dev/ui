import { splitProps } from "@shadow-js/core";
import { Separator as SeparatorPrimitive, type SeparatorProps } from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A thin line that separates content, horizontal (the default) or vertical. It is decorative unless
 * you say otherwise: a decorative separator is removed from the accessibility tree (`role="none"`).
 * Pass `decorative={false}` to expose it as `role="separator"`, and `aria-orientation="vertical"` is
 * then set when it is vertical.
 *
 * Keyboard and ARIA: the separator is not focusable and has no keys. Decorative: `role="none"`, and
 * no `aria-orientation`. Semantic (`decorative={false}`): `role="separator"`, plus
 * `aria-orientation="vertical"` only when vertical, because horizontal is the default of the role.
 * Both carry `data-orientation` (`"horizontal"` or `"vertical"`).
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `orientation`, `decorative`, and the attributes of the `div`.
 * @returns The separator element.
 * @example
 * ```tsx
 * import { Separator } from "@/components/ui/separator";
 *
 * export function Toolbar() {
 *   return (
 *     <div class="flex h-5 items-center gap-4">
 *       <span>Home</span>
 *       <Separator orientation="vertical" />
 *       <span>Docs</span>
 *     </div>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function Separator(props: SeparatorProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "decorative"]);
  return (
    <SeparatorPrimitive
      data-slot="separator"
      decorative={local.decorative ?? true}
      class={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px forced-colors:bg-[CanvasText]",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Separator };
