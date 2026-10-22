import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  type ProgressIndicatorProps as PrimitiveIndicatorProps,
  type ProgressLabelProps as PrimitiveLabelProps,
  type ProgressValueProps as PrimitiveValueProps,
  Progress as ProgressPrimitive,
  type ProgressProps as ProgressPrimitiveProps,
  progressContext,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { type ClassValue, cn } from "@/lib/utils";

/** The props as the implementation sees them. */
type Loose = {
  readonly class?: ClassValue;
  readonly value?: number | null | undefined;
  readonly max?: number | undefined;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link Progress}: the primitive's props (`value`, `max`, `getValueLabel`) and the
 * attributes of the rendered `div`.
 * @since 1.0.0
 * @see {@link Progress}
 */
export type ProgressProps<T extends PolymorphicTarget = "div"> = ProgressPrimitiveProps<T>;

/** Shared track styling for the compact and composable forms. */
const TRACK_CLASS =
  "relative h-2 w-full overflow-hidden rounded-full bg-primary/20 forced-colors:border forced-colors:border-[ButtonText] forced-colors:bg-[Canvas]";

/**
 * A bar showing how far a task has got. `value` runs from 0 to `max` (default 100). Without a valid
 * `value` the bar is indeterminate: a 40% segment sweeps back and forth, and it stays still under
 * reduced motion. The bar fills from the start edge in both reading directions.
 * Supplying children composes the parts: `ProgressLabel`, `ProgressValue`, and a `ProgressTrack`
 * containing `ProgressIndicator`. Without a children prop the compact track and fill are supplied.
 *
 * Keyboard and ARIA: the bar is a `role="progressbar"` with `aria-valuemin="0"`, `aria-valuemax`,
 * and `aria-valuenow` and `aria-valuetext`, which are left out while it is indeterminate. It is not
 * focusable and has no keys. Name it with `aria-label` or `aria-labelledby`, because a bar with no
 * name does not say what it measures.
 *
 * @param props `value` (a number, or `null` for indeterminate), `max`, and `getValueLabel`. `class`
 * adds to the classes of the track; the rest are the `div` attributes.
 * @returns The progress bar, with its automatic indicator or the supplied parts.
 * @example
 * import { Progress } from "@/components/ui/progress";
 *
 * <Progress value={33} aria-label="Upload" />
 * @since 1.0.0
 * @see {@link ProgressProps}
 */
function Progress<T extends PolymorphicTarget = "div">(props: ProgressProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, [
    "class",
    "value",
    "max",
    "children",
  ]);
  // Inspect presence without evaluating children before the primitive provides their context.
  const composed = Object.hasOwn(props, "children");
  return (
    <ProgressPrimitive
      data-slot="progress"
      value={local.value}
      max={local.max}
      class={cn(composed ? "grid gap-2" : TRACK_CLASS, local.class)}
      {...rest}
    >
      {composed ? (local["children"] as JSX.Element) : <ProgressIndicator />}
    </ProgressPrimitive>
  );
}

/**
 * The clipped surface of a composable progress bar. Keyboard and ARIA: decorative; the root
 * carries the progressbar role.
 * @param props Div attributes and track classes.
 * @returns The track element.
 * @example
 * import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
 * <Progress value={40} aria-label="Upload"><ProgressTrack><ProgressIndicator /></ProgressTrack></Progress>
 * @see {@link Progress}
 * @since 1.0.0
 */
function ProgressTrack(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div data-slot="progress-track" class={cn(TRACK_CLASS, local.class)} {...rest}>
      {local.children}
    </div>
  );
}

/** Props of {@link ProgressIndicator}. @see {@link ProgressIndicator} @since 1.0.0 */
export type ProgressIndicatorProps<T extends PolymorphicTarget = "div"> =
  PrimitiveIndicatorProps<T>;

/**
 * The fill of a progress bar, sized from its root's value and maximum. Indeterminate bars use
 * the sweeping animation; reduced motion disables movement. Keyboard and ARIA: decorative.
 * @param props Primitive indicator attributes and classes.
 * @returns The indicator element.
 * @example
 * import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
 * <Progress value={40} aria-label="Upload"><ProgressTrack><ProgressIndicator /></ProgressTrack></Progress>
 * @see {@link ProgressTrack}
 * @since 1.0.0
 */
function ProgressIndicator<T extends PolymorphicTarget = "div">(
  props: ProgressIndicatorProps<T>,
): JSX.Element {
  const context = progressContext.use("ProgressIndicator");
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      class={cn(
        "h-full bg-primary transition-[width] motion-reduce:transition-none data-[state=indeterminate]:w-2/5 data-[state=indeterminate]:animate-progress-indeterminate data-[state=indeterminate]:motion-reduce:animate-none forced-colors:bg-[Highlight]",
        local.class,
      )}
      style={{
        width:
          context.value() === null
            ? undefined
            : `${((context.value() ?? 0) / context.max()) * 100}%`,
      }}
      {...rest}
    />
  );
}

/** Props of {@link ProgressLabel}. @see {@link ProgressLabel} @since 1.0.0 */
export type ProgressLabelProps<T extends PolymorphicTarget = "span"> = PrimitiveLabelProps<T>;

/**
 * A visible label that names the root while mounted. Keyboard: none; ARIA labeling is supplied
 * by the primitive.
 * @param props Primitive label attributes and classes.
 * @returns The label element.
 * @example
 * import { Progress, ProgressLabel, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
 * <Progress value={40}><ProgressLabel>Upload</ProgressLabel><ProgressTrack><ProgressIndicator /></ProgressTrack></Progress>
 * @see {@link Progress}
 * @since 1.0.0
 */
function ProgressLabel<T extends PolymorphicTarget = "span">(
  props: ProgressLabelProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      class={cn("text-sm font-medium", local.class)}
      {...rest}
    />
  );
}

/** Props of {@link ProgressValue}. @see {@link ProgressValue} @since 1.0.0 */
export type ProgressValueProps<T extends PolymorphicTarget = "span"> = PrimitiveValueProps<T>;

/**
 * The root's visible percentage or custom value text, empty while indeterminate. Keyboard:
 * none; the root announces the same text through `aria-valuetext`.
 * @param props Primitive value attributes and classes; children override the default text.
 * @returns The value element.
 * @example
 * import { Progress, ProgressLabel, ProgressValue, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
 * <Progress value={40}><ProgressLabel>Upload</ProgressLabel><ProgressValue /><ProgressTrack><ProgressIndicator /></ProgressTrack></Progress>
 * @see {@link Progress}
 * @since 1.0.0
 */
function ProgressValue<T extends PolymorphicTarget = "span">(
  props: ProgressValueProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      class={cn("text-sm text-muted-foreground tabular-nums", local.class)}
      {...rest}
    />
  );
}

export { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue };
