import { splitProps } from "@shadow-js/core";
import {
  type AlertDialogActionProps,
  type AlertDialogCancelProps,
  type AlertDialogContentProps,
  AlertDialog as AlertDialogPrimitive,
  type AlertDialogProps,
  type DialogDescriptionProps,
  type DialogOverlayProps,
  type DialogPortalProps,
  type DialogTitleProps,
  type DialogTriggerProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { buttonVariants } from "@/components/ui/button";
import { type ClassValue, cn } from "@/lib/utils";

/** The props as the implementation sees them: the typed own props plus whatever the target takes. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * A modal dialog that interrupts the user with a message that needs a response, such as a
 * confirmation before a delete. Pressing outside never dismisses it. Focus starts on
 * {@link AlertDialogCancel}, and Escape closes it. Control it with `open` and `onOpenChange`, or
 * start uncontrolled with `defaultOpen`.
 *
 * Keyboard and ARIA: Enter and Space activate the trigger. Tab and Shift+Tab move between the
 * buttons inside the dialog and do not leave it while it is open. Escape closes it and returns focus
 * to the trigger. The content has `role="alertdialog"` and `aria-modal="true"`. It is named by the
 * {@link AlertDialogTitle} and described by the {@link AlertDialogDescription}. The trigger has
 * `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`.
 *
 * Compared with shadcn/ui: `as` replaces `asChild` on {@link AlertDialogTrigger}, `class` replaces
 * `className`, and every part carries `data-slot`.
 *
 * @param props - The root props: `open`, `onOpenChange`, `defaultOpen` and the children.
 * @returns The alert dialog root.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import {
 *   AlertDialog,
 *   AlertDialogAction,
 *   AlertDialogCancel,
 *   AlertDialogContent,
 *   AlertDialogDescription,
 *   AlertDialogFooter,
 *   AlertDialogHeader,
 *   AlertDialogTitle,
 *   AlertDialogTrigger,
 * } from "@/components/ui/alert-dialog";
 *
 * export function DeleteAccount() {
 *   const deleteAccount = (): void => {
 *     console.log("account deleted");
 *   };
 *   return (
 *     <AlertDialog>
 *       <AlertDialogTrigger as={Button} variant="outline">
 *         Delete account
 *       </AlertDialogTrigger>
 *       <AlertDialogContent>
 *         <AlertDialogHeader>
 *           <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
 *           <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
 *         </AlertDialogHeader>
 *         <AlertDialogFooter>
 *           <AlertDialogCancel>Cancel</AlertDialogCancel>
 *           <AlertDialogAction onClick={deleteAccount}>Continue</AlertDialogAction>
 *         </AlertDialogFooter>
 *       </AlertDialogContent>
 *     </AlertDialog>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogTrigger}
 * @see {@link AlertDialogContent}
 * @see {@link AlertDialogCancel}
 * @see {@link AlertDialogAction}
 */
function AlertDialog(props: AlertDialogProps): JSX.Element {
  return <AlertDialogPrimitive {...props} />;
}

/**
 * The button that opens the alert dialog. It renders a native `button` by default. Use `as` to
 * render your own button component, such as {@link Button}.
 *
 * Keyboard and ARIA: Enter and Space activate it. It carries `aria-haspopup="dialog"`,
 * `aria-expanded` and `aria-controls`, which name the open dialog. Give it visible text, because
 * that text is its accessible name.
 *
 * @param props - The trigger props: `as`, `children`, and the attributes of the element.
 * @returns The trigger element.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import {
 *   AlertDialog,
 *   AlertDialogContent,
 *   AlertDialogTrigger,
 * } from "@/components/ui/alert-dialog";
 *
 * export function OpenDialog() {
 *   return (
 *     <AlertDialog>
 *       <AlertDialogTrigger as={Button} variant="destructive">
 *         Delete
 *       </AlertDialogTrigger>
 *       <AlertDialogContent>Are you sure?</AlertDialogContent>
 *     </AlertDialog>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialog}
 */
function AlertDialogTrigger<T extends PolymorphicTarget = "button">(
  props: DialogTriggerProps<T>,
): JSX.Element {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

/**
 * Renders its children into `document.body` while the alert dialog is open, so the dialog sits
 * above the page. It is server-rendered while open, and it keeps the content mounted until its exit
 * animation ends.
 *
 * @param props - The portal props: `container` (default `document.body`) and the children.
 * @returns The portal, or nothing while the dialog is closed.
 * @example
 * ```tsx
 * import { AlertDialogOverlay, AlertDialogPortal } from "@/components/ui/alert-dialog";
 *
 * export function Layer() {
 *   return (
 *     <AlertDialogPortal>
 *       <AlertDialogOverlay />
 *     </AlertDialogPortal>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogContent}
 */
function AlertDialogPortal(props: DialogPortalProps): JSX.Element {
  return <AlertDialogPrimitive.Portal {...props} />;
}

/**
 * The dimmed backdrop behind the alert dialog. {@link AlertDialogContent} renders it for you. A
 * click on it does not dismiss the alert dialog.
 *
 * @param props - The overlay props: `class` and the `div` attributes.
 * @returns The overlay element.
 * @example
 * ```tsx
 * import { AlertDialogOverlay } from "@/components/ui/alert-dialog";
 *
 * export function DarkBackdrop() {
 *   return <AlertDialogOverlay class="bg-black/70" />;
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogContent}
 */
function AlertDialogOverlay(props: DialogOverlayProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      class={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The alert dialog panel. It renders the portal and the overlay itself, then the centered panel
 * with `role="alertdialog"`. Put the {@link AlertDialogHeader}, the {@link AlertDialogFooter} and
 * your body text inside it.
 *
 * Keyboard and ARIA: focus starts on {@link AlertDialogCancel}. Escape closes the dialog, and a
 * press outside does not. The panel has `role="alertdialog"` and `aria-modal="true"`, and it is
 * named by the title and described by the description.
 *
 * @param props - The content props: `class`, `children`, and the attributes of the panel.
 * @returns The portal with the overlay and the panel.
 * @example
 * ```tsx
 * import {
 *   AlertDialog,
 *   AlertDialogCancel,
 *   AlertDialogContent,
 *   AlertDialogFooter,
 *   AlertDialogHeader,
 *   AlertDialogTitle,
 *   AlertDialogTrigger,
 * } from "@/components/ui/alert-dialog";
 *
 * export function Confirm() {
 *   return (
 *     <AlertDialog>
 *       <AlertDialogTrigger>Leave</AlertDialogTrigger>
 *       <AlertDialogContent>
 *         <AlertDialogHeader>
 *           <AlertDialogTitle>Discard changes?</AlertDialogTitle>
 *         </AlertDialogHeader>
 *         <AlertDialogFooter>
 *           <AlertDialogCancel>Keep editing</AlertDialogCancel>
 *         </AlertDialogFooter>
 *       </AlertDialogContent>
 *     </AlertDialog>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialog}
 * @see {@link AlertDialogOverlay}
 */
function AlertDialogContent(
  props: AlertDialogContentProps & { readonly size?: "default" | "sm" | undefined },
): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "size"]);
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={local.size ?? "default"}
        class={cn(
          "fixed start-1/2 top-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg data-[size=sm]:max-w-xs rtl:translate-x-1/2",
          local.class,
        )}
        {...rest}
      />
    </AlertDialogPortal>
  );
}

/**
 * An icon or picture at the top of an alert dialog, on a muted tile. Put it first in the
 * {@link AlertDialogHeader}.
 *
 * Keyboard and ARIA: it is decorative and has no role; name the dialog with its title.
 *
 * @param props - The media props: `children` and the `div` attributes.
 * @returns The media element.
 * @example
 * ```tsx
 * import { AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
 * import { TriangleAlertIcon } from "@/components/ui/icons";
 *
 * export function Header() {
 *   return (
 *     <AlertDialogHeader>
 *       <AlertDialogMedia>
 *         <TriangleAlertIcon />
 *       </AlertDialogMedia>
 *       <AlertDialogTitle>Delete?</AlertDialogTitle>
 *     </AlertDialogHeader>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogContent}
 */
function AlertDialogMedia(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="alert-dialog-media"
      class={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted [&_svg:not([class*='size-'])]:size-6",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * The layout of the title and description at the top of the alert dialog. Text is centered on
 * small screens and aligned to the start from the `sm` breakpoint.
 *
 * @param props - The header props: `class` and the `div` attributes.
 * @returns The header element.
 * @example
 * ```tsx
 * import {
 *   AlertDialogDescription,
 *   AlertDialogHeader,
 *   AlertDialogTitle,
 * } from "@/components/ui/alert-dialog";
 *
 * export function Heading() {
 *   return (
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
 *       <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
 *     </AlertDialogHeader>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogContent}
 */
function AlertDialogHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="alert-dialog-header"
      class={cn("flex flex-col gap-2 text-center sm:text-start", local.class)}
      {...rest}
    />
  );
}

/**
 * The layout of the cancel and action buttons at the bottom of the alert dialog. The buttons stack
 * on small screens and sit in a row, aligned to the end, from the `sm` breakpoint.
 *
 * @param props - The footer props: `class` and the `div` attributes.
 * @returns The footer element.
 * @example
 * ```tsx
 * import {
 *   AlertDialogAction,
 *   AlertDialogCancel,
 *   AlertDialogFooter,
 * } from "@/components/ui/alert-dialog";
 *
 * export function Buttons() {
 *   return (
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction>Continue</AlertDialogAction>
 *     </AlertDialogFooter>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogContent}
 */
function AlertDialogFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="alert-dialog-footer"
      class={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", local.class)}
      {...rest}
    />
  );
}

/**
 * The title of the alert dialog. It renders an `h2`, and the dialog is named by it.
 *
 * Keyboard and ARIA: no keys. The dialog's `aria-labelledby` points at this heading, so the
 * screen reader announces the dialog by this text.
 *
 * @param props - The title props: `class`, `children`, and the `h2` attributes.
 * @returns The title element.
 * @example
 * ```tsx
 * import { AlertDialogTitle } from "@/components/ui/alert-dialog";
 *
 * export function Title() {
 *   return <AlertDialogTitle>Are you sure?</AlertDialogTitle>;
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogDescription}
 */
function AlertDialogTitle(props: DialogTitleProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      class={cn("text-lg font-semibold", local.class)}
      {...rest}
    />
  );
}

/**
 * The description of the alert dialog. It renders a `p`, and the dialog is described by it.
 *
 * Keyboard and ARIA: no keys. The dialog's `aria-describedby` points at this paragraph.
 *
 * @param props - The description props: `class`, `children`, and the `p` attributes.
 * @returns The description element.
 * @example
 * ```tsx
 * import { AlertDialogDescription } from "@/components/ui/alert-dialog";
 *
 * export function Description() {
 *   return <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>;
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogTitle}
 */
function AlertDialogDescription(props: DialogDescriptionProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      class={cn("text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * The confirming action. It is styled like a default button. Pressing it closes the dialog, so run
 * the action itself from `onClick`.
 *
 * Keyboard and ARIA: a native button. Enter and Space activate it.
 *
 * @param props - The action props: `onClick`, `children`, and the attributes of the button.
 * @returns The action element.
 * @example
 * ```tsx
 * import {
 *   AlertDialog,
 *   AlertDialogAction,
 *   AlertDialogContent,
 *   AlertDialogTrigger,
 * } from "@/components/ui/alert-dialog";
 *
 * export function Remove() {
 *   const remove = (): void => {
 *     console.log("removed");
 *   };
 *   return (
 *     <AlertDialog>
 *       <AlertDialogTrigger>Remove</AlertDialogTrigger>
 *       <AlertDialogContent>
 *         <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
 *       </AlertDialogContent>
 *     </AlertDialog>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogCancel}
 */
function AlertDialogAction<T extends PolymorphicTarget = "button">(
  props: AlertDialogActionProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      class={cn(buttonVariants(), local.class)}
      {...rest}
    />
  );
}

/**
 * Closes the dialog without taking the action. It is styled like an outline button, and it receives
 * the initial focus, so Enter does not confirm a destructive action by accident.
 *
 * Keyboard and ARIA: a native button. Enter and Space activate it.
 *
 * @param props - The cancel props: `children`, `class`, and the attributes of the button.
 * @returns The cancel element.
 * @example
 * ```tsx
 * import {
 *   AlertDialog,
 *   AlertDialogCancel,
 *   AlertDialogContent,
 *   AlertDialogTrigger,
 * } from "@/components/ui/alert-dialog";
 *
 * export function KeepAccount() {
 *   return (
 *     <AlertDialog>
 *       <AlertDialogTrigger>Delete</AlertDialogTrigger>
 *       <AlertDialogContent>
 *         <AlertDialogCancel>Keep my account</AlertDialogCancel>
 *       </AlertDialogContent>
 *     </AlertDialog>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertDialogAction}
 */
function AlertDialogCancel<T extends PolymorphicTarget = "button">(
  props: AlertDialogCancelProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      class={cn(buttonVariants({ variant: "outline" }), local.class)}
      {...rest}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
