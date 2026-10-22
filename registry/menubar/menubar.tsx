import { splitProps } from "@shadow-js/core";
import {
  type MenubarContentProps,
  type MenubarMenuProps,
  Menubar as MenubarPrimitive,
  type MenubarProps,
  type MenubarTriggerProps,
  type MenuCheckboxItemProps,
  type MenuGroupProps,
  type MenuItemOwnProps,
  type MenuLabelProps,
  type MenuPortalProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuSeparatorProps,
  type MenuSubContentProps,
  type MenuSubProps,
  type MenuSubTriggerProps,
  type PolymorphicProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "@/components/ui/icons";
import { type ClassValue, cn } from "@/lib/utils";

/** The props as the implementation sees them: the typed own props plus whatever the target takes. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly inset?: boolean | undefined;
  readonly variant?: "default" | "destructive" | undefined;
  readonly children?: JSX.Element | undefined;
  readonly [prop: string]: unknown;
};

/** The placement and entrance animation shared by the menu panels. */
const PANEL =
  "z-50 min-w-[8rem] origin-(--primitives-transform-origin) rounded-md border bg-popover p-1 text-popover-foreground outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95";

/** What every selectable row shares. */
const ROW =
  "relative flex cursor-default items-center gap-2 rounded-sm text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 forced-colors:focus:bg-[Highlight] forced-colors:focus:text-[HighlightText] forced-colors:data-[disabled]:text-[GrayText] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

/**
 * A horizontal bar of menus (`role="menubar"`). The triggers share one tab stop and move with
 * ArrowLeft and ArrowRight (swapped in right-to-left layouts). While a menu is open, hovering another
 * trigger, or pressing an arrow key, switches to that menu.
 *
 * Keyboard and ARIA: the bar is a `menubar`, and its triggers are `menuitem` buttons. Home and End go
 * to the first and last trigger, and disabled triggers are skipped. Name the bar with `aria-label`,
 * because it has no name of its own. Control the open menu with `value` and `onValueChange` (the
 * value of the open menu), or start uncontrolled with `defaultValue`.
 *
 * shadcn/ui differences: `as` replaces `asChild` on the triggers, items and sub-triggers.
 *
 * @param props The bar's `div` attributes plus `value`, `defaultValue`, `onValueChange`, `dir` and
 * `loop`. `class` adds to the bar's classes.
 * @returns The bar `div` with its menus inside.
 * @example
 * import {
 *   Menubar,
 *   MenubarContent,
 *   MenubarItem,
 *   MenubarMenu,
 *   MenubarShortcut,
 *   MenubarTrigger,
 * } from "@/components/ui/menubar";
 *
 * <Menubar aria-label="Application">
 *   <MenubarMenu value="file">
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>
 *         New Tab <MenubarShortcut>Ctrl+T</MenubarShortcut>
 *       </MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarMenu}
 */
function Menubar<T extends PolymorphicTarget = "div">(props: MenubarProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <MenubarPrimitive
      data-slot="menubar"
      class={cn(
        "flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-xs",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * One menu of the bar. It pairs a {@link MenubarTrigger} with its {@link MenubarContent}, and it is
 * open while the bar's `value` equals its `value`. It renders no element and handles no keys; the
 * trigger and the content carry the behavior.
 *
 * @param props `value` names the menu (generated when omitted), and `children` are the trigger, the
 * content and anything else in the menu.
 * @returns The menu's children, with no element of its own.
 * @throws Error when rendered outside a {@link Menubar}.
 * @example
 * import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="edit">
 *     <MenubarTrigger>Edit</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>Undo</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarTrigger}
 */
function MenubarMenu(props: MenubarMenuProps): JSX.Element {
  return <MenubarPrimitive.Menu {...props} />;
}

/**
 * Renders its children into `document.body` (or into `container`) while the menu is open. It is
 * client only: nothing renders on the server. {@link MenubarContent} already renders its panel this
 * way, so use this portal for other content that belongs in the menu's layer.
 *
 * @param props `container` (an element, `null`, or a function that returns one; the default is
 * `document.body`) and `forceMount` (keep the children mounted while the menu is closed).
 * @returns The portal, or nothing while the menu is closed.
 * @throws Error when rendered outside a {@link MenubarMenu}.
 * @example
 * import { Menubar, MenubarMenu, MenubarPortal, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="help">
 *     <MenubarTrigger>Help</MenubarTrigger>
 *     <MenubarPortal container={() => document.body}>
 *       <p>Shown in the body while the menu is open.</p>
 *     </MenubarPortal>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarContent}
 */
function MenubarPortal(props: MenuPortalProps): JSX.Element {
  return <MenubarPrimitive.Portal {...props} />;
}

/**
 * The button of the bar that opens its menu. Its `data-state` is `open` or `closed`.
 *
 * Keyboard and ARIA: a `menuitem` button with `aria-haspopup="menu"`, `aria-expanded`, and
 * `aria-controls` while its menu is open. ArrowLeft and ArrowRight move to the neighboring trigger.
 * ArrowDown, Enter and Space open the menu and focus its first item; ArrowUp opens it and focuses the
 * last item. A pointer press toggles the menu. Its name is its text.
 *
 * @param props The button's attributes, plus `as` (the element to render in its place).
 * @returns The trigger element.
 * @throws Error when rendered outside a {@link Menubar}.
 * @example
 * import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="edit">
 *     <MenubarTrigger>Edit</MenubarTrigger>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarContent}
 */
function MenubarTrigger<T extends PolymorphicTarget = "button">(
  props: MenubarTriggerProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      class={cn(
        "flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground forced-colors:focus:bg-[Highlight] forced-colors:focus:text-[HighlightText] forced-colors:data-[state=open]:bg-[Highlight] forced-colors:data-[state=open]:text-[HighlightText]",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The menu panel, rendered into `document.body` and placed under its trigger. It is open while its
 * menu is open.
 *
 * Keyboard and ARIA: `role="menu"` with `aria-orientation="vertical"`, named by its trigger
 * (`aria-labelledby`). ArrowDown and ArrowUp move between the items; ArrowLeft and ArrowRight move to
 * the neighboring menu (swapped in right-to-left layouts); Escape and Tab close it, and focus returns
 * to the trigger. Pressing another trigger of the bar does not close it.
 *
 * @param props The panel's attributes. The placement defaults are `align="start"`, `alignOffset={-4}`
 * and `sideOffset={8}`; `class` adds to the panel's classes.
 * @returns The panel element, or nothing while the menu is closed.
 * @throws Error when rendered outside a {@link Menubar}.
 * @example
 * import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="file">
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent class="w-64">
 *       <MenubarItem>New window</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarTrigger}
 */
function MenubarContent(props: MenubarContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "align", "alignOffset", "sideOffset"]);
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={local.align ?? "start"}
        alignOffset={local.alignOffset ?? -4}
        sideOffset={local.sideOffset ?? 8}
        class={cn(
          PANEL,
          "min-w-[12rem] max-h-(--primitives-available-height) overflow-x-hidden overflow-y-auto shadow-md",
          local.class,
        )}
        {...rest}
      />
    </MenubarPortal>
  );
}

/**
 * Groups related items. It has no keys and no ARIA attributes of its own; the items keep theirs.
 *
 * @param props The group's attributes.
 * @returns The group element.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { Menubar, MenubarContent, MenubarGroup, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="account">
 *     <MenubarTrigger>Account</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarGroup>
 *         <MenubarItem>Profile</MenubarItem>
 *       </MenubarGroup>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarContent}
 */
function MenubarGroup(props: MenuGroupProps): JSX.Element {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

/**
 * The extra props of {@link MenubarItem}: `inset` and `variant`.
 * @since 1.0.0
 * @see {@link MenubarItem}
 */
export interface MenubarItemExtraProps {
  /**
   * Indents the item so it lines up with items that have an indicator.
   * @default false
   */
  readonly inset?: boolean | undefined;
  /**
   * `destructive` colors the item for dangerous actions.
   * @default "default"
   */
  readonly variant?: "default" | "destructive" | undefined;
}

/**
 * Props of {@link MenubarItem}: the attributes of the chosen element (`div` by default), plus `inset`
 * and `variant`.
 * @since 1.0.0
 * @see {@link MenubarItem}
 */
export type MenubarItemProps<T extends PolymorphicTarget = "div"> = PolymorphicProps<
  "div",
  MenuItemOwnProps & MenubarItemExtraProps,
  T
>;

/**
 * An action in a menu of the bar. Selecting it (by click, Enter or Space) closes the menu, unless
 * `onSelect` calls `event.preventDefault()`.
 *
 * Keyboard and ARIA: `role="menuitem"` with `tabindex="-1"`; the arrow keys move between the items.
 * A disabled item gets `aria-disabled="true"` and is skipped. Its name is its text.
 *
 * shadcn/ui differences: `as` replaces `asChild`, as in `<MenubarItem as="a" href="/settings">`.
 *
 * @param props The item's attributes, plus `inset`, `variant` and `as`. `class` adds to the classes.
 * @returns The item element.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
 *
 * const remove = (): void => console.info("remove");
 *
 * <Menubar>
 *   <MenubarMenu value="edit">
 *     <MenubarTrigger>Edit</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem variant="destructive" onSelect={remove}>Delete</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarContent}
 */
function MenubarItem<T extends PolymorphicTarget = "div">(props: MenubarItemProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "inset", "variant"]);
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={local.inset === true ? "" : undefined}
      data-variant={local.variant ?? "default"}
      class={cn(
        ROW,
        "px-2 py-1.5 data-[inset]:ps-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:*:[svg]:text-destructive! [&_svg:not([class*='text-'])]:text-muted-foreground",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * An item that toggles a boolean, with a check mark while it is checked.
 *
 * Keyboard and ARIA: `role="menuitemcheckbox"` with `aria-checked` (`"mixed"` while indeterminate).
 * Enter, Space and a click toggle it, and the state changes even when `onSelect` keeps the menu open.
 * Its name is its text.
 *
 * @param props The item's props: `checked`, `defaultChecked`, `onCheckedChange`, and the label as
 * `children`. `class` adds to the classes.
 * @returns The checkbox item element.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
 *
 * export function ViewMenu() {
 *   const [bookmarks, setBookmarks] = useSignal(true);
 *   return (
 *     <Menubar>
 *       <MenubarMenu value="view">
 *         <MenubarTrigger>View</MenubarTrigger>
 *         <MenubarContent>
 *           <MenubarCheckboxItem checked={bookmarks()} onCheckedChange={setBookmarks}>
 *             Show bookmarks
 *           </MenubarCheckboxItem>
 *         </MenubarContent>
 *       </MenubarMenu>
 *     </Menubar>
 *   );
 * }
 * @since 1.0.0
 * @see {@link MenubarItem}
 */
function MenubarCheckboxItem(props: MenuCheckboxItemProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      class={cn(ROW, "py-1.5 ps-8 pe-2", local.class)}
      {...rest}
    >
      <span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon class="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {local.children}
    </MenubarPrimitive.CheckboxItem>
  );
}

/**
 * A group of mutually exclusive {@link MenubarRadioItem}s. It handles no keys of its own; the items
 * do.
 *
 * Keyboard and ARIA: a `role="group"`, with no name of its own; pass `aria-label` when the group needs one.
 *
 * @param props The group's props: `value`, `defaultValue`, `onValueChange`, and the `div` attributes.
 * @returns The group element.
 * @example
 * import { Menubar, MenubarContent, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="view">
 *     <MenubarTrigger>View</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarRadioGroup defaultValue="list">
 *         <MenubarRadioItem value="list">List</MenubarRadioItem>
 *         <MenubarRadioItem value="grid">Grid</MenubarRadioItem>
 *       </MenubarRadioGroup>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarRadioItem}
 */
function MenubarRadioGroup(props: MenuRadioGroupProps): JSX.Element {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

/**
 * An item of a {@link MenubarRadioGroup}, with a dot while it is the selected one.
 *
 * Keyboard and ARIA: `role="menuitemradio"` with `aria-checked`. Enter, Space and a click select it.
 * Its name is its text.
 *
 * @param props The item's props: `value` (required), and the label as `children`. `class` adds to the
 * classes.
 * @returns The radio item element.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { Menubar, MenubarContent, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="view">
 *     <MenubarTrigger>View</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarRadioGroup defaultValue="list">
 *         <MenubarRadioItem value="list">List</MenubarRadioItem>
 *       </MenubarRadioGroup>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarRadioGroup}
 */
function MenubarRadioItem(props: MenuRadioItemProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      class={cn(ROW, "py-1.5 ps-8 pe-2", local.class)}
      {...rest}
    >
      <span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon class="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {local.children}
    </MenubarPrimitive.RadioItem>
  );
}

/**
 * Props of {@link MenubarLabel}: the primitive's label props plus `inset`.
 * @since 1.0.0
 * @see {@link MenubarLabel}
 */
export type MenubarLabelProps = MenuLabelProps & {
  /**
   * Indents the label so it lines up with items that have an indicator.
   * @default false
   */
  readonly inset?: boolean | undefined;
};

/**
 * A heading for a group of items. It has no role, it is not focusable, and the arrow keys skip it.
 *
 * @param props The label's attributes, plus `inset`. `class` adds to the classes.
 * @returns The label element.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { Menubar, MenubarContent, MenubarLabel, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="account">
 *     <MenubarTrigger>Account</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarLabel>My Account</MenubarLabel>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarGroup}
 */
function MenubarLabel(props: MenubarLabelProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "inset"]);
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={local.inset === true ? "" : undefined}
      class={cn("px-2 py-1.5 text-sm font-medium data-[inset]:ps-8", local.class)}
      {...rest}
    />
  );
}

