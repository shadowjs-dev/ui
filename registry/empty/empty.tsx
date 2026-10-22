import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * A block for "nothing here yet" or "no results": an icon or illustration, a title, a description and
 * the next action. It is a dashed, centered box, and its parts are plain elements.
 *
 * Keyboard and ARIA: the block and its parts have no role and no keys. The title is a `div`, so it is
 * not a heading for assistive technology. To make it one, pass `role="heading"` and `aria-level`. The
 * description is a `p`, and its links are underlined.
 *
 * shadcn/ui differences: the prop is `class`, not `className`, and every part has a `data-slot`. The media part
 * is `empty-icon` (`data-slot="empty-icon"`), not `empty-media`.
 *
 * @param props The block props: the attributes of the rendered `div` and `class`.
 * @returns The empty state block.
 * @example
 * import { Button } from "@/components/ui/button";
 * import {
 *   Empty,
 *   EmptyContent,
 *   EmptyDescription,
 *   EmptyHeader,
 *   EmptyMedia,
 *   EmptyTitle,
 * } from "@/components/ui/empty";
 * import { SearchIcon } from "@/components/ui/icons";
 *
 * export function NoResults() {
 *   return (
 *     <Empty>
 *       <EmptyHeader>
 *         <EmptyMedia variant="icon">
 *           <SearchIcon />
 *         </EmptyMedia>
 *         <EmptyTitle>No results</EmptyTitle>
 *         <EmptyDescription>Try a different search.</EmptyDescription>
 *       </EmptyHeader>
 *       <EmptyContent>
 *         <Button>Clear filters</Button>
 *       </EmptyContent>
 *     </Empty>
 *   );
 * }
 * @see {@link EmptyHeader}
 * @see {@link EmptyContent}
 * @since 1.0.0
 */
function Empty(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="empty"
      class={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-dashed p-6 text-center text-balance md:p-12",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The top of an empty state, which holds the {@link EmptyMedia}, the {@link EmptyTitle} and the
 * {@link EmptyDescription}. It stacks them centered, with a maximum width. It is a plain `div`.
 *
 * @param props The header props: the attributes of the rendered `div` and `class`.
 * @returns The header.
 * @example
 * import { EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
 *
 * export function Heading() {
 *   return (
 *     <EmptyHeader>
 *       <EmptyTitle>Nothing here</EmptyTitle>
 *       <EmptyDescription>New items show up here.</EmptyDescription>
 *     </EmptyHeader>
 *   );
 * }
 * @see {@link Empty}
 * @since 1.0.0
 */
function EmptyHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="empty-header"
      class={cn("flex max-w-sm flex-col items-center gap-2 text-center", local.class)}
      {...rest}
    />
  );
}

const mediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-10 rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/**
 * Props of {@link EmptyMedia}: the attributes of the rendered `div` and `variant`, which is `default`
 * (the media is shown as it is) or `icon` (the media sits on a muted tile).
 * @see {@link EmptyMedia}
 * @since 1.0.0
 */
export type EmptyMediaProps = ComponentProps<"div"> & VariantProps<typeof mediaVariants>;

/**
 * The icon or picture of an empty state. With `variant="icon"` the child (an icon, sized to 1.5rem by
 * default) sits on a muted, rounded tile. The part is `data-slot="empty-icon"`.
 *
 * @param props The media props: see {@link EmptyMediaProps}.
 * @returns The media.
 * @example
 * import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
 * import { SearchIcon } from "@/components/ui/icons";
 *
 * export function Searching() {
 *   return (
 *     <Empty>
 *       <EmptyHeader>
 *         <EmptyMedia variant="icon">
 *           <SearchIcon />
 *         </EmptyMedia>
 *         <EmptyTitle>No results</EmptyTitle>
 *       </EmptyHeader>
 *     </Empty>
 *   );
 * }
 * @see {@link EmptyHeader}
 * @since 1.0.0
 */
function EmptyMedia(props: EmptyMediaProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  return (
    <div
      data-slot="empty-icon"
      data-variant={local.variant ?? "default"}
      class={cn(mediaVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

/**
 * The title of an empty state. It is a `div` with no heading role; pass `role="heading"` and
 * `aria-level` to make it a heading for assistive technology.
 *
 * @param props The title props: the attributes of the rendered `div` and `class`.
 * @returns The title.
 * @example
 * import { EmptyTitle } from "@/components/ui/empty";
 *
 * export const Title = <EmptyTitle role="heading" aria-level={2}>No results</EmptyTitle>;
 * @see {@link EmptyHeader}
 * @since 1.0.0
 */
function EmptyTitle(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="empty-title"
      class={cn("text-lg font-medium tracking-tight", local.class)}
      {...rest}
    />
  );
}

/**
 * The explanation under an empty state's title. It is a `p`, and the links in it are underlined.
 *
 * @param props The description props: the attributes of the rendered `p` and `class`.
 * @returns The paragraph.
 * @example
 * import { EmptyDescription } from "@/components/ui/empty";
 *
 * export const Explanation = (
 *   <EmptyDescription>
 *     Try <a href="/reset">another search</a>.
 *   </EmptyDescription>
 * );
 * @see {@link EmptyHeader}
 * @since 1.0.0
 */
function EmptyDescription(props: ComponentProps<"p">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      data-slot="empty-description"
      class={cn(
        "text-sm/relaxed text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The actions of an empty state, such as the button that creates the first item. It is a centered
 * column below the header.
 *
 * @param props The content props: the attributes of the rendered `div` and `class`.
 * @returns The actions block.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { EmptyContent } from "@/components/ui/empty";
 *
 * export const Actions = (
 *   <EmptyContent>
 *     <Button>Create</Button>
 *   </EmptyContent>
 * );
 * @see {@link Empty}
 * @since 1.0.0
 */
function EmptyContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="empty-content"
      class={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle };
