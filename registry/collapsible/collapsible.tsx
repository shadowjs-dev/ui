import { splitProps } from "@shadow-js/core";
import {
  type CollapsibleContentProps,
  Collapsible as CollapsiblePrimitive,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A panel that expands and collapses from a trigger, for one disclosure such as a "show more"
 * section. It is controlled with `open` and `onOpenChange`, or uncontrolled with `defaultOpen`.
 * For a stack of such panels use the accordion.
 *
 * Keyboard and ARIA: Enter and Space on the trigger toggle the panel, because the trigger is a
 * native `button`. The trigger gets `aria-expanded`, and `aria-controls` naming the panel while the
 * panel is mounted. The root and the panel have no role, so the trigger's text (or an `aria-label`)
 * is its name. `data-state` (`"open"` or `"closed"`) is set on the root, the trigger and the panel.
 * A `disabled` collapsible makes the trigger natively `disabled`.
 *
 * shadcn/ui differences: `as` replaces `asChild` on `CollapsibleTrigger`. The prop is `class`, not `className`, and every part has a `data-slot` (`collapsible`, `collapsible-trigger` and
 * `collapsible-content`).
 *
 * @example
 * import { Button } from "@/components/ui/button";
 * import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 *
 * export function MoreDetails() {
 *   return (
 *     <Collapsible>
 *       <CollapsibleTrigger as={Button} variant="ghost">
 *         Show more
 *       </CollapsibleTrigger>
 *       <CollapsibleContent>Hidden until opened.</CollapsibleContent>
 *     </Collapsible>
 *   );
 * }
 * @see {@link CollapsibleTrigger}
 * @see {@link CollapsibleContent}
 * @since 1.0.0
 */
function Collapsible(props: CollapsibleProps): JSX.Element {
  return <CollapsiblePrimitive data-slot="collapsible" {...props} />;
}

/**
 * The button that expands and collapses the panel. It takes the attributes of the element it
 * renders (`as` picks the element, such as a shadcn `Button`).
 *
 * @param props The trigger props: the attributes of the rendered element, with `as` to choose it.
 * @returns The rendered trigger.
 * @throws Error when rendered outside a {@link Collapsible}.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 *
 * export function Details() {
 *   return (
 *     <Collapsible>
 *       <CollapsibleTrigger as={Button} variant="ghost" size="sm">
 *         Toggle
 *       </CollapsibleTrigger>
 *       <CollapsibleContent>Details.</CollapsibleContent>
 *     </Collapsible>
 *   );
 * }
 * @see {@link Collapsible}
 * @since 1.0.0
 */
function CollapsibleTrigger<T extends PolymorphicTarget = "button">(
  props: CollapsibleTriggerProps<T>,
): JSX.Element {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

/**
 * The panel that expands and collapses. Its height animates with the `animate-collapsible-down`
 * and `animate-collapsible-up` utilities, which read the measured height from the CSS variable
 * `--primitives-collapsible-content-height`. Content open on the first render does not animate in.
 *
 * @param props The panel props: `class` is merged with the animation classes, and `forceMount`
 * keeps the panel mounted while closed.
 * @returns The rendered panel.
 * @throws Error when rendered outside a {@link Collapsible}.
 * @example
 * import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 *
 * export function Notes() {
 *   return (
 *     <Collapsible defaultOpen>
 *       <CollapsibleTrigger>Notes</CollapsibleTrigger>
 *       <CollapsibleContent class="space-y-2">
 *         <p>First note.</p>
 *       </CollapsibleContent>
 *     </Collapsible>
 *   );
 * }
 * @see {@link Collapsible}
 * @since 1.0.0
 */
function CollapsibleContent(props: CollapsibleContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      class={cn(
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
