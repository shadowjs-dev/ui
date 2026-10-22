import { splitProps } from "@shadow-js/core";
import { Polymorphic, type PolymorphicProps, type PolymorphicTarget } from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * The class list of a badge for each `variant`. Use it to style any element like a badge.
 *
 * @example
 * ```tsx
 * import { badgeVariants } from "@/components/ui/badge";
 *
 * export function NewLink() {
 *   return (
 *     <a class={badgeVariants({ variant: "outline" })} href="/new">
 *       New
 *     </a>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Badge}
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/** The props as the implementation sees them: the typed own props plus whatever the target takes. */
type Loose = VariantProps<typeof badgeVariants> & {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link Badge}: every attribute of the chosen element plus `variant`. The `variant` is
 * one of `"default"` (the default), `"secondary"`, `"destructive"` or `"outline"`. The `as` prop
 * picks the element (a `span` by default).
 * @since 1.0.0
 * @see {@link Badge}
 */
export type BadgeProps<T extends PolymorphicTarget = "span"> = PolymorphicProps<
  "span",
  VariantProps<typeof badgeVariants>,
  T
>;

/**
 * A small label for a status, count or category. It renders a `span` by default. Render a link
 * with `as`, for example `<Badge as="a" href="/new">New</Badge>`; links get a hover style.
 *
 * Keyboard and ARIA: a badge has no role and no keys. As a link it is focusable and followed with
 * the native link keys, and it shows a focus ring. Its text is the only label, so keep the text
 * meaningful on its own.
 *
 * Compared with shadcn/ui: `as` replaces `asChild`, `class` replaces `className`, and the element
 * carries `data-slot="badge"`.
 *
 * @param props - The badge props: `variant`, `as`, `children`, and the attributes of the element.
 * @returns The badge element.
 * @example
 * ```tsx
 * import { Badge } from "@/components/ui/badge";
 *
 * export function BetaLabel() {
 *   return (
 *     <div>
 *       <Badge variant="secondary">Beta</Badge>
 *       <Badge as="a" href="/new" variant="outline">New</Badge>
 *     </div>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link BadgeProps}
 * @see {@link badgeVariants}
 */
function Badge<T extends PolymorphicTarget = "span">(props: BadgeProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class", "variant"]);
  return (
    <Polymorphic
      as={local.as ?? "span"}
      data-slot="badge"
      class={cn(badgeVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

export { Badge, badgeVariants };
