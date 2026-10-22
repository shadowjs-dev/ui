import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  Slider as SliderPrimitive,
  type SliderProps as SliderPrimitiveProps,
} from "@shadow-js/primitives";
import { For, type JSX } from "@shadow-js/web";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * Props that {@link Slider} adds to the primitive's props. Use them to name the thumbs and to
 * give a value text.
 * @since 1.0.0
 * @see {@link Slider}
 */
export interface SliderExtraProps {
  /**
   * The accessible name of each thumb of a range slider, by thumb index (for example
   * `["Minimum price", "Maximum price"]`). Without it a range of two thumbs is named "Minimum" and
   * "Maximum". A single-thumb slider is named by `aria-label` or `aria-labelledby` instead.
   * @default none (a range of two thumbs is named "Minimum" and "Maximum")
   */
  readonly thumbLabels?: readonly string[] | undefined;
  /**
   * The `aria-valuetext` of each thumb of a range, by thumb index (for example
   * `["40 events per second"]`). It is set on the thumb, the element with `role="slider"`, and
   * never on the group that wraps a range.
   * @default none
   */
  readonly thumbValueTexts?: readonly string[] | undefined;
  /**
   * The value text of a single-thumb slider, for example `"30 percent"`. It is set on the thumb.
   * @default none
   */
  readonly "aria-valuetext"?: string | undefined;
}

/** The props as the implementation sees them. */
type Loose = {
  readonly class?: ClassValue;
  readonly value?: readonly number[] | undefined;
  readonly defaultValue?: readonly number[] | undefined;
  readonly min?: number | undefined;
  readonly thumbLabels?: readonly string[] | undefined;
  readonly thumbValueTexts?: readonly string[] | undefined;
  readonly "aria-label"?: string | undefined;
  readonly "aria-labelledby"?: string | undefined;
  readonly "aria-valuetext"?: string | undefined;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link Slider}: the primitive's props (`value`, `defaultValue`, `onValueChange`,
 * `onValueCommit`, `min`, `max`, `step`, `orientation`, `dir`, `inverted`, `disabled`, `name` and
 * others), plus the {@link SliderExtraProps}. The remaining props are the attributes of the root
 * element.
 * @since 1.0.0
 * @see {@link Slider}
 */
export type SliderProps<T extends PolymorphicTarget = "span"> = SliderPrimitiveProps<T> &
  SliderExtraProps;

/**
 * Selects a number, or a range of several numbers, by dragging a thumb along a track or with the
 * keyboard. The number of thumbs is the length of `value` or `defaultValue` (one thumb at `min` when
 * neither is given). Use `value` and `onValueChange` to control it, or `defaultValue` to start it.
 *
 * Keyboard and ARIA: each thumb is a focusable element with `role="slider"`. Arrow keys move one
 * step (the arrow that raises the value follows the direction, `inverted` and the orientation).
 * Shift+Arrow and PageUp or PageDown move ten steps, and Home and End jump to the ends. The
 * thumb sets `aria-valuemin`, `aria-valuenow`, `aria-valuemax` and `aria-orientation`. While
 * disabled it leaves the tab order and has `aria-disabled="true"`. A single slider is named by
 * `aria-label` or `aria-labelledby`, which the component puts on its thumb. A range is a
 * `role="group"` named by `aria-label` or `aria-labelledby`, and each of its thumbs is named by
 * `thumbLabels` (default "Minimum" and "Maximum"). A press on the track moves the nearest thumb to
 * the pointer, and the drag continues outside the slider.
 *
 * shadcn/ui differences: `class` replaces `className`. Each thumb gets its own accessible name
 * here (`thumbLabels`, or `aria-label` for a single thumb). shadcn/ui does not name the thumbs.
 *
 * @param props - The props, see {@link SliderProps}.
 * @returns The slider root, with the track, the range and one thumb per value.
 * @example
 * ```tsx
 * import { Slider } from "@/components/ui/slider";
 *
 * export function VolumeControl() {
 *   return <Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" class="w-64" />;
 * }
 * ```
 * @since 1.0.0
 * @see {@link SliderProps}
 */
function Slider<T extends PolymorphicTarget = "span">(props: SliderProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, [
    "class",
    "value",
    "defaultValue",
    "min",
    "thumbLabels",
    "thumbValueTexts",
    "aria-label",
    "aria-labelledby",
    "aria-valuetext",
  ]);
  const values = (): readonly number[] => local.value ?? local.defaultValue ?? [local.min ?? 0];
  const single = (): boolean => values().length === 1;
  return (
    <SliderPrimitive
      data-slot="slider"
      value={local.value}
      defaultValue={local.defaultValue}
      min={local.min}
      role={single() ? undefined : "group"}
      aria-label={single() ? undefined : local["aria-label"]}
      aria-labelledby={single() ? undefined : local["aria-labelledby"]}
      class={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        local.class,
      )}
      {...rest}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        class="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5 forced-colors:border forced-colors:border-[ButtonText] forced-colors:bg-[Canvas]"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          class="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full forced-colors:bg-[Highlight]"
        />
      </SliderPrimitive.Track>
      <For each={values().map((_, index) => index)}>
        {(index: number) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            aria-label={single() ? local["aria-label"] : local.thumbLabels?.[index]}
            aria-labelledby={single() ? local["aria-labelledby"] : undefined}
            aria-valuetext={
              local.thumbValueTexts?.[index] ?? (single() ? local["aria-valuetext"] : undefined)
            }
            class="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden motion-reduce:transition-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace]"
          />
        )}
      </For>
    </SliderPrimitive>
  );
}

export { Slider };
