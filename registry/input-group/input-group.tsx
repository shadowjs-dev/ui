import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const addonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)]",
  {
    variants: {
      align: {
        "inline-start": "order-first ps-3 has-[>button]:ms-[-0.45rem] has-[>kbd]:ms-[-0.35rem]",
        "inline-end": "order-last pe-3 has-[>button]:me-[-0.4rem] has-[>kbd]:me-[-0.35rem]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5",
      },
    },
    defaultVariants: { align: "inline-start" },
  },
);

/**
 * A text control with addons (text, icons, buttons) on its sides. The group draws the border, the
 * radius and the focus ring, so the control inside it is borderless. Use it in place of a bare
 * {@link InputGroupInput}, which has no frame of its own.
 *
 * Keyboard and ARIA: the group is a `role="group"` with no keys of its own; the control and the
 * buttons keep theirs. Name the group with `aria-label` or `aria-labelledby` when it needs a name
 * of its own; the control inside still needs one. An `aria-invalid="true"` on the control turns the
 * group's border destructive.
 *
 * @param props The `div` attributes. `class` adds to the group's classes.
 * @returns The group `div` with the addons and the control inside.
 * @example
 * import {
 *   InputGroup,
 *   InputGroupAddon,
 *   InputGroupInput,
 *   InputGroupText,
 * } from "@/components/ui/input-group";
 *
 * <InputGroup>
 *   <InputGroupAddon>
 *     <InputGroupText>https://</InputGroupText>
 *   </InputGroupAddon>
 *   <InputGroupInput placeholder="example.com" aria-label="Website" />
 * </InputGroup>
 * @since 1.0.0
 * @see {@link InputGroupAddon}
 */
