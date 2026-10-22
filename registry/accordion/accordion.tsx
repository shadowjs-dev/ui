import { splitProps } from "@shadow-js/core";
import {
  type AccordionContentProps,
  type AccordionItemProps,
  Accordion as AccordionPrimitive,
  type AccordionProps,
  type AccordionTriggerProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { ChevronDownIcon } from "@/components/ui/icons";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * A vertically stacked set of headings that each reveal a section. With `type="single"` one item is
 * open at a time, and `collapsible` lets the open item close. With `type="multiple"` any number of
 * items can be open. Control it with `value` and `onValueChange`, or start uncontrolled with
 * `defaultValue`.
 *
 * Keyboard and ARIA: Enter and Space on a trigger toggle its item. Up and Down move focus between
 * the triggers and wrap around (Left and Right when `orientation="horizontal"`). Home and End focus
 * the first and last enabled trigger. Each trigger is a `button` inside an `h3` heading, with
 * `aria-expanded` and `aria-controls`. Each panel is a `role="region"` labeled by its trigger, so
 * give every trigger visible text as its accessible name. The behavior comes from `Accordion` in
 * `@shadow-js/primitives`.
 *
 * Compared with shadcn/ui: `class` replaces `className`, `as` replaces `asChild`, every element
 * carries `data-slot`, and the props are typed from `@shadow-js/primitives`.
 *
 * @param props - The accordion props: `type`, `value` or `defaultValue`, and the `div` attributes.
 * @returns The accordion root.
 * @example
 * ```tsx
 * import {
 *   Accordion,
 *   AccordionContent,
 *   AccordionItem,
 *   AccordionTrigger,
 * } from "@/components/ui/accordion";
 *
 * export function FaqAccordion() {
 *   return (
 *     <Accordion type="single" collapsible defaultValue="a">
 *       <AccordionItem value="a">
 *         <AccordionTrigger>Is it accessible?</AccordionTrigger>
 *         <AccordionContent>Yes. It follows the WAI-ARIA pattern.</AccordionContent>
 *       </AccordionItem>
 *     </Accordion>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AccordionItem}
 * @see {@link AccordionTrigger}
 * @see {@link AccordionContent}
 */
function Accordion(props: AccordionProps): JSX.Element {
  return <AccordionPrimitive data-slot="accordion" {...props} />;
}

/**
 * One section of an accordion: a trigger and its panel. The `value` identifies the item in the
 * accordion's `value` and `defaultValue`. The `class` is merged with the item's border classes.
 *
 * @param props - The item props: `value` (required), `disabled`, and the `div` attributes.
 * @returns The item element.
 * @example
 * ```tsx
 * import {
 *   Accordion,
 *   AccordionContent,
 *   AccordionItem,
 *   AccordionTrigger,
 * } from "@/components/ui/accordion";
 *
 * export function ShippingFaq() {
 *   return (
 *     <Accordion type="multiple">
 *       <AccordionItem value="shipping">
 *         <AccordionTrigger>Shipping</AccordionTrigger>
 *         <AccordionContent>Orders ship within two days.</AccordionContent>
 *       </AccordionItem>
 *     </Accordion>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Accordion}
 */
function AccordionItem(props: AccordionItemProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      class={cn("border-b last:border-b-0", local.class)}
      {...rest}
    />
  );
}

/** The props as the implementation sees them. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly children?: JSX.Element;
  readonly [prop: string]: unknown;
};

/**
 * The heading button of an item, with a chevron that turns when the item opens. It sits inside an
 * `h3` heading. Enter and Space toggle it; Up and Down (Left and Right when horizontal) and Home and
 * End move focus between the triggers of the accordion.
 *
 * The trigger's text is its accessible name. Its `class` goes on the button, and `as` replaces the
 * button element.
 *
 * @param props - The trigger props: the `button` attributes and `children` (the label).
 * @returns The heading with the trigger button inside.
 * @example
 * ```tsx
 * import {
 *   Accordion,
 *   AccordionContent,
 *   AccordionItem,
 *   AccordionTrigger,
 * } from "@/components/ui/accordion";
 *
 * export function Question() {
 *   return (
 *     <Accordion type="single">
 *       <AccordionItem value="a">
 *         <AccordionTrigger class="text-base">Is it styled?</AccordionTrigger>
 *         <AccordionContent>Yes.</AccordionContent>
 *       </AccordionItem>
 *     </Accordion>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AccordionItem}
 * @see {@link AccordionContent}
 */
function AccordionTrigger<T extends PolymorphicTarget = "button">(
  props: AccordionTriggerProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "children"]);
  return (
    <AccordionPrimitive.Header class="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        class={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-start text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
          local.class,
        )}
        {...rest}
      >
        {local.children}
        <ChevronDownIcon class="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * The panel of an item. It animates its height when it opens and closes. The `class` goes on the
 * inner wrapper, so padding does not break the animation.
 *
 * Keyboard and ARIA: the panel is a `role="region"` labeled by its trigger (`aria-labelledby`). It
 * has no keys of its own, and arrow keys pressed inside it do not move focus between triggers.
 *
 * @param props - The panel props: `children` and the `div` attributes. The `class` goes on the
 * inner wrapper.
 * @returns The panel element.
 * @example
 * ```tsx
 * import {
 *   Accordion,
 *   AccordionContent,
 *   AccordionItem,
 *   AccordionTrigger,
 * } from "@/components/ui/accordion";
 *
 * export function Answer() {
 *   return (
 *     <Accordion type="single" defaultValue="a">
 *       <AccordionItem value="a">
 *         <AccordionTrigger>Can I cancel?</AccordionTrigger>
 *         <AccordionContent class="text-muted-foreground">Yes, at any time.</AccordionContent>
 *       </AccordionItem>
 *     </Accordion>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AccordionTrigger}
 */
function AccordionContent(props: AccordionContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      class="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...rest}
    >
      <div class={cn("pt-0 pb-4", local.class)}>{local.children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
