import { createContext, splitProps, useContext } from "@shadow-js/core";
import {
  type ComboboxChipProps as ComboboxChipPrimitiveProps,
  type ComboboxChipRemoveProps,
  type ComboboxClearProps,
  type ComboboxContentProps as ComboboxContentPrimitiveProps,
  type ComboboxEmptyProps,
  type ComboboxGroupProps,
  type ComboboxInputProps as ComboboxInputPrimitiveProps,
  type ComboboxItemProps as ComboboxItemPrimitiveProps,
  type ComboboxLabelProps,
  type ComboboxLoadingProps,
  Combobox as ComboboxPrimitive,
  type ComboboxProps,
  type ComboboxSeparatorProps,
  type ComboboxTriggerProps,
  type ComboboxChipsProps as ComboboxValueProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import { type ComponentProps, For, type JSX } from "@shadow-js/web";
import { CheckIcon, ChevronDownIcon, XIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { type ClassValue, cn } from "@/lib/utils";

/** The items a combobox lists, read by {@link ComboboxList}. */
const itemsContext = createContext<() => readonly unknown[] | undefined>(() => undefined, {
  name: "ComboboxItems",
});
/** The items of the group around a {@link ComboboxCollection}. */
const groupItemsContext = createContext<() => readonly unknown[] | undefined>(() => undefined, {
  name: "ComboboxGroupItems",
});

/**
 * The `items` prop {@link Combobox} adds to the primitive's props: the data that a
 * {@link ComboboxList} with a render function turns into {@link ComboboxItem} parts.
 * @since 1.0.0
 */
export interface ComboboxItemsProps<T = unknown> {
  /**
   * The data behind the options. A `ComboboxList` whose children are a function renders it once
   * per item. The options still filter themselves from the typed text.
   * @default none
   */
  readonly items?: readonly T[] | undefined;
}

/** The props as the implementation sees them. */
type Loose = {
  readonly class?: ClassValue;
  readonly children?: JSX.Element;
  readonly [prop: string]: unknown;
};

/** The look shared by the single-line field and the chips field. */
const FIELD =
  "relative flex w-full min-w-0 rounded-md border border-input outline-none bg-transparent shadow-xs transition-[color,box-shadow] motion-reduce:transition-none dark:bg-input/30 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-transparent has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20 dark:has-[input[aria-invalid=true]]:ring-destructive/40";

/** The look of the small icon buttons at the end of a field. */
const ICON_BUTTON =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground opacity-50 outline-none hover:opacity-100 disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4";

/**
 * A text field with a filtered list of options. The user types to narrow the options and picks one;
 * with `multiple`, the picks show as removable chips. Use it for a searchable choice, such as a
 * framework or tag picker.
 *
 * It is controlled with `value` / `onValueChange`, `inputValue` / `onInputValueChange` and `open` /
 * `onOpenChange`, or uncontrolled with the `default*` props. With a `name` it takes part in native
 * forms. Set `shouldFilter={false}` to filter on the server and render exactly the items you want
 * shown. While the list is closed its items are read once without being shown, so a `defaultValue`
 * already shows its label; pass `itemToString` for server rendering and for items that arrive later.
 *
 * Keyboard and ARIA: the input keeps focus and is the only tab stop. Typing opens and filters the
 * list. ArrowDown opens it and highlights the first option, or moves to the next one; ArrowUp does
 * the same from the end. Alt+ArrowDown opens without moving the highlight and Alt+ArrowUp closes.
 * Home and End jump to the first and last option while one is highlighted. Enter picks the
 * highlighted option and never submits a surrounding form while the list is open. Escape closes the
 * list, and a second Escape clears the field. Tab closes the list. With `multiple`, Backspace in an
 * empty input removes the last chip, and ArrowLeft with the caret at the start moves focus to the
 * chips. The input is `role="combobox"` with `aria-autocomplete="list"`, `aria-haspopup="listbox"`,
 * `aria-expanded`, `aria-controls` (while the list is open) and `aria-activedescendant` (the
 * highlighted option). The list is a `role="listbox"` of `role="option"` items with `aria-selected`.
 * Name the input with a `ComboboxLabel` placed outside a group, or with `aria-label`.
 *
 * shadcn/ui differences: this is one set of parts (`ComboboxInput`, `ComboboxContent`,
 * `ComboboxItem`, ...) rather than a `Popover` wrapped around a `Command`. `as` replaces `asChild` on the parts that accept it, and every part has a `data-slot`. The prop is `class`, not `className`.
 *
 * @example
 * import {
 *   Combobox,
 *   ComboboxContent,
 *   ComboboxEmpty,
 *   ComboboxInput,
 *   ComboboxItem,
 * } from "@/components/ui/combobox";
 *
 * export function FrameworkPicker() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput placeholder="Select a framework" />
 *       <ComboboxContent>
 *         <ComboboxEmpty>No framework found.</ComboboxEmpty>
 *         <ComboboxItem value="next">Next.js</ComboboxItem>
 *         <ComboboxItem value="astro">Astro</ComboboxItem>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxInput}
 * @see {@link ComboboxContent}
 * @since 1.0.0
 */
function Combobox<T = unknown>(props: ComboboxProps & ComboboxItemsProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as ComboboxProps & ComboboxItemsProps<T>, ["items"]);
  return (
    <itemsContext.Provider value={() => local.items}>
      <ComboboxPrimitive {...(rest as ComboboxProps)} />
    </itemsContext.Provider>
  );
}

/**
 * Own props of {@link ComboboxInput}: the parts the field adds around the `input`.
 * @see {@link ComboboxInput}
 * @since 1.0.0
 */
export interface ComboboxInputExtraProps {
  /** Shows the chevron button that toggles the list. @default true */
  readonly showTrigger?: boolean | undefined;
  /** Shows the button that clears the text and the selection. @default false */
  readonly showClear?: boolean | undefined;
  /** Rendered after the buttons, inside the field: an icon, or a button of your own. @default none */
  readonly children?: JSX.Element | undefined;
}

/**
 * Props of {@link ComboboxInput}: the attributes of the `input` and {@link ComboboxInputExtraProps}.
 * `class` goes to the field around the input, every other attribute to the `input`.
 * @see {@link ComboboxInput}
 * @since 1.0.0
 */
export type ComboboxInputProps = ComboboxInputPrimitiveProps & ComboboxInputExtraProps;

/**
 * The text field of a combobox: the input that keeps focus, the chevron that toggles the list and,
 * with `showClear`, a clear button. The list is placed
 * against the whole field. Name the input with a `ComboboxLabel` or an `aria-label`. Set
 * `aria-invalid="true"` on the input to draw the field with the destructive border.
 *
 * @param props The input props: see {@link ComboboxInputProps}.
 * @returns The field, with the input inside it.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from "@/components/ui/combobox";
 *
 * export function Search() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput placeholder="Search..." showClear aria-label="Search" />
 *       <ComboboxContent>
 *         <ComboboxItem value="next">Next.js</ComboboxItem>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link Combobox}
 * @see {@link ComboboxInputProps}
 * @since 1.0.0
 */
function ComboboxInput(props: ComboboxInputProps): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & ComboboxInputExtraProps, [
    "class",
    "children",
    "showTrigger",
    "showClear",
  ]);
  return (
    <ComboboxPrimitive.Anchor
      data-slot="combobox-input-group"
      class={cn(FIELD, "h-9 items-center", local.class)}
    >
      <ComboboxPrimitive.Input
        data-slot="combobox-input"
        class="h-full min-w-0 flex-1 bg-transparent px-3 py-1 text-base outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
        {...rest}
      />
      {local.showClear === true && <ComboboxClear />}
      {local.showTrigger !== false && <ComboboxTrigger />}
      {local.children}
    </ComboboxPrimitive.Anchor>
  );
}

