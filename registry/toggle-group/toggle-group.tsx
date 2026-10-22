import { createContext, splitProps, useContext } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  type ToggleGroupItemProps as ToggleGroupItemPrimitiveProps,
  ToggleGroup as ToggleGroupPrimitive,
  type ToggleGroupProps as ToggleGroupPrimitiveProps,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import type { VariantProps } from "class-variance-authority";
import { toggleVariants } from "@/components/ui/toggle";
import { type ClassValue, cn } from "@/lib/utils";

type ToggleVariants = VariantProps<typeof toggleVariants>;

/** What the items read from their group. */
interface ToggleGroupContextValue {
  readonly variant: () => ToggleVariants["variant"];
  readonly size: () => ToggleVariants["size"];
  readonly spacing: () => number;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  variant: () => "default",
  size: () => "default",
  spacing: () => 0,
});

/** The props as the implementation sees them. */
type Loose = ToggleVariants & {
  readonly class?: ClassValue;
  readonly children?: JSX.Element;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link ToggleGroup}: the primitive's props (`type="single" | "multiple"`, `value`,
 * `defaultValue`, `onValueChange`, `disabled`, `orientation`, `dir`, `loop`, `rovingFocus`),
 * `variant` and `size` (inherited by the items) and the attributes of the rendered `div`.
 * @since 1.0.0
 * @see {@link ToggleGroup}
 */
export type ToggleGroupProps<T extends PolymorphicTarget = "div"> = ToggleGroupPrimitiveProps<T> &
  ToggleVariants & {
    /**
     * The gap between the items, in units of the spacing scale (`spacing={2}` is 0.5 rem). `0` keeps the
     * items connected: they share their borders and only the two ends are rounded. Any other value puts
     * a gap between them and every item keeps its own corners and borders.
     * @default 0
     * @see {@link ToggleGroup}
     */
    readonly spacing?: number | undefined;
  };

/**
 * Props of {@link ToggleGroupItem}: the primitive's props (`value`, `disabled`), `variant` and
 * `size` (they win over the group's) and the attributes of the rendered `button`.
 * @since 1.0.0
 * @see {@link ToggleGroupItem}
 */
export type ToggleGroupItemProps<T extends PolymorphicTarget = "button"> =
  ToggleGroupItemPrimitiveProps<T> & ToggleVariants;

/**
 * A row of toggles that share one look. With `type="single"` at most one item is pressed, and the
 * items are radios. With `type="multiple"` any number can be pressed. Control it with `value` and
 * `onValueChange`, or start it with `defaultValue`. A single group reports one string (`""` when
 * the pressed item is pressed again), and a multiple group reports an array. `variant` and `size`
 * reach every item, unless an item sets its own.
 *
 * Keyboard and ARIA: the root is a `role="group"` and needs a name from you (`aria-label` or
 * `aria-labelledby`). The group is one tab stop: the item that had focus last, else the pressed
 * item, else the first enabled item. The arrow keys move between items (all four arrows unless
 * `orientation` is set; Left and Right swap in a right-to-left group), Home and End go to the ends,
 * and the group wraps and skips disabled items. Space and Enter press the focused item. In a single
 * group an item is a `role="radio"` with `aria-checked`; in a multiple group it has `aria-pressed`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props, see {@link ToggleGroupProps}.
 * @returns The group `div` with its items inside.
 * @example
 * ```tsx
 * import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
 *
 * export function TextStyle() {
 *   return (
 *     <ToggleGroup type="multiple" variant="outline" aria-label="Text style">
 *       <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
 *       <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
 *     </ToggleGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ToggleGroupItem}
 */
function ToggleGroup<T extends PolymorphicTarget = "div">(props: ToggleGroupProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, [
    "class",
    "variant",
    "size",
    "spacing",
    "children",
  ]);
  const spacing = (): number => (local.spacing as number | undefined) ?? 0;
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={local.variant}
      data-size={local.size}
      data-spacing={spacing()}
      style={{ "--gap": String(spacing()) }}
      class={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[variant=outline]:shadow-xs",
        local.class,
      )}
      {...(rest as unknown as ToggleGroupPrimitiveProps)}
    >
      <ToggleGroupContext.Provider
        value={{ variant: () => local.variant, size: () => local.size, spacing }}
      >
        {local.children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

/**
 * One toggle of a {@link ToggleGroup}, identified by its `value`. Items sit flush against each
 * other, so only the first and last item have rounded outer corners. A `variant` or `size` set on
 * the item wins over the group's.
 *
 * Keyboard and ARIA: as for the group (see {@link ToggleGroup}). Space and Enter press the item. It
 * is a `role="radio"` with `aria-checked` in a single group, and a `button` with `aria-pressed` in a
 * multiple group. An item that shows only an icon needs an `aria-label`.
 *
 * @param props - The props: `value` (required), `disabled`, `variant`, `size`, and the attributes of
 * the `button`.
 * @returns The item `button`.
 * @example
 * ```tsx
 * import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
 *
 * export function Alignment() {
 *   return (
 *     <ToggleGroup type="single" aria-label="Alignment">
 *       <ToggleGroupItem value="left" aria-label="Align left">
 *         Left
 *       </ToggleGroupItem>
 *       <ToggleGroupItem value="right" aria-label="Align right">
 *         Right
 *       </ToggleGroupItem>
 *     </ToggleGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ToggleGroup}
 */
function ToggleGroupItem<T extends PolymorphicTarget = "button">(
  props: ToggleGroupItemProps<T>,
): JSX.Element {
  const group = useContext(ToggleGroupContext);
  const [local, rest] = splitProps(props as unknown as Loose & { readonly value: string }, [
    "class",
    "variant",
    "size",
    "value",
  ]);
  const variant = (): ToggleVariants["variant"] => local.variant ?? group.variant();
  const size = (): ToggleVariants["size"] => local.size ?? group.size();
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={variant()}
      data-size={size()}
      data-spacing={group.spacing()}
      value={local.value}
      class={cn(
        toggleVariants({ variant: variant(), size: size() }),
        "min-w-0 flex-1 shrink-0 shadow-none focus:z-10 focus-visible:z-10 data-[spacing=0]:rounded-none data-[spacing=0]:first:rounded-s-md data-[spacing=0]:last:rounded-e-md data-[spacing=0]:data-[variant=outline]:border-s-0 data-[spacing=0]:data-[variant=outline]:first:border-s group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:first:rounded-b-none group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:last:rounded-b-md group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:last:rounded-t-none group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-s group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        local.class,
      )}
      {...rest}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
