import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  type PopoverAnchorProps,
  type PopoverCloseProps,
  type PopoverContentProps,
  type PopoverDescriptionProps,
  Popover as PopoverPrimitive,
  type PopoverProps,
  type PopoverTitleProps,
  type PopoverTriggerProps,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A non-modal dialog anchored to its trigger. Controlled with `open` and `onOpenChange`, or
 * uncontrolled with `defaultOpen`. Pass `modal` for the modal form, which traps focus inside the
 * popover and blocks the rest of the page.
 *
 * Keyboard and ARIA: follows the WAI-ARIA dialog pattern. Enter or Space on the trigger toggles it;
 * focus moves into the content when it opens; Escape closes it and returns focus to the trigger; a
 * press outside closes it. Tab moves through the content and then on to the next control after the
 * trigger. The content is a `dialog`; name it with a {@link PopoverTitle} or with `aria-label`.
 *
 * @param props The popover's options: `open`, `defaultOpen`, `onOpenChange` and `modal`.
 * @returns The popover's context around its children; it renders no element of its own.
 * @example
 * import { Button } from "@/components/ui/button";
 * import {
 *   Popover,
 *   PopoverContent,
 *   PopoverDescription,
 *   PopoverHeader,
 *   PopoverTitle,
 *   PopoverTrigger,
 * } from "@/components/ui/popover";
 *
 * <Popover>
 *   <PopoverTrigger as={Button} variant="outline">Dimensions</PopoverTrigger>
 *   <PopoverContent>
 *     <PopoverHeader>
 *       <PopoverTitle>Dimensions</PopoverTitle>
 *       <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
 *     </PopoverHeader>
 *   </PopoverContent>
 * </Popover>
 * @since 1.0.0
 * @see {@link PopoverTrigger}
 */
function Popover(props: PopoverProps): JSX.Element {
  return <PopoverPrimitive {...props} />;
}

/**
 * The button that toggles the popover. It is also the popover's anchor, unless a
 * {@link PopoverAnchor} is rendered.
 *
 * Keyboard and ARIA: a button with `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`
 * while the popover is open. Enter or Space toggles it. Its name is its text.
 *
 * shadcn/ui differences: `as` replaces `asChild`, as in `<PopoverTrigger as={Button}>`.
 *
 * @param props The button's attributes, plus `as` (the element to render in its place).
 * @returns The trigger element.
 * @throws Error when rendered outside a {@link Popover}.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 *
 * <Popover>
 *   <PopoverTrigger as={Button}>Open</PopoverTrigger>
 *   <PopoverContent aria-label="Hello">Hello</PopoverContent>
 * </Popover>
 * @since 1.0.0
 * @see {@link Popover}
 */
function PopoverTrigger<T extends PolymorphicTarget = "button">(
  props: PopoverTriggerProps<T>,
): JSX.Element {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * An element to anchor the popover to instead of the trigger, such as a toolbar that the popover
 * should open from while the trigger sits elsewhere.
 *
 * Keyboard and ARIA: no keys and no ARIA attributes; it only sets the position the popover uses.
 *
 * @param props The anchor's attributes, plus `as` (the element to render) and `virtualRef` (an
 * element that is not in the page, to anchor to instead).
 * @returns The anchor element, or nothing when `virtualRef` is given.
 * @throws Error when rendered outside a {@link Popover}.
 * @example
 * import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 *
 * <Popover>
 *   <PopoverAnchor class="toolbar">Toolbar</PopoverAnchor>
 *   <PopoverTrigger>Open</PopoverTrigger>
 *   <PopoverContent aria-label="Tools">Tool list</PopoverContent>
 * </Popover>
 * @since 1.0.0
 * @see {@link PopoverTrigger}
 */