/**
 * The chevron button that toggles the list. It is not a tab stop (the input is) and pressing it keeps
 * focus in the input. Its default `aria-label` is `"Toggle suggestions"`; pass your own to translate
 * it. `children` replaces the chevron icon.
 *
 * @param props The button props: the attributes of the rendered element, and `children`.
 * @returns The rendered trigger button.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
 *
 * export function FruitPicker() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput showTrigger={false} aria-label="Fruit" />
 *       <ComboboxTrigger aria-label="Show fruits" />
 *       <ComboboxContent>
 *         <ComboboxItem value="apple">Apple</ComboboxItem>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxInput}
 * @since 1.0.0
 */
function ComboboxTrigger<T extends PolymorphicTarget = "button">(
  props: ComboboxTriggerProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "children"]);
  const t = useUiStrings();
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      aria-label={t("combobox.toggle", "Toggle suggestions")}
      class={cn(ICON_BUTTON, "me-0.5", local.class)}
      {...rest}
    >
      {local.children ?? <ChevronDownIcon />}
    </ComboboxPrimitive.Trigger>
  );
}

/**
 * The button that empties the text and the selection and keeps focus in the input. It is hidden
 * while there is nothing to clear. Its default `aria-label` is `"Clear"`; pass your own to translate
 * it. `children` replaces the X icon.
 *
 * @param props The button props: the attributes of the rendered element, and `children`.
 * @returns The rendered clear button, or nothing while it is hidden.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxClear, ComboboxInput } from "@/components/ui/combobox";
 *
 * export function Cleared() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput showTrigger={false} aria-label="Fruit" />
 *       <ComboboxClear aria-label="Clear selection" />
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxInput}
 * @since 1.0.0
 */
