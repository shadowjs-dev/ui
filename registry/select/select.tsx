import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  type SelectContentProps as SelectContentPrimitiveProps,
  type SelectGroupProps,
  SelectItemAlignedContent,
  type SelectItemProps as SelectItemPrimitiveProps,
  type SelectLabelProps,
  Select as SelectPrimitive,
  type SelectProps,
  type SelectScrollButtonProps,
  type SelectSeparatorProps,
  type SelectTriggerProps as SelectTriggerPrimitiveProps,
  type SelectValueProps,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icons";
import { type ClassValue, cn } from "@/lib/utils";

/** The props as the implementation sees them. */
type Loose = {
  readonly class?: ClassValue;
  readonly children?: JSX.Element;
  readonly [prop: string]: unknown;
};

/**
 * A control that picks one value from a list shown in a popup, like a native `select` with a styled
 * listbox. Put a {@link SelectTrigger} (with a {@link SelectValue}) and a {@link SelectContent} of
 * {@link SelectItem}s inside it. Control it with `value` and `onValueChange`, and `open` and
 * `onOpenChange`, or start it with `defaultValue` and `defaultOpen`. With a `name` it takes part in
 * native forms. The value `""` means nothing is selected and shows the placeholder, so no item may
 * use `""`.
 *
 * Keyboard and ARIA: the trigger is a combobox that opens the list with Enter, Space, ArrowDown or
 * ArrowUp. Inside the list, the arrow keys, Home and End move between items, Enter and Space select
 * the focused item, Escape closes the list without changing the value, and focus returns to the
 * trigger. Name the trigger with a `Label` (`id` on the trigger, `htmlFor` on the label) or with
 * `aria-label`. See {@link SelectTrigger} and {@link SelectContent}.
 *
 * shadcn/ui differences: `class` replaces `className`. `position` is `"popper"` (the default) or
 * `"item-aligned"`, which puts the selected item over the trigger like a native select.
 *
 * @param props - The props, see {@link SelectProps}.
 * @returns The select context around its parts. It renders no element of its own, except the hidden
 * native `select` when `name` is set.
 * @example
 * ```tsx
 * import {
 *   Select,
 *   SelectContent,
 *   SelectGroup,
 *   SelectItem,
 *   SelectLabel,
 *   SelectTrigger,
 *   SelectValue,
 * } from "@/components/ui/select";
 *
 * export function FruitPicker() {
 *   return (
 *     <Select defaultValue="apple">
 *       <SelectTrigger class="w-[180px]" aria-label="Fruit">
 *         <SelectValue placeholder="Select a fruit" />
 *       </SelectTrigger>
 *       <SelectContent>
 *         <SelectGroup>
 *           <SelectLabel>Fruits</SelectLabel>
 *           <SelectItem value="apple">Apple</SelectItem>
 *           <SelectItem value="banana">Banana</SelectItem>
 *         </SelectGroup>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectTrigger}
 */
function Select(props: SelectProps): JSX.Element {
  return <SelectPrimitive {...props} />;
}

/**
 * A group of related items under a {@link SelectLabel}. It is a `role="group"` named by its label.
 *
 * Keyboard and ARIA: no keys of its own. The group is named by its {@link SelectLabel}.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the group element.
 * @returns The group element.
 * @example
 * ```tsx
 * import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";
 *
 * export function FruitList() {
 *   return (
 *     <Select>
 *       <SelectContent>
 *         <SelectGroup>
 *           <SelectLabel>Fruits</SelectLabel>
 *           <SelectItem value="apple">Apple</SelectItem>
 *         </SelectGroup>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectLabel}
 */
