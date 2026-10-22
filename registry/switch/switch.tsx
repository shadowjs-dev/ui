import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  Switch as SwitchPrimitive,
  type SwitchProps as SwitchPrimitiveProps,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * Props of {@link Switch}: the primitive's props (`checked`, `defaultChecked`, `onCheckedChange`,
 * `name`, `value`, `required`, `disabled`, `form`), `size` (`"default"` or `"sm"`), `as` to render
 * another element, and the attributes of the rendered element.
 * @since 1.0.0
 * @see {@link Switch}
 */
export type SwitchProps<T extends PolymorphicTarget = "button"> = SwitchPrimitiveProps<T> &
  SwitchExtraProps;

/**
 * The switch's own props: its size.
 * @since 1.0.0
 * @see {@link Switch}
 */
export interface SwitchExtraProps {
  /**
   * The size of the switch: `default` is 20px high and 32px wide, `sm` is 14px high and 24px wide.
   * @default "default"
   */
  readonly size?: "sm" | "default" | undefined;
}

/** The props as the implementation sees them. */
type Loose = {
  readonly class?: ClassValue;
  readonly size?: "sm" | "default" | undefined;
  readonly [prop: string]: unknown;
};

/**
 * A control that switches one setting on or off. Controlled with `checked` and `onCheckedChange`,
 * or uncontrolled with `defaultChecked`. With a `name` it takes part in native forms. The thumb
 * moves the right way in right-to-left layouts.
 *
 * Keyboard and ARIA: Tab moves focus to the switch. Space or Enter toggles it. It has
 * `role="switch"` and `aria-checked` (`"true"` or `"false"`), and `data-state` (`"checked"` or
 * `"unchecked"`). A disabled switch is a disabled button. `required` sets `aria-required`. Name it
 * with a {@link Label} (`id` on the switch, `htmlFor` on the label) or with `aria-label`. Clicking
 * the label toggles the switch.
 *
 * shadcn/ui differences: `as` replaces `asChild` for choosing the rendered element, and `class`
 * replaces `className`. Each part has its `data-slot` (`switch` and `switch-thumb`).
 *
 * @param props - The props, see {@link SwitchProps}.
 * @returns The switch element with its thumb inside.
 * @example
 * ```tsx
 * import { Label } from "@/components/ui/label";
 * import { Switch } from "@/components/ui/switch";
 *
 * export function AirplaneMode() {
 *   return (
 *     <div class="flex items-center gap-2">
 *       <Switch id="airplane" onCheckedChange={(on: boolean) => console.log(on)} />
 *       <Label htmlFor="airplane">Airplane mode</Label>
 *     </div>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SwitchProps}
 */
function Switch<T extends PolymorphicTarget = "button">(props: SwitchProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "size"]);
  return (
    <SwitchPrimitive
      data-slot="switch"
      data-size={local.size ?? "default"}
      class={cn(
        "peer group/switch inline-flex h-[1.15rem] w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 motion-reduce:transition-none data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 forced-colors:border-[ButtonText] forced-colors:data-[state=checked]:bg-[Highlight] forced-colors:data-[state=unchecked]:bg-[Canvas] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        class="pointer-events-none block size-4 group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 rounded-full bg-background ring-0 transition-transform motion-reduce:transition-none data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 rtl:data-[state=checked]:-translate-x-[calc(100%-2px)] dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground forced-colors:bg-[ButtonText] forced-colors:data-[state=checked]:bg-[HighlightText]"
      />
    </SwitchPrimitive>
  );
}

export { Switch };