function ComboboxClear<T extends PolymorphicTarget = "button">(
  props: ComboboxClearProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "children"]);
  const t = useUiStrings();
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      aria-label={t("combobox.clear", "Clear")}
      class={cn(ICON_BUTTON, local.class)}
      {...rest}
    >
      {local.children ?? <XIcon />}
    </ComboboxPrimitive.Clear>
  );
}

/**
 * Props of {@link ComboboxContent}: the placement options of the popup (such as `side`, `align` and
 * `sideOffset`) and the attributes of the rendered `div`.
 * @see {@link ComboboxContent}
 * @since 1.0.0
 */
export type ComboboxContentProps<T extends PolymorphicTarget = "div"> =
  ComboboxContentPrimitiveProps<T>;

/**
 * The popup list of options. It is portaled to `document.body`, placed against the field and as wide
 * as the field, with a 4 px gap unless you pass `sideOffset`. It never takes focus: the input keeps
 * it and points at the highlighted option with `aria-activedescendant`. Pressing or focusing outside
 * the list, or pressing Escape, closes it.
 *
 * Keyboard and ARIA: the list is a `role="listbox"`, named by the `ComboboxLabel` or else by the
 * input. It is `aria-busy` while {@link ComboboxLoading} is shown and carries `data-empty` when no
 * option matches. Put {@link ComboboxItem}, {@link ComboboxGroup} and {@link ComboboxEmpty} inside it.
 *
 * @param props The list props: see {@link ComboboxContentProps}.
 * @returns The popup list, rendered in a portal while it is open.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from "@/components/ui/combobox";
 *
 * export function FruitList() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput aria-label="Fruit" />
 *       <ComboboxContent>
 *         <ComboboxItem value="apple">Apple</ComboboxItem>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxItem}
 * @since 1.0.0
 */
function ComboboxContent<T extends PolymorphicTarget = "div">(
  props: ComboboxContentProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "children"]);
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Content
        data-slot="combobox-content"
        sideOffset={4}
        class={cn(
          "relative z-50 max-h-[min(24rem,var(--primitives-available-height))] w-(--primitives-anchor-width) origin-(--primitives-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </ComboboxPrimitive.Content>
    </ComboboxPrimitive.Portal>
  );
}

/**
 * Props of {@link ComboboxItem}: `value` (required, unique in the list), `label`, `disabled` and the
 * attributes of the rendered `div`.
 * @see {@link ComboboxItem}
 * @since 1.0.0
 */
export type ComboboxItemProps<T extends PolymorphicTarget = "div"> = ComboboxItemPrimitiveProps<T>;

/**
 * One option of the list. Its text is what the filter matches and what the field shows once the
 * option is picked; give `label` when the children are not plain text. A check marks the picked
 * options. A disabled option cannot be highlighted or picked. Filtered-out options are not rendered.
 *
 * Keyboard and ARIA: the option is a `role="option"` with `aria-selected`, and `aria-disabled` when
 * disabled. The input keeps focus and highlights it with the arrow keys; Enter picks the highlighted
 * option. Picking a single-select option closes the list and shows its label in the field; picking
 * an option of a `multiple` combobox toggles it and keeps the list open.
 *
 * @param props The option props: see {@link ComboboxItemProps}.
 * @returns The option, or nothing while the filter rejects it.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from "@/components/ui/combobox";
 *
 * export function Frameworks() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput aria-label="Framework" />
 *       <ComboboxContent>
 *         <ComboboxItem value="next">Next.js</ComboboxItem>
 *         <ComboboxItem value="astro" label="Astro">
 *           Astro
 *         </ComboboxItem>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxContent}
 * @since 1.0.0
 */
