import { splitProps } from "@shadow-js/core";
import {
  type ContextMenuContentProps,
  ContextMenu as ContextMenuPrimitive,
  type ContextMenuProps,
  type ContextMenuTriggerProps,
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
 * A menu opened at the pointer by a right click, the keyboard's menu key or Shift+F10, or by a long
 * press on touch. Use it for actions on one area of the page, such as a canvas or a file row.
 * `dir="rtl"` mirrors the arrow keys and the side of submenus.
 *
 * Keyboard and ARIA: Shift+F10 or the ContextMenu key on the focused trigger opens the menu with its
 * first item focused. The menu is a `role="menu"` of `menuitem`, `menuitemcheckbox` and
 * `menuitemradio` items. Arrow keys, Home, End and typeahead move between items, Enter or Space
 * selects the focused item, and Escape or Tab closes the menu and returns focus to the element that had it before the menu opened. The
 * trigger is a Tab stop and has no role of its own. A disabled item is skipped by the arrow keys and
 * cannot be selected.
 *
 * shadcn/ui differences: the trigger renders a `span`, so pass `as="div"` for a block-level area.
 * `as` replaces `asChild`. The prop is `class`, not `className`, and every part has a `data-slot`.
 *
 * @param props The root props: see {@link ContextMenuProps}.
 * @returns The menu, which renders no element of its own.
 * @example
 * import {
 *   ContextMenu,
 *   ContextMenuContent,
 *   ContextMenuItem,
 *   ContextMenuTrigger,
 * } from "@/components/ui/context-menu";
 *
 * export function Canvas() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger class="flex h-40 w-72 items-center justify-center rounded-md border border-dashed">
 *         Right click here
 *       </ContextMenuTrigger>
 *       <ContextMenuContent class="w-52">
 *         <ContextMenuItem>Back</ContextMenuItem>
 *         <ContextMenuItem>Forward</ContextMenuItem>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuTrigger}
 * @see {@link ContextMenuContent}
 * @since 1.0.0
 */
function ContextMenu(props: ContextMenuProps): JSX.Element {
  return <ContextMenuPrimitive {...props} />;
}

/**
 * Renders the menu into `document.body`, or into the `container` you pass, while it is open. Nothing
 * is rendered on the server. {@link ContextMenuContent} already portals itself, so use this only to
 * choose another container.
 *
 * @param props The portal props: `container` (where to render the menu) and `forceMount`.
 * @returns The portal, or nothing while the menu is closed.
 * @example
 * import {
 *   ContextMenu,
 *   ContextMenuContent,
 *   ContextMenuItem,
 *   ContextMenuPortal,
 *   ContextMenuTrigger,
 * } from "@/components/ui/context-menu";
 *
 * export function Panel() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuPortal>
 *         <ContextMenuContent>
 *           <ContextMenuItem>Back</ContextMenuItem>
 *         </ContextMenuContent>
 *       </ContextMenuPortal>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuContent}
 * @since 1.0.0
 */
function ContextMenuPortal(props: MenuPortalProps): JSX.Element {
  return <ContextMenuPrimitive.Portal {...props} />;
}

/**
 * The area that opens the menu. It renders a focusable `span` (a Tab stop); pass `as="div"` for a
 * block-level area. A right click, a touch or pen held down for 700 ms, Shift+F10 and the ContextMenu
 * key open the menu at the trigger. Set `disabled` to keep the browser's own context menu.
 *
 * @param props The trigger props: the attributes of the rendered element, `as`, and `disabled`.
 * @returns The trigger element.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Row() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger as="div" class="h-40 rounded-md border">
 *         Right click here
 *       </ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuItem>Back</ContextMenuItem>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenu}
 * @since 1.0.0
 */
function ContextMenuTrigger<T extends PolymorphicTarget = "span">(
  props: ContextMenuTriggerProps<T>,
): JSX.Element {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

/**
 * The menu panel. It is rendered in `document.body` and placed beside the point that opened it, and
 * it takes focus when it opens. Its height is limited to the space available in the viewport.
 *
 * @param props The panel props: the attributes of the rendered `div` and `class`, which is merged with
 * the panel classes.
 * @returns The panel, rendered in a portal.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Menu() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent class="w-52">
 *         <ContextMenuItem>Back</ContextMenuItem>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuTrigger}
 * @since 1.0.0
 */
function ContextMenuContent(props: ContextMenuContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        class={cn(
          PANEL,
          "max-h-(--primitives-available-height) overflow-x-hidden overflow-y-auto shadow-md",
          local.class,
        )}
        {...rest}
      />
    </ContextMenuPortal>
  );
}

/**
 * A group of related items, announced as a `role="group"`. The arrow keys skip it.
 *
 * @param props The group props: the attributes of the rendered `div`.
 * @returns The group.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Account() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuGroup>
 *           <ContextMenuItem>Profile</ContextMenuItem>
 *         </ContextMenuGroup>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuItem}
 * @since 1.0.0
 */
