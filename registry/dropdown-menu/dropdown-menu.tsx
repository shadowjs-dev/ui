import { splitProps } from "@shadow-js/core";
import {
  DropdownMenu as DropdownMenuPrimitive,
  type DropdownMenuProps,
  type DropdownMenuTriggerProps,
  type MenuCheckboxItemProps,
  type MenuContentProps,
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
 * A menu opened from a button, such as a user menu or a row's actions. It is controlled with `open` and
 * `onOpenChange`, or uncontrolled with `defaultOpen`. `dir="rtl"` mirrors the arrow keys and the side
 * of submenus.
 *
 * Keyboard and ARIA: this follows the WAI-ARIA menu button pattern. Enter and Space on the trigger
 * toggle the menu, and opening it focuses the first item. ArrowDown opens it with the first item
 * focused, and ArrowUp with the last. In the menu, the arrow keys, Home, End, PageUp, PageDown and
 * typeahead move between items, and Enter or Space selects the focused item. Escape or Tab closes the
 * menu and returns focus to the trigger. The trigger has `aria-haspopup="menu"`, `aria-expanded`, and
 * `aria-controls` while the menu is open. The content is a `role="menu"` of `menuitem`,
 * `menuitemcheckbox` and `menuitemradio` items, labeled by the trigger. A disabled item is skipped by
 * the arrow keys and cannot be selected.
 *
 * shadcn/ui differences: `as` replaces `asChild` on the trigger and on items. The prop is `class`, not `className`, and every part has a `data-slot`.
 *
 * @param props The menu props: see {@link DropdownMenuProps}.
 * @returns The menu. It renders no element of its own.
 * @example
 * import { Button } from "@/components/ui/button";
 * import {
 *   DropdownMenu,
 *   DropdownMenuContent,
 *   DropdownMenuItem,
 *   DropdownMenuLabel,
 *   DropdownMenuSeparator,
 *   DropdownMenuTrigger,
 * } from "@/components/ui/dropdown-menu";
 *
 * export function AccountMenu() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger as={Button} variant="outline">
 *         Open
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuLabel>My Account</DropdownMenuLabel>
 *         <DropdownMenuSeparator />
 *         <DropdownMenuItem>Profile</DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuTrigger}
 * @see {@link DropdownMenuContent}
 * @since 1.0.0
 */
function DropdownMenu(props: DropdownMenuProps): JSX.Element {
  return <DropdownMenuPrimitive {...props} />;
}

/**
 * Renders the menu into `document.body`, or into the `container` you pass, while it is open. Nothing is
 * rendered on the server. {@link DropdownMenuContent} already portals itself, so use this only to choose
 * another container.
 *
 * @param props The portal props: `container` and `forceMount`.
 * @returns The portal, or nothing while the menu is closed.
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Portaled() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *       <DropdownMenuPortal>
 *         <DropdownMenuContent>
 *           <DropdownMenuItem>Profile</DropdownMenuItem>
 *         </DropdownMenuContent>
 *       </DropdownMenuPortal>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuContent}
 * @since 1.0.0
 */
function DropdownMenuPortal(props: MenuPortalProps): JSX.Element {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

/**
 * The button that opens the menu and anchors it. It is a native button by default; `as` renders another
 * element, such as the shadcn `Button`. The keys are described on {@link DropdownMenu}.
 *
 * @param props The trigger props: the attributes of the rendered element, and `as`.
 * @returns The trigger.
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function OpenMenu() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger as={Button}>Open</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem>Profile</DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenu}
 * @since 1.0.0
 */
function DropdownMenuTrigger<T extends PolymorphicTarget = "button">(
  props: DropdownMenuTriggerProps<T>,
): JSX.Element {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

/**
 * The menu panel. It is rendered in `document.body`, placed against the trigger, and takes focus when it
 * opens. The gap between the trigger and the panel is 4 px unless you pass `sideOffset`.
 *
 * @param props The panel props: the placement options (such as `align`), `sideOffset`, `class` and the
 * attributes of the rendered `div`.
 * @returns The panel, rendered in a portal while the menu is open.
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Actions() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger as={Button} variant="outline">
 *         Actions
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent align="end" class="w-56">
 *         <DropdownMenuItem>Duplicate</DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuTrigger}
 * @since 1.0.0
 */
function DropdownMenuContent(props: MenuContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "sideOffset"]);
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={local.sideOffset ?? 4}
        class={cn(
          PANEL,
          "max-h-(--primitives-available-height) overflow-x-hidden overflow-y-auto shadow-md",
          local.class,
        )}
        {...rest}
      />
    </DropdownMenuPortal>
  );
}

