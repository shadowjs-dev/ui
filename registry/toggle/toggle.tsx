import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  Toggle as TogglePrimitive,
  type ToggleProps as TogglePrimitiveProps,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * The class list of a toggle, built from `variant` and `size`. Use it to style another element
 * (for example a link) like a toggle. The pressed look comes from `data-state="on"`, which
 * {@link Toggle} sets.
 *
 * @param props - Optional `variant` (`"default"` or `"outline"`) and `size` (`"default"`, `"sm"` or
 * `"lg"`), and an optional `class` to add.
 * @returns The class string.
 * @example
 * ```tsx
 * import { toggleVariants } from "@/components/ui/toggle";
 *
 * export function BoldLink() {
 *   return (
 *     <a href="/bold" class={toggleVariants({ variant: "outline", size: "sm" })}>
 *       Bold
 *     </a>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Toggle}
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 motion-reduce:transition-none data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:aria-invalid:ring-destructive/40 forced-colors:data-[state=on]:bg-[Highlight] forced-colors:data-[state=on]:text-[HighlightText] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** The props as the implementation sees them. */
type Loose = VariantProps<typeof toggleVariants> & {
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link Toggle}: the primitive's props (`pressed`, `defaultPressed`, `onPressedChange`,
 * `disabled`), `variant` (`"default"` or `"outline"`) and `size` (`"default"`, `"sm"` or `"lg"`),
 * and the attributes of the rendered `button`. `as` renders another element instead.
 * @since 1.0.0
 * @see {@link Toggle}
 */
export type ToggleProps<T extends PolymorphicTarget = "button"> = TogglePrimitiveProps<T> &
  VariantProps<typeof toggleVariants>;

/**
 * A two-state button that is either pressed (on) or not. Controlled with `pressed` and
 * `onPressedChange`, or uncontrolled with `defaultPressed`. Pick a `variant` and a `size`.
 *
 * Keyboard and ARIA: Space, Enter and a click toggle it. It is a `button` with `aria-pressed`
 * (`"true"` or `"false"`) and `data-state` (`"on"` or `"off"`). Disabled, it is a disabled button.
 * A toggle that shows only an icon needs an `aria-label`, because the icon has no text to name it.
 *
 * shadcn/ui differences: `class` replaces `className`, and `as` replaces `asChild`.
 *
 * @param props - The props, see {@link ToggleProps}.
 * @returns The toggle `button`.
 * @example
 * ```tsx
 * import { Toggle } from "@/components/ui/toggle";
 *
 * export function BoldToggle() {
 *   return (
 *     <Toggle aria-label="Toggle bold" variant="outline" onPressedChange={(on: boolean) => console.log(on)}>
 *       B
 *     </Toggle>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link toggleVariants}
 */
function Toggle<T extends PolymorphicTarget = "button">(props: ToggleProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "variant", "size"]);
  return (
    <TogglePrimitive
      data-slot="toggle"
      class={cn(toggleVariants({ variant: local.variant, size: local.size }), local.class)}
      {...rest}
    />
  );
}

export { Toggle, toggleVariants };
