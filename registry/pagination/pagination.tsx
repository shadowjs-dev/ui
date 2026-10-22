import { splitProps } from "@shadow-js/core";
import {
  type PaginationEllipsisProps,
  type PaginationListProps,
  type PaginationNextProps,
  type PaginationPreviousProps,
  Pagination as PaginationPrimitive,
  type PaginationItemProps as PaginationPrimitiveItemProps,
  type PaginationItemsProps as PaginationPrimitiveItemsProps,
  type PaginationProps,
  type PaginationRangeItem,
  Polymorphic,
  type PolymorphicProps,
  type PolymorphicTarget,
  paginationContext,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { type ClassValue, cn } from "@/lib/utils";

/** The sizes of {@link buttonVariants}, which page controls borrow. */
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

/** The props as the implementation sees them. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly size?: ButtonSize;
  readonly page?: number;
  readonly isActive?: boolean | undefined;
  readonly itemProps?: Record<string, unknown> | undefined;
  readonly children?: JSX.Element;
  readonly [prop: string]: unknown;
};

/**
 * Page navigation: a `nav` landmark that holds the page list. Controlled with `page` and
 * `onPageChange`, or uncontrolled with `defaultPage`. `pageCount` is the number of pages. The current
 * page is kept within `1..pageCount`, so a shrinking list never leaves the bar on a page that does
 * not exist.
 *
 * Keyboard and ARIA: the items are ordinary tab stops. Enter goes to the page on a link, and Enter or
 * Space on a button. The `nav` is named "pagination" by default; override it with `aria-label` when
 * the page has more than one navigation. The current item has `aria-current="page"`. Previous and
 * Next are named "Go to previous page" and "Go to next page", and carry `aria-disabled` at the ends.
 *
 * Pass `getHref` to make the pages links; without it they are buttons.
 *
 * Styling hooks: every part carries a `data-slot`: `pagination` on the `nav`, `pagination-content`
 * on the list, `pagination-item` on the `li` of each control, `pagination-link` on the page,
 * Previous and Next controls, and `pagination-ellipsis` on the ellipsis.
 *
 * @param props The `nav` attributes plus the primitive's options: `page`, `defaultPage`,
 * `onPageChange`, `pageCount`, `siblingCount`, `boundaryCount`, `disabled`, `dir`, `getItemLabel` and
 * `getHref`. `class` adds to the classes.
 * @returns The `nav` element with its children inside.
 * @example
 * import {
 *   Pagination,
 *   PaginationContent,
 *   PaginationItems,
 *   PaginationNext,
 *   PaginationPrevious,
 * } from "@/components/ui/pagination";
 *
 * const load = (page: number): void => console.info("page", page);
 *
 * <Pagination pageCount={20} defaultPage={3} onPageChange={load}>
 *   <PaginationContent>
 *     <PaginationPrevious />
 *     <PaginationItems />
 *     <PaginationNext />
 *   </PaginationContent>
 * </Pagination>
 * @since 1.0.0
 * @see {@link PaginationContent}
 */
function Pagination(props: PaginationProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  const t = useUiStrings();
  return (
    <PaginationPrimitive
      data-slot="pagination"
      aria-label={t("pagination.label", "pagination")}
      getItemLabel={(page: number) => t("pagination.goToPage", "Go to page {page}", { page })}
      class={cn("mx-auto flex w-full justify-center", local.class)}
      {...rest}
    />
  );
}

/**
 * The list (`ul`) of page controls.
 *
 * Keyboard and ARIA: a plain list with no role of its own; the controls inside are the tab stops.
 *
 * @param props The `ul` attributes. `class` adds to the classes.
 * @returns The `ul` element.
 * @throws Error when rendered outside a {@link Pagination}.
 * @example
 * import { Pagination, PaginationContent, PaginationItems } from "@/components/ui/pagination";
 *
 * <Pagination pageCount={5}>
 *   <PaginationContent>
 *     <PaginationItems />
 *   </PaginationContent>
 * </Pagination>
 * @since 1.0.0
 * @see {@link Pagination}
 */
function PaginationContent(props: PaginationListProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <PaginationPrimitive.List
      data-slot="pagination-content"
      class={cn("flex flex-row items-center gap-1", local.class)}
      {...rest}
    />
  );
}

