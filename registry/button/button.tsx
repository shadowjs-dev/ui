import { splitProps } from "@shadow-js/core";
import { Polymorphic, type PolymorphicProps, type PolymorphicTarget } from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * The class list of a button for each `variant` and `size`. Use it to style a link or any other
 * element like a button.
 *
 * @example
 * ```tsx
 * import { buttonVariants } from "@/components/ui/button";
 *
 * export function DocsLink() {
 *   return (
 *     <a class={buttonVariants({ variant: "outline", size: "sm" })} href="/docs">
 *       Docs
 *     </a>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Button}
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 forced-colors:disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** The props as the implementation sees them: the typed own props plus whatever the target takes. */
type Loose = VariantProps<typeof buttonVariants> & {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link Button}: every attribute of the chosen element plus `variant` and `size`. The
 * `variant` is `"default"` (the default), `"destructive"`, `"outline"`, `"secondary"`, `"ghost"` or
 * `"link"`. The `size` is `"default"` (the default), `"xs"`, `"sm"`, `"lg"`, `"icon"`, `"icon-xs"`,
 * `"icon-sm"` or `"icon-lg"`. The `as` prop picks the element (a `button` by default).
 * @since 1.0.0
 * @see {@link Button}
 */
export type ButtonProps<T extends PolymorphicTarget = "button"> = PolymorphicProps<
  "button",
  VariantProps<typeof buttonVariants>,
  T
>;

/**
 * A button. Pick the look with `variant` and the height with `size`. Use `as` to render another
 * element, for example a link: `<Button as="a" href="/docs">Docs</Button>`.
 *
 * Keyboard and ARIA: the default element is a native `button`, so Enter and Space activate it and
 * it takes focus with Tab. `disabled` is forwarded to the element, which then ignores clicks. The
 * button's accessible name is its text, so an icon-only button (`size="icon"`) needs an
 * `aria-label`. The component adds no ARIA attributes of its own.
 *
 * Compared with shadcn/ui: `as` replaces `asChild`, `class` replaces `className`, and the element
 * carries `data-slot="button"`. The props are typed from `@shadow-js/primitives`.
 *
 * @param props - The button props: `variant`, `size`, `as`, `children`, and the attributes of the
 * element (for example `onClick` and `disabled`).
 * @returns The button element.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 *
 * export function SaveButton() {
 *   const save = (): void => {
 *     console.log("saved");
 *   };
 *   return (
 *     <Button variant="outline" size="sm" onClick={save}>
 *       Save
 *     </Button>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ButtonProps}
 * @see {@link buttonVariants}
 */
function Button<T extends PolymorphicTarget = "button">(props: ButtonProps<T>): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class", "variant", "size"]);
  return (
    <Polymorphic
      as={local.as ?? "button"}
      data-slot="button"
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...rest}
    />
  );
}

export { Button, buttonVariants };