/**
 * A group of related items, announced as a `role="group"`. The arrow keys skip it.
 *
 * @param props The group props: the attributes of the rendered `div`.
 * @returns The group.
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Account() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuGroup>
 *           <DropdownMenuItem>Profile</DropdownMenuItem>
 *         </DropdownMenuGroup>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuItem}
 * @since 1.0.0
 */
function DropdownMenuGroup(props: MenuGroupProps): JSX.Element {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

/**
 * Own props of {@link DropdownMenuItem}: the extra parts the item adds to the menu item props.
 * @see {@link DropdownMenuItem}
 * @since 1.0.0
 */
export interface DropdownMenuItemExtraProps {
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
 * Props of {@link DropdownMenuItem}: `onSelect` (called when the item is picked, and `preventDefault()`
 * keeps the menu open), `disabled`, `inset`, `variant` and every attribute of the chosen element.
 * @see {@link DropdownMenuItem}
 * @since 1.0.0
 */
export type DropdownMenuItemProps<T extends PolymorphicTarget = "div"> = PolymorphicProps<
  "div",
  MenuItemOwnProps & DropdownMenuItemExtraProps,
  T
>;

/**
 * An action in the menu. Selecting it, by a click, Enter or Space, closes the menu unless `onSelect`
 * calls `event.preventDefault()`. A disabled item is skipped by the arrow keys and cannot be selected.
 * It is a `role="menuitem"` with `tabindex="-1"`, and it has `data-highlighted` while it has focus.
 * shadcn's `asChild` is the `as` prop here: `<DropdownMenuItem as="a" href="/settings">`.
 *
 * @param props The item props: see {@link DropdownMenuItemProps}.
 * @returns The menu item.
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Delete() {
 *   const remove = (): void => {
 *     // Delete the item here.
 *   };
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem variant="destructive" onSelect={remove}>
 *           Delete
 *         </DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuContent}
 * @since 1.0.0
 */
function DropdownMenuItem<T extends PolymorphicTarget = "div">(
  props: DropdownMenuItemProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "inset", "variant"]);
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
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
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function View() {
 *   const [bookmarks, setBookmarks] = useSignal(true);
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>View</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuCheckboxItem checked={bookmarks()} onCheckedChange={setBookmarks}>
 *           Show bookmarks
 *         </DropdownMenuCheckboxItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuRadioGroup}
 * @since 1.0.0
 */
function DropdownMenuCheckboxItem(props: MenuCheckboxItemProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      class={cn(ROW, "py-1.5 ps-8 pe-2", local.class)}
      {...rest}
    >
      <span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon class="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

/**
 * A group of mutually exclusive {@link DropdownMenuRadioItem}s. It is a `role="group"` and handles no
 * keys itself; the items are navigated like any other menu item.
 *
 * @param props The group props: `value` (the selected item's value), `onValueChange`, and the
 * attributes of the rendered `div`.
 * @returns The group.
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Position() {
 *   const [position, setPosition] = useSignal("bottom");
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Position</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuRadioGroup value={position()} onValueChange={setPosition}>
 *           <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
 *           <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
 *         </DropdownMenuRadioGroup>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuRadioItem}
 * @since 1.0.0
 */
function DropdownMenuRadioGroup(props: MenuRadioGroupProps): JSX.Element {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

/**
 * An item of a {@link DropdownMenuRadioGroup}, with a dot while it is the selected one. It is a
 * `role="menuitemradio"` with `aria-checked`. Enter, Space and a click select it, even when `onSelect`
 * keeps the menu open.
 *
 * @param props The item props: `value` and the attributes of the item.
 * @returns The radio item.
 * @throws Error when rendered outside a {@link DropdownMenuRadioGroup}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Density() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Density</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuRadioGroup value="compact">
 *           <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
 *         </DropdownMenuRadioGroup>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuRadioGroup}
 * @since 1.0.0
 */
function DropdownMenuRadioItem(props: MenuRadioItemProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      class={cn(ROW, "py-1.5 ps-8 pe-2", local.class)}
      {...rest}
    >
      <span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon class="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

/**
 * Props of {@link DropdownMenuLabel}: the attributes of the rendered `div` and `inset`, which indents the
 * heading to line up with indented items.
 * @see {@link DropdownMenuLabel}
 * @since 1.0.0
 */
export type DropdownMenuLabelProps = MenuLabelProps & {
  /**
   * Indents the heading to line up with items that have an indicator.
   * @default false
   */
  readonly inset?: boolean | undefined;
};

/**
 * A heading for a group of items. It has no role, is not focusable, and the arrow keys skip it.
 *
 * @param props The heading props: see {@link DropdownMenuLabelProps}.
 * @returns The heading.
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function AccountMenu() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Account</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuLabel>My Account</DropdownMenuLabel>
 *         <DropdownMenuItem>Profile</DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuGroup}
 * @since 1.0.0
 */
function DropdownMenuLabel(props: DropdownMenuLabelProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "inset"]);
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
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
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Divided() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem>Back</DropdownMenuItem>
 *         <DropdownMenuSeparator />
 *         <DropdownMenuItem>Delete</DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuGroup}
 * @since 1.0.0
 */
function DropdownMenuSeparator(props: MenuSeparatorProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
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
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Editing() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Edit</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem>
 *           Save
 *           <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
 *         </DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuItem}
 * @since 1.0.0
 */
function DropdownMenuShortcut(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      class={cn("ms-auto text-xs tracking-widest text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * The root of a submenu. It renders no element; place a {@link DropdownMenuSubTrigger} and a
 * {@link DropdownMenuSubContent} in it, inside a {@link DropdownMenuContent}. The submenu closes when its
 * menu does.
 *
 * @param props The submenu props: `open`, `defaultOpen` and `onOpenChange` of the submenu.
 * @returns The submenu's context around its children.
 * @throws Error when rendered outside a {@link DropdownMenu}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Share() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Share</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuSub>
 *           <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
 *           <DropdownMenuSubContent>
 *             <DropdownMenuItem>Email</DropdownMenuItem>
 *           </DropdownMenuSubContent>
 *         </DropdownMenuSub>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuSubTrigger}
 * @see {@link DropdownMenuSubContent}
 * @since 1.0.0
 */
function DropdownMenuSub(props: MenuSubProps): JSX.Element {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

/**
 * The item that opens a submenu, with a chevron that points the other way in right-to-left layouts. It is
 * a `role="menuitem"` with `aria-haspopup="menu"` and `aria-expanded`. ArrowRight opens the submenu
 * (ArrowLeft in right-to-left layouts).
 *
 * @param props The trigger props: the attributes of the rendered `div`, `inset`, and `children`.
 * @returns The submenu trigger.
 * @throws Error when rendered outside a {@link DropdownMenuSub}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Invite() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Share</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuSub>
 *           <DropdownMenuSubTrigger inset>Invite users</DropdownMenuSubTrigger>
 *           <DropdownMenuSubContent>
 *             <DropdownMenuItem>Email</DropdownMenuItem>
 *           </DropdownMenuSubContent>
 *         </DropdownMenuSub>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuSub}
 * @since 1.0.0
 */
function DropdownMenuSubTrigger<T extends PolymorphicTarget = "div">(
  props: MenuSubTriggerProps<T> & { readonly inset?: boolean | undefined },
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "inset", "children"]);
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
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
    </DropdownMenuPrimitive.SubTrigger>
  );
}

/**
 * The submenu panel, placed beside its trigger. It is a `role="menu"` labeled by its trigger. ArrowLeft
 * (ArrowRight in right-to-left layouts) and Escape close it and return focus to the trigger.
 *
 * @param props The panel props: the attributes of the rendered `div` and `class`.
 * @returns The submenu panel.
 * @throws Error when rendered outside a {@link DropdownMenuSub}.
 * @example
 * import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 *
 * export function Share() {
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>Share</DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuSub>
 *           <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
 *           <DropdownMenuSubContent class="w-44">
 *             <DropdownMenuItem>Email</DropdownMenuItem>
 *           </DropdownMenuSubContent>
 *         </DropdownMenuSub>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * @see {@link DropdownMenuSubTrigger}
 * @since 1.0.0
 */
function DropdownMenuSubContent(props: MenuSubContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