/**
 * Own props of {@link PaginationItem}, {@link PaginationLink}, {@link PaginationPrevious} and
 * {@link PaginationNext}: the `size` of the button the control looks like.
 * @since 1.0.0
 * @see {@link PaginationItem}
 */
export interface PaginationSizeProps {
  /**
   * The size of the button the control looks like: `default`, `sm`, `lg`, `icon`, `icon-sm` or
   * `icon-lg`. {@link PaginationPrevious} and {@link PaginationNext} default to `"default"`.
   * @default "icon"
   */
  readonly size?: ButtonSize;
}

/**
 * Props of {@link PaginationItem}: the primitive's item props (`page`, `itemProps`, and the link
 * attributes) plus `size`.
 * @since 1.0.0
 * @see {@link PaginationItem}
 */
export type PaginationItemProps<T extends PolymorphicTarget = "a"> =
  PaginationPrimitiveItemProps<T> & PaginationSizeProps;

/** `itemProps` for the `li` of a control, with the shadcn slot. */
function itemShell(itemProps: Record<string, unknown> | undefined): Record<string, unknown> {
  return { "data-slot": "pagination-item", ...itemProps };
}

/**
 * One page of the bar: an `li` holding a link (or a button, without `getHref`) that goes to `page`.
 * The current page looks `outline` and has `aria-current="page"`; the others look `ghost`. `class`
 * styles the link, and `itemProps` the `li`.
 *
 * Keyboard and ARIA: Enter goes to the page on a link; Enter or Space does on a button. The link is
 * named "Go to page N", unless the root's `getItemLabel` says otherwise.
 *
 * shadcn/ui differences: in shadcn, `PaginationItem` is the bare `li` around a `PaginationLink`. Here
 * `PaginationItem` renders both, because the primitive's item owns the link behavior. Use
 * {@link PaginationLink} for hand-written markup.
 *
 * @param props See {@link PaginationItemProps}.
 * @returns The `li` element around the link or button.
 * @throws Error when rendered outside a {@link Pagination}.
 * @example
 * import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
 *
 * <Pagination pageCount={5}>
 *   <PaginationContent>
 *     <PaginationItem page={3}>3</PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 * @since 1.0.0
 * @see {@link PaginationItems}
 */
function PaginationItem<T extends PolymorphicTarget = "a">(
  props: PaginationItemProps<T>,
): JSX.Element {
  const context = paginationContext.use("PaginationItem");
  const [local, rest] = splitProps(props as unknown as Loose, [
    "class",
    "size",
    "itemProps",
    "page",
  ]);
  const active = (): boolean => context.page() === local.page;
  return (
    <PaginationPrimitive.Item
      data-slot="pagination-link"
      class={cn(
        buttonVariants({ variant: active() ? "outline" : "ghost", size: local.size ?? "icon" }),
        local.class,
      )}
      itemProps={itemShell(local.itemProps)}
      page={local.page ?? 1}
      {...rest}
    />
  );
}

/**
 * Props of {@link PaginationLink}: the attributes of the chosen element (`a` by default), plus
 * `isActive` and `size`.
 * @since 1.0.0
 * @see {@link PaginationLink}
 */
export type PaginationLinkProps<T extends PolymorphicTarget = "a"> = PolymorphicProps<
  "a",
  PaginationSizeProps & {
    /**
     * Marks the link as the current page: it looks `outline` and gets `aria-current="page"`.
     * @default false
     */
    readonly isActive?: boolean | undefined;
  },
  T
>;