function PopoverAnchor<T extends PolymorphicTarget = "div">(
  props: PopoverAnchorProps<T>,
): JSX.Element {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

/**
 * The popover panel, rendered into `document.body` and placed against the anchor. It defaults to
 * `align="center"` and `sideOffset={4}`.
 *
 * Keyboard and ARIA: `role="dialog"`. It is named by a {@link PopoverTitle} (`aria-labelledby`), or
 * by an `aria-label` you pass when there is no title; give it one or the other. It is described by a
 * {@link PopoverDescription} when one is rendered. Escape closes it, and so does a press outside it.
 *
 * @param props `align` (default `"center"`), `sideOffset` (default `4`) and `class`, which adds to
 * the panel's classes. The rest are the attributes of the panel.
 * @returns The panel, portaled into the page's body.
 * @throws Error when rendered outside a {@link Popover}.
 * @example
 * import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 *
 * <Popover>
 *   <PopoverTrigger>Details</PopoverTrigger>
 *   <PopoverContent align="start" class="w-80" aria-label="Details">
 *     Details of the order.
 *   </PopoverContent>
 * </Popover>
 * @since 1.0.0
 * @see {@link PopoverTitle}
 */
function PopoverContent(props: PopoverContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "align", "sideOffset"]);
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={local.align ?? "center"}
        sideOffset={local.sideOffset ?? 4}
        class={cn(
          "z-50 w-72 origin-(--primitives-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          local.class,
        )}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
}

/**
 * A button that closes the popover. It is `type="button"`, so it never submits a form around it.
 *
 * Keyboard and ARIA: a native button; Enter or Space closes the popover. Its name is its text, so a
 * button with only an icon needs an `aria-label`.
 *
 * shadcn/ui differences: `as` replaces `asChild`.
 *
 * @param props The button's attributes, plus `as` (the element to render in its place).
 * @returns The close element.
 * @throws Error when rendered outside a {@link Popover}.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 *
 * <Popover>
 *   <PopoverTrigger>Note</PopoverTrigger>
 *   <PopoverContent aria-label="Note">
 *     <PopoverClose as={Button} variant="ghost">Done</PopoverClose>
 *   </PopoverContent>
 * </Popover>
 * @since 1.0.0
 * @see {@link Popover}
 */
function PopoverClose<T extends PolymorphicTarget = "button">(
  props: PopoverCloseProps<T>,
): JSX.Element {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

/**
 * The layout of the title and the description at the top of the popover: a `div` in a column.
 *
 * Keyboard and ARIA: no keys and no role of its own.
 *
 * @param props The `div` attributes. `class` adds to the classes.
 * @returns The header `div`.
 * @example
 * import { PopoverDescription, PopoverHeader, PopoverTitle } from "@/components/ui/popover";
 *
 * <PopoverHeader>
 *   <PopoverTitle>Title</PopoverTitle>
 *   <PopoverDescription>Description</PopoverDescription>
 * </PopoverHeader>
 * @since 1.0.0
 * @see {@link PopoverTitle}
 */
function PopoverHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="popover-header"
      class={cn("flex flex-col gap-1 text-sm", local.class)}
      {...rest}
    />
  );
}

/**
 * The title of the popover: an `h2` that names the dialog. Render it inside the content, and the
 * dialog's `aria-labelledby` points at it while it is rendered.
 *
 * Keyboard and ARIA: no keys of its own; it provides the dialog's accessible name.
 *
 * @param props The `h2` attributes. `class` adds to the classes.
 * @returns The title `h2`.
 * @throws Error when rendered outside a {@link Popover}.
 * @example
 * import { PopoverContent, PopoverTitle, PopoverTrigger, Popover } from "@/components/ui/popover";
 *
 * <Popover>
 *   <PopoverTrigger>Dimensions</PopoverTrigger>
 *   <PopoverContent>
 *     <PopoverTitle>Dimensions</PopoverTitle>
 *   </PopoverContent>
 * </Popover>
 * @since 1.0.0
 * @see {@link PopoverContent}
 */
function PopoverTitle(props: PopoverTitleProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      class={cn("font-medium", local.class)}
      {...rest}
    />
  );
}

/**
 * The description of the popover: a `p` that describes the dialog. The dialog's `aria-describedby`
 * points at it while it is rendered.
 *
 * Keyboard and ARIA: no keys of its own; it provides the dialog's accessible description.
 *
 * @param props The `p` attributes. `class` adds to the classes.
 * @returns The description `p`.
 * @throws Error when rendered outside a {@link Popover}.
 * @example
 * import { Popover, PopoverContent, PopoverDescription, PopoverTrigger } from "@/components/ui/popover";
 *
 * <Popover>
 *   <PopoverTrigger>Dimensions</PopoverTrigger>
 *   <PopoverContent aria-label="Dimensions">
 *     <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
 *   </PopoverContent>
 * </Popover>
 * @since 1.0.0
 * @see {@link PopoverTitle}
 */
function PopoverDescription(props: PopoverDescriptionProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      class={cn("text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