function ContextMenuGroup(props: MenuGroupProps): JSX.Element {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

/**
 * Own props of {@link ContextMenuItem}: the extra parts the item adds to the menu item props.
 * @see {@link ContextMenuItem}
 * @since 1.0.0
 */
export interface ContextMenuItemExtraProps {
  /**
   * Indents the item so it lines up with items that have an indicator.
   * @default false
   */
  readonly inset?: boolean | undefined;
  /**
   * Colors the item for a dangerous action when `destructive`.
   * @default "default"
   */
  readonly variant?: "default" | "destructive" | undefined;
}

/**
 * Props of {@link ContextMenuItem}: `onSelect` (called when the item is picked, and `preventDefault()`
 * keeps the menu open), `disabled`, `inset`, `variant` and every attribute of the chosen element.
 * @see {@link ContextMenuItem}
 * @since 1.0.0
 */
export type ContextMenuItemProps<T extends PolymorphicTarget = "div"> = PolymorphicProps<
  "div",
  MenuItemOwnProps & ContextMenuItemExtraProps,
  T
>;

/**
 * An action in the menu. Selecting it, by a click, by Enter or by Space, closes the menu unless
 * `onSelect` calls `event.preventDefault()`. A disabled item is skipped by the arrow keys and cannot
 * be selected. While it has focus it has `data-highlighted`.
 *
 * Keyboard and ARIA: the item is a `role="menuitem"` with `tabindex="-1"`; the menu moves focus to it.
 * The item renders as a `div` by default. shadcn's `asChild` is the `as` prop here, for example
 * `<ContextMenuItem as="a" href="/settings">`.
 *
 * @param props The item props: see {@link ContextMenuItemProps}.
 * @returns The menu item.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Delete() {
 *   const remove = (): void => {
 *     // Delete the selected row here.
 *   };
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuItem variant="destructive" onSelect={remove}>
 *           Delete
 *         </ContextMenuItem>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuContent}
 * @see {@link ContextMenuCheckboxItem}
 * @since 1.0.0
 */
function ContextMenuItem<T extends PolymorphicTarget = "div">(
  props: ContextMenuItemProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "inset", "variant"]);
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
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
 * An item that toggles a boolean and shows a check mark while it is checked. Enter, Space and a click
 * toggle it, and it has `role="menuitemcheckbox"` with `aria-checked` (`"mixed"` while indeterminate).
 * The state changes even when `onSelect` keeps the menu open.
 *
 * @param props The item props: `checked` (`true`, `false` or `"indeterminate"`), `onCheckedChange`, and
 * the attributes of the item.
 * @returns The checkbox item.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function View() {
 *   const [bookmarks, setBookmarks] = useSignal(true);
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuCheckboxItem checked={bookmarks()} onCheckedChange={setBookmarks}>
 *           Show bookmarks
 *         </ContextMenuCheckboxItem>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuRadioGroup}
 * @since 1.0.0
 */
function ContextMenuCheckboxItem(props: MenuCheckboxItemProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      class={cn(ROW, "py-1.5 ps-8 pe-2", local.class)}
      {...rest}
    >
      <span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon class="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

/**
 * A group of mutually exclusive {@link ContextMenuRadioItem}s. It is a `role="group"` and handles no
 * keys itself; the items are navigated like any other menu item.
 *
 * @param props The group props: `value` (the selected item's value), `onValueChange`, and the
 * attributes of the rendered `div`.
 * @returns The group.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { ContextMenu, ContextMenuContent, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Position() {
 *   const [position, setPosition] = useSignal("bottom");
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuRadioGroup value={position()} onValueChange={setPosition}>
 *           <ContextMenuRadioItem value="top">Top</ContextMenuRadioItem>
 *           <ContextMenuRadioItem value="bottom">Bottom</ContextMenuRadioItem>
 *         </ContextMenuRadioGroup>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuRadioItem}
 * @since 1.0.0
 */
function ContextMenuRadioGroup(props: MenuRadioGroupProps): JSX.Element {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

/**
 * An item of a {@link ContextMenuRadioGroup}, with a dot while it is the selected one. It is a
 * `role="menuitemradio"` with `aria-checked`. Enter, Space and a click select it, even when `onSelect`
 * keeps the menu open.
 *
 * @param props The item props: `value` and the attributes of the item.
 * @returns The radio item.
 * @throws Error when rendered outside a {@link ContextMenuRadioGroup}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Density() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuRadioGroup value="compact">
 *           <ContextMenuRadioItem value="compact">Compact</ContextMenuRadioItem>
 *         </ContextMenuRadioGroup>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuRadioGroup}
 * @since 1.0.0
 */
function ContextMenuRadioItem(props: MenuRadioItemProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      class={cn(ROW, "py-1.5 ps-8 pe-2", local.class)}
      {...rest}
    >
      <span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon class="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </ContextMenuPrimitive.RadioItem>
  );
}

/**
 * Props of {@link ContextMenuLabel}: the attributes of the rendered `div` and `inset`, which indents the
 * heading to line up with indented items.
 * @see {@link ContextMenuLabel}
 * @since 1.0.0
 */
export type ContextMenuLabelProps = MenuLabelProps & {
  /**
   * Indents the heading to line up with items that have an indicator.
   * @default false
   */
  readonly inset?: boolean | undefined;
};

/**
 * A heading for a group of items. It has no role, is not focusable, and the arrow keys skip it.
 *
 * @param props The heading props: see {@link ContextMenuLabelProps}.
 * @returns The heading.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function AccountMenu() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuLabel>My Account</ContextMenuLabel>
 *         <ContextMenuGroup>
 *           <ContextMenuItem>Profile</ContextMenuItem>
 *         </ContextMenuGroup>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuGroup}
 * @since 1.0.0
 */
function ContextMenuLabel(props: ContextMenuLabelProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "inset"]);
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={local.inset === true ? "" : undefined}
      class={cn("px-2 py-1.5 text-sm font-medium data-[inset]:ps-8", local.class)}
      {...rest}
    />
  );
}

