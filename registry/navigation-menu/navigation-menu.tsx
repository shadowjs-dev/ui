import { splitProps } from "@shadow-js/core";
import {
  NavigationMenu as NavigationMenuPrimitive,
  type NavigationMenuProps as NavigationMenuPrimitiveProps,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * The classes of a trigger, for a plain link or a button that should look like a top-level item of
 * a {@link NavigationMenu}.
 *
 * @param props Optional `class` (or `className`) to add to the classes.
 * @returns The class string.
 * @example
 * import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
 *
 * <a href="/about" class={navigationMenuTriggerStyle()}>About</a>
 * @since 1.0.0
 * @see {@link NavigationMenu}
 */
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground motion-reduce:transition-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
);

/**
 * Props of {@link NavigationMenu}: the `nav` attributes plus `value`, `defaultValue`,
 * `onValueChange`, `delayDuration`, `orientation` and `dir`, which are the primitive's.
 * @since 1.0.0
 * @see {@link NavigationMenu}
 */
export type NavigationMenuProps = NavigationMenuPrimitiveProps;

/**
 * The site navigation with flyouts. Each trigger opens its content on click, on a pointer rest
 * (after `delayDuration`), or with ArrowDown, which moves focus into the content. Escape closes the
 * open item and returns focus to its trigger, and a press outside closes it.
 *
 * Keyboard and ARIA: a `nav` element. Name it with `aria-label` (for example `aria-label="Main"`)
 * when the page has more than one navigation. Each trigger has `aria-expanded`, and `aria-controls`
 * while its content is open; the content is labeled by its trigger. Left and Right move between the
 * triggers (Up and Down when vertical); Home and End go to the first and last.
 *
 * @param props See {@link NavigationMenuProps}. `class` adds to the menu's classes.
 * @returns The `nav` element with the items inside.
 * @example
 * import {
 *   NavigationMenu,
 *   NavigationMenuContent,
 *   NavigationMenuItem,
 *   NavigationMenuLink,
 *   NavigationMenuList,
 *   NavigationMenuTrigger,
 * } from "@/components/ui/navigation-menu";
 *
 * <NavigationMenu aria-label="Main">
 *   <NavigationMenuList>
 *     <NavigationMenuItem value="docs">
 *       <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
 *       <NavigationMenuContent>
 *         <NavigationMenuLink href="/docs/start">Get started</NavigationMenuLink>
 *       </NavigationMenuContent>
 *     </NavigationMenuItem>
 *   </NavigationMenuList>
 * </NavigationMenu>
 * @since 1.0.0
 * @see {@link NavigationMenuItem}
 */
function NavigationMenu(props: NavigationMenuProps): JSX.Element {
  const [local, rest] = splitProps(
    props as NavigationMenuProps & { readonly class?: unknown; readonly children?: unknown },
    ["class", "children"],
  );
  return (
    <NavigationMenuPrimitive
      data-slot="navigation-menu"
      class={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        local.class as string | undefined,
      )}
      {...rest}
    >
      {local.children as JSX.Element}
      <div data-slot="navigation-menu-viewport-position" class="absolute start-0 top-full" />
    </NavigationMenuPrimitive>
  );
}

/**
 * The row of top-level items of a {@link NavigationMenu}: a `ul`.
 *
 * Keyboard and ARIA: a plain list with no role of its own. The triggers inside it are the tab
 * stops, one at a time, and carry the keys.
 *
 * @param props The `ul` attributes. `class` adds to the classes.
 * @returns The `ul` element.
 * @throws Error when rendered outside a {@link NavigationMenu}.
 * @example
 * import { NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
 *
 * <NavigationMenuList>
 *   <NavigationMenuItem value="about">...</NavigationMenuItem>
 * </NavigationMenuList>
 * @since 1.0.0
 * @see {@link NavigationMenu}
 */
function NavigationMenuList(props: ComponentProps<"ul">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      class={cn("group flex flex-1 list-none items-center justify-center gap-1", local.class)}
      {...rest}
    />
  );
}

