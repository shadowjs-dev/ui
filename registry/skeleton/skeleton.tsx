import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A placeholder shaped like the content that is loading: a pulsing block that you size with
 * `class`. The placeholder is decorative, so it is hidden from assistive technology
 * (`aria-hidden="true"`). Mark the region that loads with `aria-busy="true"`, or announce the
 * loading state with a status (see {@link Spinner}). Under reduced motion the pulse stops.
 *
 * Keyboard and ARIA: no keys and no role. The element is `aria-hidden="true"`, so the loading
 * state must be announced by the region around it, not by the placeholder.
 *
 * shadcn/ui differences: `class` replaces `className`. Unlike shadcn/ui, the placeholder is
 * `aria-hidden="true"` by default.
 *
 * @param props - The props: the attributes of the `div`. `class` is merged with the base classes.
 * @returns The placeholder `div`.
 * @example
 * ```tsx
 * import { Skeleton } from "@/components/ui/skeleton";
 *
 * export function CardSkeleton() {
 *   return (
 *     <div aria-busy="true" class="flex items-center gap-4">
 *       <Skeleton class="size-12 rounded-full" />
 *       <Skeleton class="h-4 w-[250px]" />
 *     </div>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Spinner}
 */
function Skeleton(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      class={cn("animate-pulse rounded-md bg-accent motion-reduce:animate-none", local.class)}
      {...rest}
    />
  );
}

export { Skeleton };
