import { splitProps } from "@shadow-js/core";
import { Polymorphic, type PolymorphicProps, type PolymorphicTarget } from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { ChevronRightIcon, EllipsisIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * A trail of links that shows where the current page sits in the site. It renders a `nav` with
 * the accessible name "breadcrumb" and holds a {@link BreadcrumbList}.
 *
 * Keyboard and ARIA: the links are native anchors, so Tab moves between them and Enter follows
 * one. The current page is marked with `aria-current="page"` (see {@link BreadcrumbPage}). The
 * separators are hidden from assistive technology.
 *
 * Compared with shadcn/ui: `class` replaces `className`, `as` replaces `asChild` on
 * {@link BreadcrumbLink}, and every element carries `data-slot`.
 *
 * @param props - The navigation props: `children` and the `nav` attributes.
 * @returns The navigation element.
 * @example
 * ```tsx
 * import {
 *   Breadcrumb,
 *   BreadcrumbItem,
 *   BreadcrumbLink,
 *   BreadcrumbList,
 *   BreadcrumbPage,
 *   BreadcrumbSeparator,
 * } from "@/components/ui/breadcrumb";
 *
 * export function Trail() {
 *   return (
 *     <Breadcrumb>
 *       <BreadcrumbList>
 *         <BreadcrumbItem>
 *           <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *         </BreadcrumbItem>
 *         <BreadcrumbSeparator />
 *         <BreadcrumbItem>
 *           <BreadcrumbPage>Components</BreadcrumbPage>
 *         </BreadcrumbItem>
 *       </BreadcrumbList>
 *     </Breadcrumb>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link BreadcrumbList}
 * @see {@link BreadcrumbLink}
 */
function Breadcrumb(props: ComponentProps<"nav">): JSX.Element {
  const [local, rest] = splitProps(props, ["children"]);
  const t = useUiStrings();
  return (
    <nav aria-label={t("breadcrumb.label", "breadcrumb")} data-slot="breadcrumb" {...rest}>
      {local.children}
    </nav>
  );
}

/**
 * The ordered list of the trail. Each step is a {@link BreadcrumbItem}, and the steps are read in
 * order.
 *
 * @param props - The list props: `class`, `children`, and the `ol` attributes.
 * @returns The list element.
 * @example
 * ```tsx
 * import {
 *   Breadcrumb,
 *   BreadcrumbItem,
 *   BreadcrumbLink,
 *   BreadcrumbList,
 * } from "@/components/ui/breadcrumb";
 *
 * export function Steps() {
 *   return (
 *     <Breadcrumb>
 *       <BreadcrumbList>
 *         <BreadcrumbItem>
 *           <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
 *         </BreadcrumbItem>
 *       </BreadcrumbList>
 *     </Breadcrumb>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Breadcrumb}
 * @see {@link BreadcrumbItem}
 */
function BreadcrumbList(props: ComponentProps<"ol">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <ol
      data-slot="breadcrumb-list"
      class={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground sm:gap-2.5",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </ol>
  );
}

/**
 * One step of the trail: a link, the current page or an ellipsis. It renders an `li` inside a
 * {@link BreadcrumbList}.
 *
 * @param props - The item props: `class`, `children`, and the `li` attributes.
 * @returns The item element.
 * @example
 * ```tsx
 * import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
 *
 * export function DocsStep() {
 *   return (
 *     <BreadcrumbList>
 *       <BreadcrumbItem>
 *         <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
 *       </BreadcrumbItem>
 *     </BreadcrumbList>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link BreadcrumbList}
 */
function BreadcrumbItem(props: ComponentProps<"li">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <li
      data-slot="breadcrumb-item"
      class={cn("inline-flex items-center gap-1.5", local.class)}
      {...rest}
    >
      {local.children}
    </li>
  );
}

/** The props as the implementation sees them. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link BreadcrumbLink}: every attribute of the chosen element. The element is an `a`
 * by default; the `as` prop picks another one.
 * @since 1.0.0
 * @see {@link BreadcrumbLink}
 */
export type BreadcrumbLinkProps<T extends PolymorphicTarget = "a"> = PolymorphicProps<
  "a",
  object,
  T
>;

/**
 * A link to an earlier step of the trail. It renders an `a` with `href`. Use `as` to render your
 * router's link component instead, which keeps the same styles.
 *
 * Keyboard and ARIA: a native link. Tab focuses it and Enter follows it. The link's accessible name
 * is its text.
 *
 * @param props - The link props: `href`, `as`, `children`, and the attributes of the element.
 * @returns The link element.
 * @example
 * ```tsx
 * import { BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
 *
 * export function HomeLink() {
 *   return (
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *     </BreadcrumbItem>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link BreadcrumbLinkProps}
 * @see {@link BreadcrumbPage}
 */
function BreadcrumbLink<T extends PolymorphicTarget = "a">(
  props: BreadcrumbLinkProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class"]);
  return (
    <Polymorphic
      as={local.as ?? "a"}
      data-slot="breadcrumb-link"
      class={cn(
        "transition-colors hover:text-foreground motion-reduce:transition-none",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The current page: the last step of the trail. It is not a link.
 *
 * Keyboard and ARIA: the element is a `span` with `aria-current="page"`, `role="link"` and
 * `aria-disabled="true"`, so assistive technology announces a disabled link that is the current
 * page. It has no `href` and no `tabindex`, so it is not focusable.
 *
 * @param props - The page props: `children` and the `span` attributes.
 * @returns The page element.
 * @example
 * ```tsx
 * import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
 *
 * export function CurrentPage() {
 *   return (
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link BreadcrumbLink}
 */
function BreadcrumbPage(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      class={cn("font-normal text-foreground", local.class)}
      {...rest}
    >
      {local.children}
    </span>
  );
}

/**
 * The divider between two steps. By default it is a chevron that flips in right-to-left layouts;
 * pass children to show your own divider, such as `/`.
 *
 * Keyboard and ARIA: the separator is `role="presentation"` and `aria-hidden="true"`, so assistive
 * technology skips it.
 *
 * @param props - The separator props: `children` and the `li` attributes.
 * @returns The separator element.
 * @example
 * ```tsx
 * import {
 *   Breadcrumb,
 *   BreadcrumbItem,
 *   BreadcrumbLink,
 *   BreadcrumbList,
 *   BreadcrumbPage,
 *   BreadcrumbSeparator,
 * } from "@/components/ui/breadcrumb";
 *
 * export function SlashTrail() {
 *   return (
 *     <Breadcrumb>
 *       <BreadcrumbList>
 *         <BreadcrumbItem>
 *           <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *         </BreadcrumbItem>
 *         <BreadcrumbSeparator>/</BreadcrumbSeparator>
 *         <BreadcrumbItem>
 *           <BreadcrumbPage>Docs</BreadcrumbPage>
 *         </BreadcrumbItem>
 *       </BreadcrumbList>
 *     </Breadcrumb>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link BreadcrumbList}
 */
function BreadcrumbSeparator(props: ComponentProps<"li">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      class={cn("[&>svg]:size-3.5", local.class)}
      {...rest}
    >
      {local.children ?? <ChevronRightIcon class="rtl:rotate-180" />}
    </li>
  );
}

/**
 * Stands for collapsed steps of a long trail. Put a menu trigger around it to reveal the hidden
 * steps. It is an item of the list, so it goes inside a {@link BreadcrumbItem}.
 *
 * Keyboard and ARIA: the ellipsis is `role="presentation"` and `aria-hidden="true"`, so assistive
 * technology does not announce the collapsed steps. It has no keys of its own.
 *
 * @param props - The ellipsis props: the `span` attributes.
 * @returns The ellipsis element.
 * @example
 * ```tsx
 * import {
 *   BreadcrumbEllipsis,
 *   BreadcrumbItem,
 *   BreadcrumbList,
 * } from "@/components/ui/breadcrumb";
 *
 * export function Collapsed() {
 *   return (
 *     <BreadcrumbList>
 *       <BreadcrumbItem>
 *         <BreadcrumbEllipsis />
 *       </BreadcrumbItem>
 *     </BreadcrumbList>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link BreadcrumbItem}
 */
function BreadcrumbEllipsis(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  const t = useUiStrings();
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      class={cn("flex size-9 items-center justify-center", local.class)}
      {...rest}
    >
      <EllipsisIcon class="size-4" aria-hidden="true" />
      <span class="sr-only">{t("breadcrumb.more", "More")}</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