/**
 * One item of the list: a trigger and its content, linked through `value`. Use it as the container
 * of a {@link NavigationMenuTrigger} and a {@link NavigationMenuContent}.
 *
 * Keyboard and ARIA: an `li` with no role of its own. The trigger and the content are linked
 * through `value`, which builds their ids.
 *
 * shadcn/ui differences: `value` is required here, because it links the trigger to the content. The
 * shadcn examples render `NavigationMenuItem` without one.
 *
 * @param props The `li` attributes, plus `value` (the name of the item). `class` adds to the classes.
 * @returns The `li` element.
 * @throws Error when rendered outside a {@link NavigationMenu}.
 * @example
 * import {
 *   NavigationMenuContent,
 *   NavigationMenuItem,
 *   NavigationMenuLink,
 *   NavigationMenuList,
 *   NavigationMenuTrigger,
 * } from "@/components/ui/navigation-menu";
 *
 * <NavigationMenuList>
 *   <NavigationMenuItem value="products">
 *     <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *     <NavigationMenuContent>
 *       <NavigationMenuLink href="/products/tools">Tools</NavigationMenuLink>
 *     </NavigationMenuContent>
 *   </NavigationMenuItem>
 * </NavigationMenuList>
 * @since 1.0.0
 * @see {@link NavigationMenuTrigger}
 */
function NavigationMenuItem(props: ComponentProps<"li"> & { readonly value: string }): JSX.Element {
  const [local, rest] = splitProps(
    props as ComponentProps<"li"> & { readonly value: string; readonly class?: unknown },
    ["class", "value"],
  );
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      value={local.value}
      // Not positioned: a flyout is placed against the menu (the nearest positioned ancestor), so it
      // hangs below the bar instead of over its own trigger.
      class={cn(local.class as string | undefined)}
      {...rest}
    />
  );
}

/**
 * The button that opens an item's content, with a chevron that turns while the content is open.
 *
 * Keyboard and ARIA: a button with `aria-expanded`, and `aria-controls` while its content is open.
 * Enter and Space toggle the content; ArrowDown opens it and moves focus into it; Left and Right move
 * to the neighboring trigger; Home and End go to the first and last. The chevron is decorative and
 * hidden from assistive technology. Its name is its text.
 *
 * @param props The `button` attributes. `class` adds to the classes; `children` is the label.
 * @returns The trigger button.
 * @throws Error when rendered outside a {@link NavigationMenu} or its {@link NavigationMenuItem}.
 * @example
 * import { NavigationMenuItem, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
 *
 * <NavigationMenuItem value="products">
 *   <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 * </NavigationMenuItem>
 * @since 1.0.0
 * @see {@link NavigationMenuContent}
 */
function NavigationMenuTrigger(props: ComponentProps<"button">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      class={cn(navigationMenuTriggerStyle(), "group", local.class)}
      {...rest}
    >
      {local.children}
      <ChevronDownIcon
        aria-hidden="true"
        class="relative top-px ms-1 size-3 transition duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

/**
 * The flyout of an item. It is mounted only while its item is open; once it closes, it is removed
 * after any exit animation has ended.
 *
 * Keyboard and ARIA: it is labeled by its trigger (`aria-labelledby`). Escape, which closes the
 * item, is handled by the menu, so it works from inside the content too.
 *
 * @param props The `div` attributes. `class` adds to the classes; `children` are the links.
 * @returns The flyout `div`, or nothing while the item is closed.
 * @throws Error when rendered outside a {@link NavigationMenu} or its {@link NavigationMenuItem}.
 * @example
 * import { NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu";
 *
 * <NavigationMenuContent>
 *   <NavigationMenuLink href="/products/tools">Tools</NavigationMenuLink>
 * </NavigationMenuContent>
 * @since 1.0.0
 * @see {@link NavigationMenuTrigger}
 */
function NavigationMenuContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      class={cn(
        "start-0 w-full rounded-md border bg-popover p-2 pe-2.5 text-popover-foreground shadow md:absolute md:top-full md:mt-2 md:w-auto data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </NavigationMenuPrimitive.Content>
  );
}

/**
 * A link in the navigation: a link inside a content, or a plain link as a top-level item. Following
 * the link closes the menu. `active` marks the page the user is on.
 *
 * Keyboard and ARIA: a native link, so Enter follows it. `active` sets `aria-current="page"`. The
 * link adds no other ARIA attribute; its name is its text.
 *
 * @param props The `a` attributes, plus `active`. `class` adds to the classes.
 * @returns The `a` element.
 * @throws Error when rendered outside a {@link NavigationMenu}.
 * @example
 * import { NavigationMenuLink } from "@/components/ui/navigation-menu";
 *
 * <NavigationMenuLink href="/docs" active>Docs</NavigationMenuLink>
 * @since 1.0.0
 * @see {@link NavigationMenuContent}
 */
function NavigationMenuLink(
  props: ComponentProps<"a"> & { readonly active?: boolean | undefined },
): JSX.Element {
  const [local, rest] = splitProps(
    props as ComponentProps<"a"> & {
      readonly active?: boolean | undefined;
      readonly class?: unknown;
    },
    ["class", "active"],
  );
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      active={local.active === true}
      class={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:font-medium [&_svg:not([class*='size-'])]:size-4 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class as string | undefined,
      )}
      {...rest}
    />
  );
}

