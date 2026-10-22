import { splitProps } from "@shadow-js/core";
import {
  Checkbox as CheckboxPrimitive,
  type CheckboxProps as CheckboxPrimitiveProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { CheckIcon, MinusIcon } from "@/components/ui/icons";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * Props of {@link Checkbox}: `checked` (`true`, `false` or `"indeterminate"`), `defaultChecked`,
 * `onCheckedChange`, `disabled`, `required`, `name`, `value` and `form`. Every other prop is an
 * attribute of the rendered `button`, such as `id` or `aria-label`.
 * @see {@link Checkbox}
 * @since 1.0.0
 */
export type CheckboxProps<T extends PolymorphicTarget = "button"> = CheckboxPrimitiveProps<T>;

/** The props as the implementation sees them. */
type Loose = { readonly class?: ClassValue; readonly [prop: string]: unknown };

/**
 * A checkbox that checks, unchecks or marks a choice as mixed with `checked="indeterminate"`. Use it
 * for independent yes/no choices, including a parent of a group of choices.
 *
 * It is controlled with `checked` and `onCheckedChange`, or uncontrolled with `defaultChecked`. With
 * a `name` it takes part in native forms: a checked box submits its `value` (`"on"` by default),
 * `required` blocks submission while unchecked, and a form reset restores `defaultChecked`.
 *
 * Keyboard and ARIA: Space toggles the checkbox. Enter does nothing, as the WAI-ARIA checkbox pattern
 * requires, so it never submits a surrounding form. The element is a `button` with
 * `role="checkbox"`, `aria-checked` (`"true"`, `"false"` or `"mixed"` when indeterminate) and
 * `data-state` (`"checked"`, `"unchecked"` or `"indeterminate"`); `required` sets `aria-required`
 * and `disabled` sets the native `disabled` attribute and `data-disabled`. Clicking an indeterminate
 * checkbox checks it. Name it with a `Label` (`id` on the checkbox, `htmlFor` on the label), which
 * also toggles it when clicked, or with `aria-label`. The indicator is decorative.
 *
 * shadcn/ui differences: `as` replaces `asChild`. The prop is `class`, not `className`, and every element
 * has a `data-slot` (`checkbox` and `checkbox-indicator`).
 *
 * @example
 * import { Checkbox } from "@/components/ui/checkbox";
 * import { Label } from "@/components/ui/label";
 *
 * export function Terms() {
 *   return (
 *     <>
 *       <Checkbox id="terms" defaultChecked />
 *       <Label htmlFor="terms">Accept terms and conditions</Label>
 *     </>
 *   );
 * }
 * @see {@link CheckboxProps}
 * @since 1.0.0
 */
function Checkbox<T extends PolymorphicTarget = "button">(props: CheckboxProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      class={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 motion-reduce:transition-none data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary dark:data-[state=indeterminate]:bg-primary forced-colors:border-[ButtonText] forced-colors:data-[state=checked]:bg-[Highlight] forced-colors:data-[state=checked]:text-[HighlightText] forced-colors:data-[state=indeterminate]:bg-[Highlight] forced-colors:data-[state=indeterminate]:text-[HighlightText] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        class="grid place-content-center text-current transition-none"
      >
        <CheckIcon class="size-3.5 in-data-[state=indeterminate]:hidden" />
        <MinusIcon class="hidden size-3.5 in-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive>
  );
}

export { Checkbox };