/**
 * A link styled like a page button, for hand-written pagination markup (your router's link, through
 * `as`). It is not connected to the {@link Pagination} state, so set `isActive` yourself. Wrap it in
 * a plain `li`.
 *
 * Keyboard and ARIA: a native link, so Enter follows it; `as` renders another element in its place.
 * `isActive` sets `aria-current="page"` and `data-active="true"`. Its name is its text.
 *
 * @param props The link's attributes, plus `isActive`, `size` and `as`. `class` adds to the classes.
 * @returns The link element.
 * @example
 * import { PaginationLink } from "@/components/ui/pagination";
 *
 * <li>
 *   <PaginationLink href="/page/2" isActive>2</PaginationLink>
 * </li>
 * @since 1.0.0
 * @see {@link PaginationItem}
 */
function PaginationLink<T extends PolymorphicTarget = "a">(
  props: PaginationLinkProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class", "isActive", "size"]);
  return (
    <Polymorphic
      as={local.as ?? "a"}
      data-slot="pagination-link"
      aria-current={local.isActive === true ? "page" : undefined}
      data-active={local.isActive === true ? "true" : undefined}
      class={cn(
        buttonVariants({
          variant: local.isActive === true ? "outline" : "ghost",
          size: local.size ?? "icon",
        }),
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Props of {@link PaginationPrevious}: the primitive's props plus `size`. `children` replaces the
 * "Previous" text.
 * @since 1.0.0
 * @see {@link PaginationPrevious}
 */
export type PaginationPreviousUiProps<T extends PolymorphicTarget = "a"> =
  PaginationPreviousProps<T> & PaginationSizeProps;

/**
 * Goes to the previous page. On the first page it is disabled (`aria-disabled`) but stays in the bar,
 * so the bar does not shift. The text hides on small screens; the accessible name is "Go to previous
 * page".
 *
 * Keyboard and ARIA: a link with `rel="prev"` or a button, depending on the root's `getHref`. Enter
 * (on a link) or Enter and Space (on a button) goes to the previous page.
 *
 * @param props See {@link PaginationPreviousUiProps}. `children` replaces the "Previous" text.
 * @returns The `li` element around the link or button.
 * @throws Error when rendered outside a {@link Pagination}.
 * @example
 * import { Pagination, PaginationContent, PaginationPrevious } from "@/components/ui/pagination";
 *
 * <Pagination pageCount={5}>
 *   <PaginationContent>
 *     <PaginationPrevious />
 *   </PaginationContent>
 * </Pagination>
 * @since 1.0.0
 * @see {@link PaginationNext}
 */
function PaginationPrevious<T extends PolymorphicTarget = "a">(
  props: PaginationPreviousUiProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, [
    "class",
    "size",
    "itemProps",
    "children",
  ]);
  const t = useUiStrings();
  return (
    <PaginationPrimitive.Previous
      data-slot="pagination-link"
      aria-label={t("pagination.goPrevious", "Go to previous page")}
      class={cn(
        buttonVariants({ variant: "ghost", size: local.size ?? "default" }),
        "gap-1 px-2.5 sm:ps-2.5",
        local.class,
      )}
      itemProps={itemShell(local.itemProps)}
      {...rest}
    >
      <ChevronLeftIcon class="rtl:rotate-180" />
      <span class="hidden sm:block">{local.children ?? t("pagination.previous", "Previous")}</span>
    </PaginationPrimitive.Previous>
  );
}

/**
 * Props of {@link PaginationNext}: the primitive's props plus `size`. `children` replaces the "Next"
 * text.
 * @since 1.0.0
 * @see {@link PaginationNext}
 */
export type PaginationNextUiProps<T extends PolymorphicTarget = "a"> = PaginationNextProps<T> &
  PaginationSizeProps;

/**
 * Goes to the next page. On the last page it is disabled (`aria-disabled`) but stays in the bar, so
 * the bar does not shift. The text hides on small screens; the accessible name is "Go to next page".
 *
 * Keyboard and ARIA: a link with `rel="next"` or a button, depending on the root's `getHref`. Enter
 * (on a link) or Enter and Space (on a button) goes to the next page.
 *
 * @param props See {@link PaginationNextUiProps}. `children` replaces the "Next" text.
 * @returns The `li` element around the link or button.
 * @throws Error when rendered outside a {@link Pagination}.
 * @example
 * import { Pagination, PaginationContent, PaginationNext } from "@/components/ui/pagination";
 *
 * <Pagination pageCount={5}>
 *   <PaginationContent>
 *     <PaginationNext />
 *   </PaginationContent>
 * </Pagination>
 * @since 1.0.0
 * @see {@link PaginationPrevious}
 */
function PaginationNext<T extends PolymorphicTarget = "a">(
  props: PaginationNextUiProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, [
    "class",
    "size",
    "itemProps",
    "children",
  ]);
  const t = useUiStrings();
  return (
    <PaginationPrimitive.Next
      data-slot="pagination-link"
      aria-label={t("pagination.goNext", "Go to next page")}
      class={cn(
        buttonVariants({ variant: "ghost", size: local.size ?? "default" }),
        "gap-1 px-2.5 sm:pe-2.5",
        local.class,
      )}
      itemProps={itemShell(local.itemProps)}
      {...rest}
    >
      <span class="hidden sm:block">{local.children ?? t("pagination.next", "Next")}</span>
      <ChevronRightIcon class="rtl:rotate-180" />
    </PaginationPrimitive.Next>
  );
}

/**
 * A gap standing for hidden pages, drawn as an ellipsis icon by default. Its `li` is `aria-hidden`,
 * so assistive technology skips it.
 *
 * Keyboard and ARIA: not focusable and not announced.
 *
 * @param props The `span` attributes, plus `itemProps` for the `li`. `children` replaces the icon.
 * @returns The `li` element around the gap.
 * @throws Error when rendered outside a {@link Pagination}.
 * @example
 * import { Pagination, PaginationContent, PaginationEllipsis } from "@/components/ui/pagination";
 *
 * <Pagination pageCount={20}>
 *   <PaginationContent>
 *     <PaginationEllipsis />
 *   </PaginationContent>
 * </Pagination>
 * @since 1.0.0
 * @see {@link PaginationItems}
 */
function PaginationEllipsis(props: PaginationEllipsisProps): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class", "itemProps", "children"]);
  return (
    <PaginationPrimitive.Ellipsis
      data-slot="pagination-ellipsis"
      class={cn("flex size-9 items-center justify-center", local.class)}
      itemProps={itemShell(local.itemProps)}
      {...rest}
    >
      {local.children ?? <EllipsisIcon class="size-4" />}
    </PaginationPrimitive.Ellipsis>
  );
}

/**
 * Renders the whole bar for the current page: a {@link PaginationItem} for each page and a
 * {@link PaginationEllipsis} for each gap, computed from the root's page count. Pass a function as
 * `children` to draw each slot yourself.
 *
 * Keyboard and ARIA: the items keep their own keys and ARIA, as described on {@link Pagination}. The
 * number of slots stays the same while the user pages through the list.
 *
 * @param props `children`, an optional function that receives each slot's range item (a page number,
 * or the gap) and returns what to render for it.
 * @returns The slots of the bar for the current page.
 * @throws Error when rendered outside a {@link Pagination}.
 * @example
 * import { Pagination, PaginationContent, PaginationItems } from "@/components/ui/pagination";
 *
 * <Pagination pageCount={20}>
 *   <PaginationContent>
 *     <PaginationItems />
 *   </PaginationContent>
 * </Pagination>
 * @since 1.0.0
 * @see {@link PaginationItem}
 */
function PaginationItems(props: PaginationPrimitiveItemsProps): JSX.Element {
  return (
    <PaginationPrimitive.Items>
      {(item: PaginationRangeItem) => {
        const render = props.children;
        if (render !== undefined) return render(item);
        if (typeof item === "number") return <PaginationItem page={item}>{item}</PaginationItem>;
        return <PaginationEllipsis />;
      }}
    </PaginationPrimitive.Items>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