/**
 * The shared panel that hosts the open item's content, so the flyout resizes between items. Render it
 * once after the list. While it is rendered, every {@link NavigationMenuContent} renders inside it;
 * give the content `md:static md:mt-0 md:border-0 md:shadow-none` classes (or your own) to drop the
 * floating look it has on its own. Its size follows the open content through the CSS variables
 * `--primitives-navigation-menu-viewport-width` and `--primitives-navigation-menu-viewport-height`.
 *
 * Keyboard and ARIA: none of its own; the content keeps its labeling. In RTL the panel starts at the
 * right edge of the menu.
 *
 * @param props The `div` attributes. `class` adds to the classes of the panel.
 * @returns The wrapper `div` that holds the panel.
 * @throws Error when rendered outside a {@link NavigationMenu}.
 * @example
 * import { NavigationMenuViewport } from "@/components/ui/navigation-menu";
 *
 * <NavigationMenuViewport />
 * @since 1.0.0
 * @see {@link NavigationMenuContent}
 */
function NavigationMenuViewport(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div class="absolute start-0 top-full isolate z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        class={cn(
          "relative mt-1.5 h-[var(--primitives-navigation-menu-viewport-height)] w-full origin-top overflow-hidden rounded-md border bg-popover text-popover-foreground shadow md:w-[var(--primitives-navigation-menu-viewport-width)] data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-90 motion-reduce:animate-none",
          local.class,
        )}
        {...rest}
      />
    </div>
  );
}

/**
 * A marker that follows the open item's trigger: an arrow under the active item. Render it inside
 * the {@link NavigationMenuList}, which is positioned. It places itself with the CSS variables
 * `--primitives-navigation-menu-indicator-position` and `--primitives-navigation-menu-indicator-size`,
 * counted from the start edge, so it follows the trigger in RTL as well.
 *
 * Keyboard and ARIA: decorative, hidden from assistive technology.
 *
 * @param props The `div` attributes. `class` adds to the classes.
 * @returns The `div` element with the arrow inside.
 * @throws Error when rendered outside a {@link NavigationMenu}.
 * @example
 * import { NavigationMenuIndicator } from "@/components/ui/navigation-menu";
 *
 * <NavigationMenuIndicator />
 * @since 1.0.0
 * @see {@link NavigationMenuTrigger}
 */
function NavigationMenuIndicator(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      class={cn(
        "absolute start-[var(--primitives-navigation-menu-indicator-position)] top-full z-[1] flex h-1.5 w-[var(--primitives-navigation-menu-indicator-size)] items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in motion-reduce:animate-none",
        local.class,
      )}
      {...rest}
    >
      <div class="relative top-[60%] size-2 rotate-45 rounded-ss-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
