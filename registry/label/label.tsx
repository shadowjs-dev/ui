import { splitProps } from "@shadow-js/core";
import {
  Label as LabelPrimitive,
  type LabelProps as LabelPrimitiveProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { type ClassValue, cn } from "@/lib/utils";

/** The props as the implementation sees them. */
type Loose = {
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link Label}: the primitive's props (`htmlFor`, `as`, and every `label` attribute).
 * @since 1.0.0
 * @see {@link Label}
 */
export type LabelProps<T extends PolymorphicTarget = "label"> = LabelPrimitiveProps<T>;

/**
 * The accessible name of a control: `htmlFor` points at the control's `id`, or the control is
 * wrapped in the label. It dims next to a disabled `peer` and inside a `group` marked
 * `data-disabled="true"`, and a repeated press on it does not select its text.
 *
 * Keyboard and ARIA: the label handles no keys and adds no ARIA attribute. It is a native `label`,
 * so a click on it activates the control it names, as the browser does for any label. The control
 * keeps its own keys.
 *
 * @param props The `label` attributes, plus `htmlFor` (the id of the control) and `as`. `class`
 * adds to the classes.
 * @returns The `label` element.
 * @example
 * import { Input } from "@/components/ui/input";
 * import { Label } from "@/components/ui/label";
 *
 * <div>
 *   <Label htmlFor="email">Email</Label>
 *   <Input id="email" type="email" />
 * </div>
 * @since 1.0.0
 * @see {@link LabelProps}
 */
function Label<T extends PolymorphicTarget = "label">(props: LabelProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <LabelPrimitive
      data-slot="label"
      class={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Label };
