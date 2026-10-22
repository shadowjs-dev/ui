import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  type RadioGroupItemProps,
  RadioGroup as RadioGroupPrimitive,
  type RadioGroupProps,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { CircleIcon } from "@/components/ui/icons";
import { type ClassValue, cn } from "@/lib/utils";

/** The props as the implementation sees them. */
type Loose = { readonly class?: ClassValue; readonly [prop: string]: unknown };

/**
 * A set of radio buttons of which exactly one can be checked. Controlled with `value` and
 * `onValueChange`, or uncontrolled with `defaultValue`. Use {@link RadioGroupItem} for each choice.
 *
 * Keyboard and ARIA: a `role="radiogroup"` of `role="radio"` items. The group is one tab stop: the
 * checked item, or the first enabled one. The arrow keys move focus and check the focused item;
 * Home and End move focus to the first and last enabled item without checking it; Space checks the
 * focused item; Enter does nothing; Tab leaves the group. In right-to-left text, Left and Right
 * swap. Name the group with `aria-label` or `aria-labelledby`. `required` sets `aria-required`.
 *
 * With a `name`, the checked value is submitted by a surrounding form, and `required` and form
 * reset work as they do for native radios.
 *
 * @param props The `div` attributes plus the group's options: `value`, `defaultValue`,
 * `onValueChange`, `name`, `required`, `disabled`, `orientation`, `dir`, `loop` and `form`. `class`
 * adds to the group's classes.
 * @returns The group element with its items inside.
 * @example
 * import { Label } from "@/components/ui/label";
 * import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
 *
 * <RadioGroup defaultValue="pro" aria-label="Plan">
 *   <RadioGroupItem value="free" id="plan-free" />
 *   <Label htmlFor="plan-free">Free</Label>
 *   <RadioGroupItem value="pro" id="plan-pro" />
 *   <Label htmlFor="plan-pro">Pro</Label>
 * </RadioGroup>
 * @since 1.0.0
 * @see {@link RadioGroupItem}
 */
function RadioGroup<T extends PolymorphicTarget = "div">(props: RadioGroupProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <RadioGroupPrimitive data-slot="radio-group" class={cn("grid gap-3", local.class)} {...rest} />
  );
}

/**
 * One radio of a {@link RadioGroup}. It shows its dot only while it is checked. Name it with a
 * {@link Label} (`id` and `htmlFor`) or with `aria-label`.
 *
 * Keyboard and ARIA: a `role="radio"` button with `aria-checked`. Space or a click checks it; Enter
 * does nothing; the arrow keys are handled by the group. A checked radio stays checked, since
 * pressing it again does not clear it. `disabled` disables the item and dims it.
 *
 * shadcn/ui differences: `as` replaces `asChild`.
 *
 * @param props The `button` attributes plus `value` (required; unique in the group), `disabled`,
 * `required`, `as` and `class`.
 * @returns The radio element.
 * @example
 * import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
 *
 * <RadioGroup aria-label="Plan">
 *   <RadioGroupItem value="pro" aria-label="Pro plan" />
 * </RadioGroup>
 * @since 1.0.0
 * @see {@link RadioGroup}
 */
function RadioGroupItem<T extends PolymorphicTarget = "button">(
  props: RadioGroupItemProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & { readonly value: string }, [
    "class",
    "value",
  ]);
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      value={local.value}
      class={cn(
        "inline-flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 motion-reduce:transition-none dark:bg-input/30 dark:aria-invalid:ring-destructive/40 forced-colors:border-[ButtonText] forced-colors:data-[state=checked]:border-[Highlight] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        class="relative flex items-center justify-center"
      >
        <CircleIcon class="size-2 fill-primary forced-colors:fill-[Highlight]" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
