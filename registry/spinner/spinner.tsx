import { splitProps } from "@shadow-js/core";
import type { JSX } from "@shadow-js/web";
import { type IconProps, LoaderIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * A loading indicator: a spinning arc that assistive technology announces as "Loading". It is an
 * `svg` with `role="status"`. It is sized with `class` (the default is `size-4`, the icon size).
 * Under reduced motion it turns slowly instead of stopping, so it still reads as busy.
 *
 * Keyboard and ARIA: no keys. The element is `role="status"` with `aria-label="Loading"` by
 * default; pass your own `aria-label` (for example "Saving") to name what is loading.
 *
 * shadcn/ui differences: `class` replaces `className`. The spinner also keeps turning slowly under
 * reduced motion, which shadcn/ui does not do.
 *
 * @param props - The props: the attributes of the `svg`, such as `class` and `aria-label`.
 * @returns The spinner `svg`.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { Spinner } from "@/components/ui/spinner";
 *
 * export function SaveButton() {
 *   return (
 *     <Button disabled>
 *       <Spinner />
 *       Saving
 *     </Button>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function Spinner(props: IconProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  const t = useUiStrings();
  return (
    <LoaderIcon
      role="status"
      aria-label={t("spinner.loading", "Loading")}
      aria-hidden="false"
      data-slot="spinner"
      class={cn("size-4 animate-spin motion-reduce:animate-[spin_3s_linear_infinite]", local.class)}
      {...rest}
    />
  );
}

export { Spinner };