function InputGroup(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      role="group"
      data-slot="input-group"
      class={cn(
        "group/input-group relative flex h-9 w-full min-w-0 items-center rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        "has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20 dark:has-[[aria-invalid=true]]:ring-destructive/40",
        "has-[textarea]:h-auto has-[[data-slot=input-group-control]:disabled]:opacity-50",
        // A block addon sits above or below the control, so the parts stack in a column.
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Props of {@link InputGroupAddon}: the `div` attributes plus `align`.
 * @since 1.0.0
 * @see {@link InputGroupAddon}
 */
export type InputGroupAddonProps = ComponentProps<"div"> &
  VariantProps<typeof addonVariants> & {
    /**
     * The side the addon sits on. `inline-start` and `inline-end` are beside the control;
     * `block-start` and `block-end` are above and below it, and the group stacks into a column.
     * @default "inline-start"
     */
    readonly align?: "inline-start" | "inline-end" | "block-start" | "block-end" | undefined;
  };

/**
 * An addon on a side of the group: text, an icon or a button. A click on the addon outside its
 * buttons moves focus to the group's control, so the whole strip reads as part of the field. Your
 * own `onClick` runs first; the focus move is the default.
 *
 * Keyboard and ARIA: the addon has no keys and a `role="presentation"`. The buttons and text in it
 * keep their own behavior.
 *
 * @param props The addon's `div` attributes. `align` picks the side (see {@link InputGroupAddonProps});
 * `onClick` is called before the focus move.
 * @returns The addon `div`.
 * @example
 * import {
 *   InputGroup,
 *   InputGroupAddon,
 *   InputGroupButton,
 *   InputGroupInput,
 * } from "@/components/ui/input-group";
 *
 * <InputGroup>
 *   <InputGroupInput aria-label="Share link" value="https://example.com" readOnly />
 *   <InputGroupAddon align="inline-end">
 *     <InputGroupButton aria-label="Copy link">Copy</InputGroupButton>
 *   </InputGroupAddon>
 * </InputGroup>
 * @since 1.0.0
 * @see {@link InputGroup}
 */
function InputGroupAddon(props: InputGroupAddonProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "align", "onClick"]);
  // The application's own click handler runs first; the focus move is the default.
  const onClick = (event: MouseEvent): void => {
    (local.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
    const target = event.target;
    if (target instanceof Element && target.closest("button") !== null) return;
    const group = (event.currentTarget as HTMLElement).closest('[data-slot="input-group"]');
    group?.querySelector<HTMLElement>("input,textarea")?.focus();
  };
  return (
    <div
      role="presentation"
      data-slot="input-group-addon"
      data-align={local.align ?? "inline-start"}
      class={cn(addonVariants({ align: local.align }), local.class)}
      onClick={onClick}
      {...rest}
    />
  );
}

/**
 * The bare text control inside a group: no border, no ring, and it fills the free width. Use it
 * only inside an {@link InputGroup}.
 *
 * Keyboard and ARIA: a native `input` with the browser's keys. It has no name of its own: pass
 * `aria-label`, or a {@link Label} whose `htmlFor` points at its `id`. Its `data-slot` is
 * `input-group-control`, which the group's styles check.
 *
 * @param props The `input` attributes. `class` adds to the control's classes.
 * @returns The `input` element.
 * @example
 * import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
 *
 * <InputGroup>
 *   <InputGroupInput aria-label="Search" placeholder="Search" />
 * </InputGroup>
 * @since 1.0.0
 * @see {@link InputGroup}
 */
function InputGroupInput(props: ComponentProps<"input">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <input
      data-slot="input-group-control"
      class={cn(
        "flex h-9 w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-base shadow-none outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The bare multi-line control inside a group: no border, no ring, and it fills the free width.
 * Use it only inside an {@link InputGroup}.
 *
 * Keyboard and ARIA: a native `textarea` with the browser's keys. Name it with `aria-label`, or with
 * a {@link Label} whose `htmlFor` points at its `id`.
 *
 * @param props The `textarea` attributes. `class` adds to the control's classes.
 * @returns The `textarea` element.
 * @example
 * import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
 *
 * <InputGroup>
 *   <InputGroupTextarea aria-label="Message" placeholder="Write a message" />
 * </InputGroup>
 * @since 1.0.0
 * @see {@link InputGroup}
 */
function InputGroupTextarea(props: ComponentProps<"textarea">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <textarea
      data-slot="input-group-control"
      class={cn(
        "flex min-h-16 w-full flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-3 text-base shadow-none outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Text inside an addon: a unit, a protocol or a prefix.
 *
 * Keyboard and ARIA: a `span` with no role and no keys.
 *
 * @param props The `span` attributes. `class` adds to the classes.
 * @returns The `span` element.
 * @example
 * import { InputGroupText } from "@/components/ui/input-group";
 *
 * <InputGroupText>USD</InputGroupText>
 * @since 1.0.0
 * @see {@link InputGroupAddon}
 */
function InputGroupText(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      class={cn("flex items-center gap-2 text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

const inputGroupButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
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
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2",
        "icon-xs": "size-6 rounded-sm p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "xs",
    },
  },
);

/**
 * Props of {@link InputGroupButton}: the `button` attributes, plus `variant` and `size`.
 * @see {@link InputGroupButton}
 * @since 1.0.0
 */
export type InputGroupButtonProps = ComponentProps<"button"> &
  VariantProps<typeof inputGroupButtonVariants>;

/**
 * A small button inside an addon, styled to sit in the group. It is a `type="button"` button, so it
 * never submits a surrounding form unless you pass `type="submit"`.
 *
 * Keyboard and ARIA: a native button (Enter and Space press it). Its name is its text; a button with
 * only an icon needs an `aria-label`.
 *
 * shadcn/ui differences: the classes come from this file, not from the Button item, so the group does not
 * depend on the Button item's sizes. `variant` and `size` match shadcn's button sizes for groups: `xs`
 * (the default, 24 px tall), `sm` (32 px), `icon-xs` and `icon-sm` (square). `variant` takes the Button
 * item's variants, and defaults to `ghost`.
 *
 * @param props The `button` attributes, `variant` and `size`: see {@link InputGroupButtonProps}. `class`
 * adds to the classes.
 * @returns The `button` element.
 * @example
 * import { SearchIcon } from "@/components/ui/icons";
 * import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
 *
 * <InputGroup>
 *   <InputGroupInput aria-label="Search" />
 *   <InputGroupButton aria-label="Clear">Clear</InputGroupButton>
 *   <InputGroupButton size="icon-xs" variant="secondary" aria-label="Search">
 *     <SearchIcon />
 *   </InputGroupButton>
 * </InputGroup>
 * @default size "xs", variant "ghost"
 * @since 1.0.0
 * @see {@link InputGroupAddon}
 */
function InputGroupButton(props: InputGroupButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant", "size"]);
  return (
    <button
      type="button"
      data-slot="input-group-button"
      class={cn(
        inputGroupButtonVariants({ variant: local.variant, size: local.size }),
        local.class,
      )}
      {...rest}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