function ComboboxItem<T extends PolymorphicTarget = "div">(
  props: ComboboxItemProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & { readonly value: string }, [
    "class",
    "children",
    "value",
  ]);
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      value={local.value}
      class={cn(
        "group/combobox-item relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground forced-colors:data-[highlighted]:bg-[Highlight] forced-colors:data-[highlighted]:text-[HighlightText] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        local.class,
      )}
      {...rest}
    >
      {local.children}
      <span class="pointer-events-none absolute end-2 flex size-3.5 items-center justify-center">
        <CheckIcon class="hidden size-4 group-data-[state=checked]/combobox-item:block" />
      </span>
    </ComboboxPrimitive.Item>
  );
}

/**
 * The message shown inside the list while it is open and no option matches. It is hidden while
 * {@link ComboboxLoading} is shown. The list itself announces the result count to screen readers.
 *
 * @param props The message props: the attributes of the rendered `div`.
 * @returns The message, or nothing while the list has matches.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput } from "@/components/ui/combobox";
 *
 * export function Empty() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput aria-label="Framework" />
 *       <ComboboxContent>
 *         <ComboboxEmpty>No framework found.</ComboboxEmpty>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxContent}
 * @since 1.0.0
 */
function ComboboxEmpty<T extends PolymorphicTarget = "div">(
  props: ComboboxEmptyProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      class={cn("py-6 text-center text-sm", local.class)}
      {...rest}
    />
  );
}

/**
 * The status row shown while your results are loading. The combobox does not know about loading, so
 * render it from your own state (for example with `Show`). While it is mounted the list is
 * `aria-busy`.
 *
 * @param props The row props: the attributes of the rendered `div`.
 * @returns The status row.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { Show } from "@shadow-js/web";
 * import { Combobox, ComboboxContent, ComboboxInput, ComboboxLoading } from "@/components/ui/combobox";
 *
 * export function Results() {
 *   const [loading] = useSignal(true);
 *   return (
 *     <Combobox>
 *       <ComboboxInput aria-label="Search" />
 *       <ComboboxContent>
 *         <Show when={loading()}>
 *           <ComboboxLoading>Searching...</ComboboxLoading>
 *         </Show>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxContent}
 * @since 1.0.0
 */
function ComboboxLoading<T extends PolymorphicTarget = "div">(
  props: ComboboxLoadingProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ComboboxPrimitive.Loading
      data-slot="combobox-loading"
      class={cn("py-6 text-center text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * A group of options under a {@link ComboboxLabel} heading, which names the group. The group is
 * hidden while the filter rejects all of its options.
 *
 * @param props The group props: the attributes of the rendered `div`.
 * @returns The group of options.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel } from "@/components/ui/combobox";
 *
 * export function Tools() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput aria-label="Tool" />
 *       <ComboboxContent>
 *         <ComboboxGroup>
 *           <ComboboxLabel>Frameworks</ComboboxLabel>
 *           <ComboboxItem value="next">Next.js</ComboboxItem>
 *         </ComboboxGroup>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxLabel}
 * @since 1.0.0
 */
function ComboboxGroup<T extends PolymorphicTarget = "div">(
  props: ComboboxGroupProps<T> & ComboboxItemsProps,
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as ComboboxItemsProps & Record<string, unknown>,
    ["items"],
  );
  return (
    <groupItemsContext.Provider value={() => local.items}>
      <ComboboxPrimitive.Group
        data-slot="combobox-group"
        {...(rest as unknown as ComboboxGroupProps<T>)}
      />
    </groupItemsContext.Provider>
  );
}

/**
 * A heading. Inside a {@link ComboboxGroup} it names the group; outside one it is the label of the
 * input and names the list.
 *
 * @param props The label props: the attributes of the rendered element.
 * @returns The heading element.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxInput, ComboboxLabel } from "@/components/ui/combobox";
 *
 * export function FrameworkField() {
 *   return (
 *     <Combobox>
 *       <ComboboxLabel>Framework</ComboboxLabel>
 *       <ComboboxInput />
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxGroup}
 * @since 1.0.0
 */
