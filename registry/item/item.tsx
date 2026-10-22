import { splitProps } from "@shadow-js/core";
import {
  createPartContext,
  mergeElementProps,
  Polymorphic,
  type PolymorphicProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-md border border-transparent text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-accent/50",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border",
        muted: "bg-muted/50",
      },
      size: {
        default: "gap-4 p-4",
        sm: "gap-2.5 px-4 py-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** The props as the implementation sees them. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: unknown;
  readonly [prop: string]: unknown;
};

/** Set by {@link ItemGroup} for the items and separators inside its list. @internal */
const itemGroupContext = createPartContext<boolean>("ItemGroup");

/**
 * Own props of {@link Item}: its `variant` (`default`, `outline` or `muted`) and `size` (`default`
 * or `sm`).
 * @since 1.0.0
 * @see {@link Item}
 */
export type ItemOwnProps = VariantProps<typeof itemVariants>;

/**
 * Props of {@link Item}: the own props and the attributes of the chosen element (`div` by default,
 * or `as`).
 * @since 1.0.0
 * @see {@link Item}
 */
export type ItemProps<T extends PolymorphicTarget = "div"> = PolymorphicProps<
  "div",
  ItemOwnProps,
  T
>;

/**
 * A row of media, content and actions: a file, a person, a setting. Pass `as="a"` to make the whole
 * row a link; the focus ring and the hover state carry over.
 *
 * Keyboard and ARIA: the row handles no keys of its own. A plain row has no role, except inside an
 * {@link ItemGroup}, where it is a `listitem`. A row with `as="a"` is a link, so Enter follows it;
 * inside a group it is wrapped in a `listitem`. The row adds no name of its own; give it an
 * `aria-label` when its content does not say what it is. `data-variant` and `data-size` mirror the
 * props.
 *
 * @param props The row's attributes, plus `variant`, `size`, and `as` (the element to render).
 * @returns The row element, wrapped in a `listitem` `div` when it is a link inside a group.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { InfoIcon } from "@/components/ui/icons";
 * import {
 *   Item,
 *   ItemActions,
 *   ItemContent,
 *   ItemDescription,
 *   ItemMedia,
 *   ItemTitle,
 * } from "@/components/ui/item";
 *
 * <Item variant="outline">
 *   <ItemMedia variant="icon">
 *     <InfoIcon />
 *   </ItemMedia>
 *   <ItemContent>
 *     <ItemTitle>Report.pdf</ItemTitle>
 *     <ItemDescription>2 MB</ItemDescription>
 *   </ItemContent>
 *   <ItemActions>
 *     <Button size="sm" variant="outline">Open</Button>
 *   </ItemActions>
 * </Item>
 * @since 1.0.0
 * @see {@link ItemGroup}
 */
function Item<T extends PolymorphicTarget = "div">(props: ItemProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & ItemProps, [
    "as",
    "class",
    "variant",
    "size",
  ]);
  const inList = itemGroupContext.useOptional() === true;
  const element = (local.as as PolymorphicTarget | undefined) ?? "div";
  const merged = mergeElementProps(
    {
      "data-slot": "item",
      // A plain row is the listitem itself. A link row cannot be one, so it is wrapped below.
      role: inList && element === "div" ? "listitem" : undefined,
      get "data-variant"() {
        return (local.variant as string | undefined) ?? "default";
      },
      get "data-size"() {
        return (local.size as string | undefined) ?? "default";
      },
      get class() {
        return cn(
          itemVariants({
            variant: local.variant as "default" | "outline" | "muted" | undefined,
            size: local.size as "default" | "sm" | undefined,
          }),
          local.class as string | undefined,
        );
      },
    },
    rest,
  );
  const row = <Polymorphic as={element} {...merged} />;
  if (!inList || element === "div") return row;
  return (
    <div role="listitem" data-slot="item-row" class="w-full">
      {row}
    </div>
  );
}

/**
 * A list of items: a `div` with `role="list"`. Its items are listitems; a link item is wrapped in
 * one, and a separator inside it is presentational.
 *
 * Keyboard and ARIA: no keys of its own. The list has no name of its own: name it with `aria-label`
 * or `aria-labelledby`, for example `aria-label="Files"`.
 *
 * @param props The `div` attributes. `class` adds to the list's classes.
 * @returns The list `div` with its items inside.
 * @example
 * import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
 *
 * <ItemGroup aria-label="Files">
 *   <Item>
 *     <ItemContent>
 *       <ItemTitle>Report.pdf</ItemTitle>
 *     </ItemContent>
 *   </Item>
 * </ItemGroup>
 * @since 1.0.0
 * @see {@link Item}
 */
function ItemGroup(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <itemGroupContext.Provider value={true}>
      <div
        role="list"
        data-slot="item-group"
        class={cn("group/item-group flex flex-col", local.class)}
        {...rest}
      />
    </itemGroupContext.Provider>
  );
}

/**
 * A line between items of a group, or on its own. Inside an {@link ItemGroup} it is presentational
 * (`role="none"`); outside one it is a horizontal separator.
 *
 * Keyboard and ARIA: no keys, and it is not focusable. Outside a group it has `role="separator"` and
 * `aria-orientation="horizontal"`.
 *
 * @param props The `div` attributes. `class` adds to the classes.
 * @returns The separator `div`.
 * @example
 * import { Item, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
 *
 * <ItemGroup aria-label="Files">
 *   <Item>
 *     <ItemTitle>Report.pdf</ItemTitle>
 *   </Item>
 *   <ItemSeparator />
 *   <Item>
 *     <ItemTitle>Notes.txt</ItemTitle>
 *   </Item>
 * </ItemGroup>
 * @since 1.0.0
 * @see {@link ItemGroup}
 */
