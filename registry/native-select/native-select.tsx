import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Props of {@link NativeSelect}: the attributes of the `select`, and its size.
 * @since 1.0.0
 * @see {@link NativeSelect}
 */
export type NativeSelectProps = ComponentProps<"select"> & {
  /**
   * The height of the control: `default` is 36px and `sm` is 32px.
   * @default "default"
   */
  readonly size?: "sm" | "default" | undefined;
};

/**
 * The browser's own select, in the kit's look: the operating system's picker and keyboard, styled
 * like an input, with a chevron at the end (on the right in left-to-right text). Use
 * {@link NativeSelectOption} and {@link NativeSelectOptGroup} for its options.
 *
 * Keyboard and ARIA: the keys are the native select's. The select has the `combobox` role and
 * adds no ARIA attribute of its own. It has no visible name, so name it with `aria-label`, or with
 * a {@link Label} whose `htmlFor` points at its `id`. `aria-invalid="true"`, which you pass, turns
 * the border destructive.
 *
 * @param props The `select` attributes plus `size`. `class` styles the select itself; the chevron
 * sits in the wrapper.
 * @returns The wrapper `div` with the select and its chevron.
 * @example
 * import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
 *
 * <NativeSelect aria-label="Country">
 *   <NativeSelectOption value="se">Sweden</NativeSelectOption>
 * </NativeSelect>
 * @since 1.0.0
 * @see {@link NativeSelectOption}
 */
function NativeSelect(props: NativeSelectProps): JSX.Element {
  const [local, rest] = splitProps(props as NativeSelectProps & { readonly class?: unknown }, [
    "class",
    "size",
  ]);
  return (
    <div data-slot="native-select-wrapper" class="group/native-select relative w-fit">
      <select
        data-slot="native-select"
        data-size={(local.size as string | undefined) ?? "default"}
        class={cn(
          "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent py-2 ps-3 pe-9 text-sm shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50",
          // The small box is 32px: its padding shrinks with it, or the 20px text line is clipped.
          "data-[size=sm]:h-8 data-[size=sm]:py-1",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          local.class as string | undefined,
        )}
        {...rest}
      />
      <ChevronDownIcon
        aria-hidden="true"
        data-slot="native-select-icon"
        class="pointer-events-none absolute top-1/2 end-3.5 size-4 -translate-y-1/2 opacity-50 select-none group-has-[:disabled]/native-select:opacity-30 rtl:-scale-x-100"
      />
    </div>
  );
}

/**
 * An option of a {@link NativeSelect}: a native `option` with its `value` and its label as text.
 *
 * Keyboard and ARIA: the select's keys choose it; the option has the `option` role of the browser.
 *
 * @param props The `option` attributes (`value`, `disabled`, `selected`); the children are its label.
 * @returns The `option` element.
 * @example
 * import { NativeSelectOption } from "@/components/ui/native-select";
 *
 * <NativeSelectOption value="se">Sweden</NativeSelectOption>
 * @since 1.0.0
 * @see {@link NativeSelect}
 */
function NativeSelectOption(props: ComponentProps<"option">): JSX.Element {
  return <option data-slot="native-select-option" {...props} />;
}

/**
 * A labeled group of options of a {@link NativeSelect}: a native `optgroup`. Its `label` is shown
 * as the group's heading in the picker.
 *
 * Keyboard and ARIA: no keys and no role of its own; the browser announces the `label` as the
 * group's name.
 *
 * @param props The `optgroup` attributes, with `label` as the group's name. The children are the options.
 * @returns The `optgroup` element.
 * @example
 * import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
 *
 * <NativeSelect aria-label="Country">
 *   <NativeSelectOptGroup label="Nordic">
 *     <NativeSelectOption value="se">Sweden</NativeSelectOption>
 *   </NativeSelectOptGroup>
 * </NativeSelect>
 * @since 1.0.0
 * @see {@link NativeSelectOption}
 */
function NativeSelectOptGroup(props: ComponentProps<"optgroup">): JSX.Element {
  return <optgroup data-slot="native-select-optgroup" {...props} />;
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