function ComboboxLabel<T extends PolymorphicTarget = "label">(
  props: ComboboxLabelProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ComboboxPrimitive.Label
      data-slot="combobox-label"
      class={cn("px-2 py-1.5 text-xs text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * A divider between groups of options. It is decorative (`role="presentation"`), and it is hidden
 * while the filter narrows the list, because the groups it divides may then be incomplete.
 *
 * @param props The divider props: the attributes of the rendered `div`.
 * @returns The divider.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxSeparator } from "@/components/ui/combobox";
 *
 * export function Sections() {
 *   return (
 *     <Combobox>
 *       <ComboboxInput aria-label="Tool" />
 *       <ComboboxContent>
 *         <ComboboxGroup>
 *           <ComboboxItem value="next">Next.js</ComboboxItem>
 *         </ComboboxGroup>
 *         <ComboboxSeparator />
 *         <ComboboxGroup>
 *           <ComboboxItem value="vite">Vite</ComboboxItem>
 *         </ComboboxGroup>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxGroup}
 * @since 1.0.0
 */
function ComboboxSeparator<T extends PolymorphicTarget = "div">(
  props: ComboboxSeparatorProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      class={cn("pointer-events-none -mx-1 my-1 h-px bg-border", local.class)}
      {...rest}
    />
  );
}

/**
 * The field of a `multiple` combobox: the chips and the input wrap inside one bordered box that the
 * list is placed against. Put {@link ComboboxValue} (the chips) and {@link ComboboxChipsInput} inside
 * it.
 *
 * @param props The attributes of the rendered `div`. `class` is merged with the field classes.
 * @returns The field.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxItem, ComboboxValue } from "@/components/ui/combobox";
 *
 * export function Tags() {
 *   return (
 *     <Combobox multiple defaultValue={["next"]}>
 *       <ComboboxChips>
 *         <ComboboxValue>
 *           {(chip) => <ComboboxChip value={chip.value}>{chip.label()}</ComboboxChip>}
 *         </ComboboxValue>
 *         <ComboboxChipsInput aria-label="Frameworks" placeholder="Add a framework" />
 *       </ComboboxChips>
 *       <ComboboxContent>
 *         <ComboboxItem value="next">Next.js</ComboboxItem>
 *         <ComboboxItem value="astro">Astro</ComboboxItem>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxValue}
 * @since 1.0.0
 */
function ComboboxChips(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ComboboxPrimitive.Anchor
      data-slot="combobox-chips"
      class={cn(FIELD, "min-h-9 flex-wrap items-center gap-1.5 px-2.5 py-1.5 text-sm", local.class)}
      {...rest}
    />
  );
}

/**
 * Renders one {@link ComboboxChip} per selected value, in selection order. Its child is a function
 * that receives the chip's `value` and `label()` and returns the chip. The wrapper has
 * `display: contents`, so the chips flow inside {@link ComboboxChips}.
 *
 * @param props The attributes of the wrapper, and `children`: a function from the chip data to a
 * {@link ComboboxChip}.
 * @returns The wrapper with one chip per selected value.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxChip, ComboboxChips, ComboboxValue } from "@/components/ui/combobox";
 *
 * export function Selected() {
 *   return (
 *     <Combobox multiple defaultValue={["next"]}>
 *       <ComboboxChips>
 *         <ComboboxValue>
 *           {(chip) => <ComboboxChip value={chip.value}>{chip.label()}</ComboboxChip>}
 *         </ComboboxValue>
 *       </ComboboxChips>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxChips}
 * @since 1.0.0
 */
function ComboboxValue<T extends PolymorphicTarget = "div">(
  props: ComboboxValueProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-value"
      class={cn("contents", local.class)}
      {...(rest as unknown as ComboboxValueProps)}
    />
  );
}

/**
 * Own props of {@link ComboboxChip}: the extra parts the chip adds.
 * @see {@link ComboboxChip}
 * @since 1.0.0
 */
export interface ComboboxChipExtraProps {
  /** Shows the button that removes the chip. @default true */
  readonly showRemove?: boolean | undefined;
}