function SelectGroup<T extends PolymorphicTarget = "div">(props: SelectGroupProps<T>): JSX.Element {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

/**
 * The text of the selected item, shown inside the trigger, or `placeholder` while nothing is
 * selected. The text comes from the item itself, so it is known before the list is ever opened.
 *
 * Keyboard and ARIA: no keys. It is the trigger's visible value, so name the trigger, not this
 * part. Server markup contains the selected text only when you pass it as `children`, which is then
 * shown while a value is selected: `<SelectValue placeholder="Pick">{label}</SelectValue>`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `placeholder`, `children`, and the attributes of the value element.
 * @returns The selected text, or the placeholder.
 * @example
 * ```tsx
 * import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
 *
 * export function FruitTrigger() {
 *   return (
 *     <Select>
 *       <SelectTrigger aria-label="Fruit">
 *         <SelectValue placeholder="Select a fruit" />
 *       </SelectTrigger>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectTrigger}
 */
function SelectValue<T extends PolymorphicTarget = "span">(
  props: SelectValueProps<T>,
): JSX.Element {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/**
 * Own props of {@link SelectTrigger}.
 * @since 1.0.0
 * @see {@link SelectTrigger}
 */
export interface SelectTriggerExtraProps {
  /**
   * `default` (36px high) or `sm` (32px).
   * @default "default"
   */
  readonly size?: "sm" | "default" | undefined;
}

/**
 * Props of {@link SelectTrigger}: the attributes of the rendered `button` and `size`.
 * @since 1.0.0
 * @see {@link SelectTrigger}
 */
export type SelectTriggerProps<T extends PolymorphicTarget = "button"> =
  SelectTriggerPrimitiveProps<T> & SelectTriggerExtraProps;

/**
 * The button that opens the list. It shows the selected text and a chevron. `size` sets its height
 * (`"default"` is 36px, `"sm"` is 32px), and `aria-invalid="true"` turns its border destructive.
 *
 * Keyboard and ARIA: a `button` with `role="combobox"`, `aria-haspopup="listbox"` and
 * `aria-expanded`, and `aria-controls` while the list is open. Enter, Space, ArrowDown and ArrowUp
 * open the list. While the list is closed, typing a letter changes the value to the next matching
 * item without opening it. A mouse press opens the list, so you can press, drag onto an item and
 * release; touch opens it on click. Name the trigger with a `Label` (`id` on the trigger, `htmlFor`
 * on the label) or with `aria-label`.
 *
 * shadcn/ui differences: `class` replaces `className`. The `size` values are the same.
 *
 * @param props - The props: `size`, `class`, and the attributes of the trigger button.
 * @returns The trigger button.
 * @example
 * ```tsx
 * import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
 *
 * export function SmallFruit() {
 *   return (
 *     <Select>
 *       <SelectTrigger size="sm" id="fruit" aria-label="Fruit">
 *         <SelectValue placeholder="Fruit" />
 *       </SelectTrigger>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectContent}
 */
function SelectTrigger<T extends PolymorphicTarget = "button">(
  props: SelectTriggerProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & SelectTriggerExtraProps, [
    "class",
    "size",
    "children",
  ]);
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={local.size ?? "default"}
      class={cn(
        "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 motion-reduce:transition-none data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    >
      {local.children}
      <SelectPrimitive.Icon class="flex">
        <ChevronDownIcon class="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/**
 * Own props of {@link SelectContent}.
 * @since 1.0.0
 * @see {@link SelectContent}
 */
export interface SelectContentExtraProps {
  /**
   * Where the list sits. `"popper"` is below the trigger, flipping to stay in view. `"item-aligned"`
   * puts the selected item (the first enabled one when nothing is selected) over the trigger's text, as
   * Radix's item-aligned position and a native select do; `side`, `align` and `sideOffset` are then ignored.
   * @default "popper"
   */
  readonly position?: "popper" | "item-aligned" | undefined;
}

/**
 * Props of {@link SelectContent}: the primitive's placement props (`side`, `align`, `sideOffset`,
 * `collisionPadding`...), `position` and the attributes of the rendered `div`.
 * @since 1.0.0
 * @see {@link SelectContent}
 */
export type SelectContentProps<T extends PolymorphicTarget = "div"> =
  SelectContentPrimitiveProps<T> & SelectContentExtraProps;

/**
 * The popup list of items. It is rendered into `document.body`, placed below the trigger by default
 * (flipping to stay in view), at least as wide as the trigger, and it scrolls when the items do not
 * fit, with scroll buttons at both ends. While open it is modal, like a native select.
 *
 * Keyboard and ARIA: the list is a `role="listbox"` with `aria-orientation="vertical"`, and it takes
 * focus on open (the selected item, else the first enabled one). ArrowDown, ArrowUp, Home, End,
 * PageDown and PageUp move focus, without wrapping. Enter and Space select the focused item, and
 * typing jumps to the next item that starts with the typed text. Escape closes the list, and Tab
 * closes it without selecting. Focus returns to the trigger on close.
 *
 * shadcn/ui differences: `class` replaces `className`. `position` is `"popper"` (the default here;
 * Radix's default is item-aligned) or `"item-aligned"`.
 *
 * @param props - The props: `side`, `align`, `sideOffset`, `position`, `class`, and the attributes of
 * the list element.
 * @returns The list in a portal.
 * @example
 * ```tsx
 * import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 *
 * export function TopList() {
 *   return (
 *     <Select>
 *       <SelectTrigger aria-label="Fruit">
 *         <SelectValue placeholder="Pick" />
 *       </SelectTrigger>
 *       <SelectContent side="top">
 *         <SelectItem value="apple">Apple</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectItem}
 */
function SelectContent<T extends PolymorphicTarget = "div">(
  props: SelectContentProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & SelectContentExtraProps, [
    "class",
    "children",
    "position",
  ]);
  // The aligned content is its own export, so a select that never aligns does not carry its code.
  const Part = (
    local.position === "item-aligned" ? SelectItemAlignedContent : SelectPrimitive.Content
  ) as typeof SelectPrimitive.Content;
  return (
    <SelectPrimitive.Portal>
      <Part
        data-slot="select-content"
        style={{ "min-width": "max(8rem, var(--primitives-anchor-width))" }}
        class={cn(
          "relative z-50 max-h-(--primitives-available-height) min-w-[8rem] origin-(--primitives-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          (local.position ?? "popper") === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          local.class,
        )}
        {...rest}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport class="w-full min-w-(--primitives-anchor-width) scroll-my-1 p-1">
          {local.children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </Part>
    </SelectPrimitive.Portal>
  );
}

/**
 * The visible heading of a {@link SelectGroup}. It is not an option: it cannot be focused or
 * selected.
 *
 * Keyboard and ARIA: no keys. The label names its group.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the label element, and `class`.
 * @returns The label element.
 * @example
 * ```tsx
 * import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";
 *
 * export function Labeled() {
 *   return (
 *     <Select>
 *       <SelectContent>
 *         <SelectGroup>
 *           <SelectLabel>Fruits</SelectLabel>
 *           <SelectItem value="apple">Apple</SelectItem>
 *         </SelectGroup>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectGroup}
 */
function SelectLabel<T extends PolymorphicTarget = "div">(props: SelectLabelProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      class={cn("px-2 py-1.5 text-xs text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * Props of {@link SelectItem}: the primitive's props (`value`, `disabled`, `textValue`) and the
 * attributes of the rendered `div`.
 * @since 1.0.0
 * @see {@link SelectItem}
 */
export type SelectItemProps<T extends PolymorphicTarget = "div"> = SelectItemPrimitiveProps<T>;

/**
 * One option of a {@link SelectContent}. Its text names the option, is what the trigger shows once
 * it is chosen, and is what typing matches. A check mark marks the selected option.
 *
 * Keyboard and ARIA: `role="option"` with `aria-selected`, named by its text, and `aria-disabled`
 * while disabled. Enter and Space select it. A mouse selects on release, and touch selects on tap.
 * Moving the pointer over an item focuses it. A `disabled` item cannot be picked and is skipped by
 * the arrow keys.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `value` (required), `disabled`, `textValue`, and the attributes of the
 * option element.
 * @returns The option element.
 * @example
 * ```tsx
 * import { Select, SelectContent, SelectItem } from "@/components/ui/select";
 *
 * export function Apple() {
 *   return (
 *     <Select>
 *       <SelectContent>
 *         <SelectItem value="apple">Apple</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectContent}
 */
function SelectItem<T extends PolymorphicTarget = "div">(props: SelectItemProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & { readonly value: string }, [
    "class",
    "children",
    "value",
  ]);
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={local.value}
      class={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 forced-colors:focus:bg-[Highlight] forced-colors:focus:text-[HighlightText] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        local.class,
      )}
      {...rest}
    >
      <span class="absolute end-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon class="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{local.children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/**
 * A divider between items or groups.
 *
 * Keyboard and ARIA: no keys. The divider is hidden from assistive technology (`aria-hidden`).
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the divider element, and `class`.
 * @returns The divider element.
 * @example
 * ```tsx
 * import { Select, SelectContent, SelectItem, SelectSeparator } from "@/components/ui/select";
 *
 * export function Dividers() {
 *   return (
 *     <Select>
 *       <SelectContent>
 *         <SelectItem value="apple">Apple</SelectItem>
 *         <SelectSeparator />
 *         <SelectItem value="banana">Banana</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SelectSeparator<T extends PolymorphicTarget = "div">(
  props: SelectSeparatorProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      class={cn("pointer-events-none -mx-1 my-1 h-px bg-border", local.class)}
      {...rest}
    />
  );
}

/**
 * The button at the top of the list, shown while the list can scroll up. Hovering or pressing it
 * scrolls the list.
 *
 * Keyboard and ARIA: no keys. The button is hidden from assistive technology (`aria-hidden`);
 * keyboard users scroll with the arrow keys.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the button element, and `class`.
 * @returns The button, or nothing when the list cannot scroll up.
 * @example
 * ```tsx
 * import { Select, SelectContent, SelectItem, SelectScrollUpButton } from "@/components/ui/select";
 *
 * export function LongList() {
 *   return (
 *     <Select>
 *       <SelectContent>
 *         <SelectScrollUpButton />
 *         <SelectItem value="apple">Apple</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectScrollDownButton}
 */
function SelectScrollUpButton<T extends PolymorphicTarget = "div">(
  props: SelectScrollButtonProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      class={cn("flex cursor-default items-center justify-center py-1", local.class)}
      {...rest}
    >
      <ChevronUpIcon class="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

/**
 * The button at the bottom of the list, shown while the list can scroll down. Hovering or pressing
 * it scrolls the list.
 *
 * Keyboard and ARIA: no keys. The button is hidden from assistive technology (`aria-hidden`);
 * keyboard users scroll with the arrow keys.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the button element, and `class`.
 * @returns The button, or nothing when the list cannot scroll down.
 * @example
 * ```tsx
 * import { Select, SelectContent, SelectItem, SelectScrollDownButton } from "@/components/ui/select";
 *
 * export function LongListBottom() {
 *   return (
 *     <Select>
 *       <SelectContent>
 *         <SelectItem value="apple">Apple</SelectItem>
 *         <SelectScrollDownButton />
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SelectScrollUpButton}
 */
function SelectScrollDownButton<T extends PolymorphicTarget = "div">(
  props: SelectScrollButtonProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      class={cn("flex cursor-default items-center justify-center py-1", local.class)}
      {...rest}
    >
      <ChevronDownIcon class="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
