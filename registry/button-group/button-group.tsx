import { splitProps } from "@shadow-js/core";
import { Polymorphic, type PolymorphicProps, type PolymorphicTarget } from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, cn } from "@/lib/utils";

const groupVariants = cva(
  "flex w-fit items-stretch [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-s-none [&>*:not(:first-child)]:border-s-0 [&>*:not(:last-child)]:rounded-e-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

/**
 * Props of {@link ButtonGroup}: the attributes of a `div` plus `orientation`. The `orientation` is
 * `"horizontal"` (the default) or `"vertical"`.
 * @since 1.0.0
 * @see {@link ButtonGroup}
 */
export type ButtonGroupProps = ComponentProps<"div"> & VariantProps<typeof groupVariants>;

/**
 * Buttons (or inputs) that sit together as one control: the inner corners are square and the
 * borders meet. Horizontal by default; `orientation="vertical"` stacks them.
 *
 * Keyboard and ARIA: the group is a `div` with `role="group"`. It adds no keys, so each button
 * keeps its own keys (Tab moves between them). Give the group an `aria-label` that names the
 * controls, because a group without a name is announced without one. A focused child is raised
 * above its neighbors so its focus ring shows.
 *
 * Compared with shadcn/ui: `class` replaces `className`, and the element carries
 * `data-slot="button-group"`.
 *
 * @param props - The group props: `orientation`, `children`, and the `div` attributes.
 * @returns The group element.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { ButtonGroup } from "@/components/ui/button-group";
 *
 * export function Alignment() {
 *   return (
 *     <ButtonGroup aria-label="Text alignment">
 *       <Button variant="outline">Left</Button>
 *       <Button variant="outline">Center</Button>
 *       <Button variant="outline">Right</Button>
 *     </ButtonGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ButtonGroupProps}
 * @see {@link ButtonGroupSeparator}
 * @see {@link ButtonGroupText}
 */
function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "orientation"]);
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={local.orientation ?? "horizontal"}
      class={cn(groupVariants({ orientation: local.orientation }), local.class)}
      {...rest}
    />
  );
}

/**
 * A divider between two buttons of a group. It is a vertical separator by default, so assistive
 * technology announces it as a separator; `orientation="horizontal"` draws a line between the
 * buttons of a vertical group.
 *
 * Keyboard and ARIA: it has `role="separator"`, `aria-orientation` set to its orientation, and no
 * keys.
 *
 * @param props - The separator props: `orientation` (`"vertical"` by default) and the `div`
 * attributes.
 * @returns The separator element.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
 *
 * export function Split() {
 *   return (
 *     <ButtonGroup aria-label="Save options">
 *       <Button variant="outline">Save</Button>
 *       <ButtonGroupSeparator />
 *       <Button variant="outline">More</Button>
 *     </ButtonGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ButtonGroup}
 */
function ButtonGroupSeparator(
  props: ComponentProps<"div"> & { readonly orientation?: "horizontal" | "vertical" | undefined },
): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "orientation"]);
  const orientation = (): "horizontal" | "vertical" => local.orientation ?? "vertical";
  return (
    <div
      role="separator"
      aria-orientation={orientation()}
      data-orientation={orientation()}
      data-slot="button-group-separator"
      class={cn(
        "relative !m-0 bg-input",
        orientation() === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Props of {@link ButtonGroupText}: the attributes of the rendered element, and `as` to change it.
 * @since 1.0.0
 * @see {@link ButtonGroupText}
 */
export type ButtonGroupTextProps<T extends PolymorphicTarget = "div"> = PolymorphicProps<
  "div",
  object,
  T
>;

/** The props as the implementation sees them: the typed own props plus whatever the target takes. */
type TextLoose = {
  /** The element to render instead of a `div`. */
  readonly as?: PolymorphicTarget;
  /** Classes added to the text's own classes (merged with tailwind-merge). */
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Text inside a group, styled like a button without being one. Use it for a label such as "Sort
 * by" next to the buttons. It has no role and no keys. `as` renders another element (a link or a
 * label), where shadcn uses `render`.
 *
 * @param props - The text props: `as` (`"div"` by default), `children`, and the attributes of the
 * rendered element.
 * @returns The text element.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
 *
 * export function SortControl() {
 *   return (
 *     <ButtonGroup aria-label="Sort">
 *       <ButtonGroupText>Sort by</ButtonGroupText>
 *       <Button variant="outline">Date</Button>
 *     </ButtonGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link ButtonGroup}
 */
function ButtonGroupText<T extends PolymorphicTarget = "div">(
  props: ButtonGroupTextProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as TextLoose, ["as", "class"]);
  return (
    <Polymorphic
      as={local.as ?? "div"}
      data-slot="button-group-text"
      class={cn(
        "flex items-center gap-2 rounded-md border bg-muted px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        local.class,
      )}
      {...rest}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