/**
 * Props of {@link ComboboxChip}: `value` (the selected value it stands for), `showRemove` and the
 * attributes of the rendered `div`.
 * @see {@link ComboboxChip}
 * @since 1.0.0
 */
export type ComboboxChipProps<T extends PolymorphicTarget = "div"> = ComboboxChipPrimitiveProps<T> &
  ComboboxChipExtraProps;

/**
 * A selected value of a `multiple` combobox, shown with a remove button. From the input, ArrowLeft
 * with the caret at the start moves focus to the last chip. Inside the chips, ArrowLeft and
 * ArrowRight move between chips, and Backspace or Delete removes the focused chip.
 *
 * @param props The chip props: see {@link ComboboxChipProps}.
 * @returns The chip.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxChip, ComboboxChips, ComboboxValue } from "@/components/ui/combobox";
 *
 * export function Tag() {
 *   return (
 *     <Combobox multiple defaultValue={["next"]}>
 *       <ComboboxChips>
 *         <ComboboxValue>
 *           {(chip) => (
 *             <ComboboxChip value={chip.value} showRemove={false}>
 *               {chip.label()}
 *             </ComboboxChip>
 *           )}
 *         </ComboboxValue>
 *       </ComboboxChips>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxValue}
 * @since 1.0.0
 */
function ComboboxChip<T extends PolymorphicTarget = "div">(
  props: ComboboxChipProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as Loose & ComboboxChipExtraProps & { readonly value: string },
    ["class", "children", "showRemove", "value"],
  );
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      value={local.value}
      class={cn(
        "flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 forced-colors:border forced-colors:border-[ButtonText] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    >
      {local.children}
      {local.showRemove !== false && <ComboboxChipRemove />}
    </ComboboxPrimitive.Chip>
  );
}

/**
 * The button that removes its chip. It keeps focus in the input and is not a tab stop; the chip
 * itself is removable with the keyboard. Its default `aria-label` is `Remove` followed by the chip's
 * label; pass your own to translate it. `children` replaces the X icon.
 *
 * @param props The button props: the attributes of the rendered element, and `children`.
 * @returns The remove button.
 * @throws Error when rendered outside a {@link ComboboxChip}.
 * @example
 * import { Combobox, ComboboxChip, ComboboxChipRemove, ComboboxChips, ComboboxValue } from "@/components/ui/combobox";
 *
 * export function RemovableTag() {
 *   return (
 *     <Combobox multiple defaultValue={["next"]}>
 *       <ComboboxChips>
 *         <ComboboxValue>
 *           {(chip) => (
 *             <ComboboxChip value={chip.value} showRemove={false}>
 *               {chip.label()}
 *               <ComboboxChipRemove aria-label={`Remove ${chip.label()}`} />
 *             </ComboboxChip>
 *           )}
 *         </ComboboxValue>
 *       </ComboboxChips>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxChip}
 * @since 1.0.0
 */
function ComboboxChipRemove<T extends PolymorphicTarget = "button">(
  props: ComboboxChipRemoveProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "children"]);
  return (
    <ComboboxPrimitive.ChipRemove
      data-slot="combobox-chip-remove"
      class={cn(
        "-ms-1 inline-flex size-4 items-center justify-center rounded-sm opacity-50 hover:opacity-100 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
        local.class,
      )}
      {...rest}
    >
      {local.children ?? <XIcon />}
    </ComboboxPrimitive.ChipRemove>
  );
}

/**
 * The text input inside {@link ComboboxChips}. It has no box of its own and fills the room the chips
 * leave. Name it with an `aria-label` or a {@link ComboboxLabel}. Its keys are the ones listed on
 * {@link Combobox}, including Backspace in an empty input, which removes the last chip.
 *
 * @param props The input props: the attributes of the rendered `input`. `class` is merged with the
 * input's classes.
 * @returns The input.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxItem } from "@/components/ui/combobox";
 *
 * export function Adder() {
 *   return (
 *     <Combobox multiple>
 *       <ComboboxChips>
 *         <ComboboxChipsInput aria-label="Frameworks" placeholder="Add a framework" />
 *       </ComboboxChips>
 *       <ComboboxContent>
 *         <ComboboxItem value="next">Next.js</ComboboxItem>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxChips}
 * @since 1.0.0
 */