/**
 * A divider between groups of items.
 *
 * Keyboard and ARIA: a horizontal `role="separator"` with `aria-orientation="horizontal"`. The arrow
 * keys skip it.
 *
 * @param props The separator's attributes. `class` adds to the classes.
 * @returns The separator element.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="file">
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>New window</MenubarItem>
 *       <MenubarSeparator />
 *       <MenubarItem>Close</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarContent}
 */
function MenubarSeparator(props: MenuSeparatorProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      class={cn("-mx-1 my-1 h-px bg-border", local.class)}
      {...rest}
    />
  );
}

/**
 * A keyboard shortcut hint at the end of an item. It is text only: it shows the shortcut and does not
 * bind the key, so wire the key yourself.
 *
 * Keyboard and ARIA: a `span` with no role and no keys.
 *
 * @param props The `span` attributes. `class` adds to the classes.
 * @returns The shortcut `span`.
 * @example
 * import { MenubarItem, MenubarShortcut } from "@/components/ui/menubar";
 *
 * <MenubarItem>
 *   Save <MenubarShortcut>Ctrl+S</MenubarShortcut>
 * </MenubarItem>
 * @since 1.0.0
 * @see {@link MenubarItem}
 */
function MenubarShortcut(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="menubar-shortcut"
      class={cn("ms-auto text-xs tracking-widest text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * The root of a submenu. Place a {@link MenubarSubTrigger} and a {@link MenubarSubContent} in it. It
 * renders no element and handles no keys.
 *
 * @param props The submenu's options: `open`, `defaultOpen` and `onOpenChange`.
 * @returns The submenu's context around its children.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
 *
 * <Menubar>
 *   <MenubarMenu value="file">
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarSub>
 *         <MenubarSubTrigger>Share</MenubarSubTrigger>
 *         <MenubarSubContent>
 *           <MenubarItem>Email</MenubarItem>
 *         </MenubarSubContent>
 *       </MenubarSub>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * @since 1.0.0
 * @see {@link MenubarSubTrigger}
 */
function MenubarSub(props: MenuSubProps): JSX.Element {
  return <MenubarPrimitive.Sub {...props} />;
}

/**
 * The item that opens a submenu, with a chevron that flips in right-to-left layouts.
 *
 * Keyboard and ARIA: `role="menuitem"` with `aria-haspopup="menu"`, `aria-expanded`, and
 * `aria-controls` while the submenu is open. ArrowRight (ArrowLeft in right-to-left layouts), Enter
 * and Space open the submenu and focus its first item. Resting the pointer on it for a moment opens it
 * too.
 *
 * @param props The trigger's attributes, plus `inset` and `as`. `class` adds to the classes.
 * @returns The trigger element.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarItem } from "@/components/ui/menubar";
 *
 * <MenubarSub>
 *   <MenubarSubTrigger>Invite users</MenubarSubTrigger>
 *   <MenubarSubContent>
 *     <MenubarItem>Email</MenubarItem>
 *   </MenubarSubContent>
 * </MenubarSub>
 * @since 1.0.0
 * @see {@link MenubarSubContent}
 */
function MenubarSubTrigger<T extends PolymorphicTarget = "div">(
  props: MenuSubTriggerProps<T> & { readonly inset?: boolean | undefined },
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "inset", "children"]);
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={local.inset === true ? "" : undefined}
      class={cn(
        ROW,
        "px-2 py-1.5 data-[inset]:ps-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground forced-colors:data-[state=open]:bg-[Highlight] forced-colors:data-[state=open]:text-[HighlightText] [&_svg:not([class*='text-'])]:text-muted-foreground",
        local.class,
      )}
      {...rest}
    >
      {local.children}
      <ChevronRightIcon class="ms-auto size-4 rtl:rotate-180" />
    </MenubarPrimitive.SubTrigger>
  );
}

/**
 * The submenu panel, placed beside its trigger.
 *
 * Keyboard and ARIA: `role="menu"` with `aria-orientation="vertical"`, named by its trigger. ArrowLeft
 * (ArrowRight in right-to-left layouts) and Escape close it and return focus to the trigger. The arrow
 * keys, Home and End move between the items.
 *
 * @param props The panel's attributes. `class` adds to the classes.
 * @returns The submenu element, or nothing while it is closed.
 * @throws Error when rendered outside a menu of a {@link Menubar}.
 * @example
 * import { MenubarItem, MenubarSubContent } from "@/components/ui/menubar";
 *
 * <MenubarSubContent>
 *   <MenubarItem>Email</MenubarItem>
 * </MenubarSubContent>
 * @since 1.0.0
 * @see {@link MenubarSubTrigger}
 */
function MenubarSubContent(props: MenuSubContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      class={cn(
        PANEL,
        "max-h-(--primitives-available-height) overflow-x-hidden overflow-y-auto shadow-lg",
        local.class,
      )}
      {...rest}
    />
  );
}

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