/**
 * A divider between groups of items. It is a `role="separator"` with a horizontal orientation.
 *
 * @param props The separator props: the attributes of the rendered `div`.
 * @returns The separator.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Divided() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuItem>Back</ContextMenuItem>
 *         <ContextMenuSeparator />
 *         <ContextMenuItem>Delete</ContextMenuItem>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuGroup}
 * @since 1.0.0
 */
function ContextMenuSeparator(props: MenuSeparatorProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      class={cn("-mx-1 my-1 h-px bg-border", local.class)}
      {...rest}
    />
  );
}

/**
 * A keyboard shortcut hint at the end of an item. It is decorative: it does not add a key binding.
 *
 * @param props The hint props: the attributes of the rendered `span`, and `children` (the shortcut text).
 * @returns The hint.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Editing() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuItem>
 *           Save
 *           <ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
 *         </ContextMenuItem>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuItem}
 * @since 1.0.0
 */
function ContextMenuShortcut(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="context-menu-shortcut"
      class={cn("ms-auto text-xs tracking-widest text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * The root of a submenu. It renders no element; place a {@link ContextMenuSubTrigger} and a
 * {@link ContextMenuSubContent} in it, inside a {@link ContextMenuContent}. The submenu closes when its
 * menu does.
 *
 * @param props The submenu props: `open`, `defaultOpen` and `onOpenChange` of the submenu.
 * @returns The submenu's context around its children.
 * @throws Error when rendered outside a {@link ContextMenu}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Share() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuSub>
 *           <ContextMenuSubTrigger>Invite users</ContextMenuSubTrigger>
 *           <ContextMenuSubContent>
 *             <ContextMenuItem>Email</ContextMenuItem>
 *           </ContextMenuSubContent>
 *         </ContextMenuSub>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuSubTrigger}
 * @see {@link ContextMenuSubContent}
 * @since 1.0.0
 */
function ContextMenuSub(props: MenuSubProps): JSX.Element {
  return <ContextMenuPrimitive.Sub {...props} />;
}

/**
 * The item that opens a submenu, with a chevron that points the other way in right-to-left layouts.
 * It is a `role="menuitem"` with `aria-haspopup="menu"` and `aria-expanded`. ArrowRight opens the
 * submenu (ArrowLeft in right-to-left layouts), and the item has `data-state="open"` or
 * `data-state="closed"`.
 *
 * @param props The trigger props: the attributes of the rendered `div`, `inset`, and `children`.
 * @returns The submenu trigger.
 * @throws Error when rendered outside a {@link ContextMenuSub}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Invite() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuSub>
 *           <ContextMenuSubTrigger inset>Invite users</ContextMenuSubTrigger>
 *           <ContextMenuSubContent>
 *             <ContextMenuItem>Email</ContextMenuItem>
 *           </ContextMenuSubContent>
 *         </ContextMenuSub>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuSub}
 * @since 1.0.0
 */
function ContextMenuSubTrigger<T extends PolymorphicTarget = "div">(
  props: MenuSubTriggerProps<T> & { readonly inset?: boolean | undefined },
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "inset", "children"]);
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
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
    </ContextMenuPrimitive.SubTrigger>
  );
}

/**
 * The submenu panel, placed beside its trigger. It is a `role="menu"` labeled by its trigger.
 * ArrowLeft (ArrowRight in right-to-left layouts) and Escape close it and return focus to the trigger.
 *
 * @param props The panel props: the attributes of the rendered `div` and `class`.
 * @returns The submenu panel.
 * @throws Error when rendered outside a {@link ContextMenuSub}.
 * @example
 * import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
 *
 * export function Share() {
 *   return (
 *     <ContextMenu>
 *       <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *       <ContextMenuContent>
 *         <ContextMenuSub>
 *           <ContextMenuSubTrigger>Invite users</ContextMenuSubTrigger>
 *           <ContextMenuSubContent class="w-44">
 *             <ContextMenuItem>Email</ContextMenuItem>
 *           </ContextMenuSubContent>
 *         </ContextMenuSub>
 *       </ContextMenuContent>
 *     </ContextMenu>
 *   );
 * }
 * @see {@link ContextMenuSubTrigger}
 * @since 1.0.0
 */
function ContextMenuSubContent(props: MenuSubContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
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
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