function ComboboxChipsInput(props: ComboboxInputPrimitiveProps): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chips-input"
      class={cn(
        "min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * True for a render function `(item, index) => node`. A child that is a node, or the zero-argument
 * accessor the runtime makes of a lazy child, is not one.
 */
function isRenderFunction(
  children: unknown,
): children is (item: unknown, index: number) => JSX.Element {
  return typeof children === "function" && children.length > 0;
}

/**
 * Props of {@link ComboboxList}: the attributes of the `div`, with children that are either nodes or
 * a render function `(item, index) => node` over the `items` of the {@link Combobox}.
 * @since 1.0.0
 */
export type ComboboxListProps<T = unknown> = Omit<ComponentProps<"div">, "children"> & {
  readonly children?: JSX.Element | ((item: T, index: number) => JSX.Element) | undefined;
};

/**
 * The scrolling list inside a {@link ComboboxContent}, as in shadcn/ui. With nodes as children it is
 * a layout wrapper. With a function as children it renders that function once per item of the
 * `items` prop of the {@link Combobox} (the index is the position when the row is created). The
 * options still filter themselves from the typed text, so the function returns a
 * {@link ComboboxItem} (or a group) for every item. The listbox role stays on the content.
 *
 * @param props The `div` attributes and the children, nodes or a render function.
 * @returns The list `div`.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
 *
 * const frameworks = ["Next.js", "Astro", "Remix"];
 *
 * export function FrameworkPicker() {
 *   return (
 *     <Combobox items={frameworks}>
 *       <ComboboxInput aria-label="Framework" />
 *       <ComboboxContent>
 *         <ComboboxList>
 *           {(name: string) => <ComboboxItem value={name}>{name}</ComboboxItem>}
 *         </ComboboxList>
 *       </ComboboxContent>
 *     </Combobox>
 *   );
 * }
 * @see {@link ComboboxCollection}
 * @since 1.0.0
 */
function ComboboxList<T = unknown>(props: ComboboxListProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as ComboboxListProps<T> & { readonly class?: unknown }, [
    "class",
    "children",
  ]);
  const items = useContext(itemsContext);
  return (
    <div
      data-slot="combobox-list"
      class={cn("max-h-[inherit] overflow-y-auto overscroll-contain", local.class as ClassValue)}
      {...rest}
    >
      {isRenderFunction(local.children) ? (
        <For each={items() ?? []}>
          {(item, index) =>
            (local.children as (item: T, index: number) => JSX.Element)(item as T, index())
          }
        </For>
      ) : (
        (local.children as JSX.Element)
      )}
    </div>
  );
}

/**
 * Props of {@link ComboboxCollection}.
 * @since 1.0.0
 */
export interface ComboboxCollectionProps<T = unknown> {
  /**
   * The items to render. Without it the items of the surrounding {@link ComboboxGroup} are used,
   * and without a group those of the {@link Combobox}.
   * @default the group's items, else the root's
   */
  readonly items?: readonly T[] | undefined;
  /** Renders one item. */
  readonly children: (item: T, index: number) => JSX.Element;
}

/**
 * Renders a render function once per item, inside a {@link ComboboxGroup} that was given `items`
 * (or with its own `items`). It adds no element of its own, so the group keeps hiding itself while
 * the filter rejects all of its options.
 *
 * @param props The items (optional) and the render function.
 * @returns One node per item.
 * @throws Error when rendered outside a {@link Combobox}.
 * @example
 * import { ComboboxCollection, ComboboxGroup, ComboboxItem, ComboboxLabel } from "@/components/ui/combobox";
 *
 * export function Fruits() {
 *   return (
 *     <ComboboxGroup items={["Apple", "Banana"]}>
 *       <ComboboxLabel>Fruits</ComboboxLabel>
 *       <ComboboxCollection>
 *         {(name: string) => <ComboboxItem value={name}>{name}</ComboboxItem>}
 *       </ComboboxCollection>
 *     </ComboboxGroup>
 *   );
 * }
 * @see {@link ComboboxList}
 * @since 1.0.0
 */
function ComboboxCollection<T = unknown>(props: ComboboxCollectionProps<T>): JSX.Element {
  const group = useContext(groupItemsContext);
  const root = useContext(itemsContext);
  const items = (): readonly unknown[] => props.items ?? group() ?? root() ?? [];
  return <For each={items()}>{(item, index) => props.children(item as T, index())}</For>;
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxLoading,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
};