function ItemSeparator(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  const inList = itemGroupContext.useOptional() === true;
  const classes = cn("my-0 h-px w-full shrink-0 bg-border", local.class);
  return inList ? (
    <div role="none" data-slot="item-separator" class={classes} {...rest} />
  ) : (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="item-separator"
      class={classes}
      {...rest}
    />
  );
}

/**
 * Props of {@link ItemMedia}: the `div` attributes plus `variant`.
 * @since 1.0.0
 * @see {@link ItemMedia}
 */
export type ItemMediaProps = ComponentProps<"div"> & {
  /**
   * The kind of media. `icon` puts the child on a small tile; `image` fills a square with the child
   * (an `img`, for instance).
   * @default "default"
   */
  readonly variant?: "default" | "icon" | "image" | undefined;
};

/**
 * The leading media of an item: an icon on a tile (`variant="icon"`) or an image (`variant="image"`).
 *
 * Keyboard and ARIA: no keys and no role. An image inside it needs its own text alternative: use
 * `alt=""` when the title already says the same thing.
 *
 * @param props The `div` attributes plus `variant`. `class` adds to the classes.
 * @returns The media `div`.
 * @example
 * import { Item, ItemMedia } from "@/components/ui/item";
 *
 * <Item>
 *   <ItemMedia variant="image">
 *     <img src="/avatar.png" alt="" />
 *   </ItemMedia>
 * </Item>
 * @since 1.0.0
 * @see {@link Item}
 */
function ItemMedia(props: ItemMediaProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  const variant = (local.variant as string | undefined) ?? "default";
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      class={cn(
        "flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none",
        variant === "icon" &&
          "size-8 rounded-sm border bg-muted [&_svg:not([class*='size-'])]:size-4",
        variant === "image" &&
          "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The text of an item: its title and description, growing to fill the row.
 *
 * Keyboard and ARIA: a `div` with no role and no keys.
 *
 * @param props The `div` attributes. `class` adds to the classes.
 * @returns The content `div`.
 * @example
 * import { ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
 *
 * <ItemContent>
 *   <ItemTitle>Name</ItemTitle>
 *   <ItemDescription>Shown under the name</ItemDescription>
 * </ItemContent>
 * @since 1.0.0
 * @see {@link Item}
 */
function ItemContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item-content"
      class={cn("flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", local.class)}
      {...rest}
    />
  );
}

/**
 * The title of an item: the main line of text, in medium weight.
 *
 * Keyboard and ARIA: a `div` with no role and no keys.
 *
 * @param props The `div` attributes. `class` adds to the classes.
 * @returns The title `div`.
 * @example
 * import { ItemTitle } from "@/components/ui/item";
 *
 * <ItemTitle>Report.pdf</ItemTitle>
 * @since 1.0.0
 * @see {@link ItemContent}
 */
function ItemTitle(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item-title"
      class={cn("flex w-fit items-center gap-2 text-sm leading-snug font-medium", local.class)}
      {...rest}
    />
  );
}

/**
 * The description of an item: a secondary line of text, clamped to two lines.
 *
 * Keyboard and ARIA: a `p` with no role and no keys.
 *
 * @param props The `p` attributes. `class` adds to the classes.
 * @returns The description `p`.
 * @example
 * import { ItemDescription } from "@/components/ui/item";
 *
 * <ItemDescription>2 MB, edited yesterday</ItemDescription>
 * @since 1.0.0
 * @see {@link ItemContent}
 */
function ItemDescription(props: ComponentProps<"p">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      data-slot="item-description"
      class={cn(
        "line-clamp-2 text-sm leading-normal font-normal text-balance text-muted-foreground",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The actions at the end of an item, usually buttons.
 *
 * Keyboard and ARIA: no keys and no role of its own; the buttons inside keep theirs.
 *
 * @param props The `div` attributes. `class` adds to the classes.
 * @returns The actions `div`.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { ItemActions } from "@/components/ui/item";
 *
 * <ItemActions>
 *   <Button size="sm">Open</Button>
 * </ItemActions>
 * @since 1.0.0
 * @see {@link Item}
 */
function ItemActions(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div data-slot="item-actions" class={cn("flex items-center gap-2", local.class)} {...rest} />
  );
}

/**
 * A row above the content of an item, such as an image that spans the width.
 *
 * Keyboard and ARIA: no keys and no role of its own.
 *
 * @param props The `div` attributes. `class` adds to the classes.
 * @returns The header `div`.
 * @example
 * import { ItemHeader } from "@/components/ui/item";
 *
 * <ItemHeader>
 *   <img src="/cover.png" alt="" />
 * </ItemHeader>
 * @since 1.0.0
 * @see {@link Item}
 */
function ItemHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item-header"
      class={cn("flex basis-full items-center justify-between gap-2", local.class)}
      {...rest}
    />
  );
}

/**
 * A row below the content of an item, such as a count of comments.
 *
 * Keyboard and ARIA: no keys and no role of its own.
 *
 * @param props The `div` attributes. `class` adds to the classes.
 * @returns The footer `div`.
 * @example
 * import { ItemFooter } from "@/components/ui/item";
 *
 * <ItemFooter>3 comments</ItemFooter>
 * @since 1.0.0
 * @see {@link Item}
 */
function ItemFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="item-footer"
      class={cn("flex basis-full items-center justify-between gap-2", local.class)}
      {...rest}
    />
  );
}

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
};
