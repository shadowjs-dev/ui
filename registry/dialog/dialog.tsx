import { splitProps } from "@shadow-js/core";
import {
  type DialogCloseProps,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogOverlayProps,
  type DialogPortalProps,
  Dialog as DialogPrimitive,
  type DialogProps,
  type DialogTitleProps,
  type DialogTriggerProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { XIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * A modal window over the page, for a task that needs an answer or an edit before the page continues.
 * It is controlled with `open` and `onOpenChange`, or uncontrolled with `defaultOpen`. Its parts are
 * {@link DialogTrigger}, {@link DialogContent} (with the overlay and the close button) and the header,
 * title and description inside it.
 *
 * Keyboard and ARIA: Enter or Space on the trigger opens the dialog, which moves focus into it. Tab and
 * Shift+Tab cycle inside it, and Escape closes it. Closing returns focus to the trigger. The content is
 * a `role="dialog"` with `aria-modal="true"`, named by {@link DialogTitle} and described by
 * {@link DialogDescription}, so render both. Without a title, pass `aria-label` on the content. The
 * close button is a native button named "Close". A press on the overlay closes the dialog. In
 * development, a dialog with no name logs a warning.
 *
 * shadcn/ui differences: `as` replaces `asChild` on {@link DialogTrigger} and {@link DialogClose}, and
 * the prop is `class`, not `className`. Every part has a `data-slot`. The close button is part of
 * {@link DialogContent} by default; pass `showCloseButton={false}` to remove it.
 *
 * @param props The dialog props: see {@link DialogProps}.
 * @returns The dialog. It renders no element of its own.
 * @example
 * import { Button } from "@/components/ui/button";
 * import {
 *   Dialog,
 *   DialogContent,
 *   DialogDescription,
 *   DialogHeader,
 *   DialogTitle,
 *   DialogTrigger,
 * } from "@/components/ui/dialog";
 *
 * export function EditProfile() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger as={Button} variant="outline">
 *         Edit profile
 *       </DialogTrigger>
 *       <DialogContent>
 *         <DialogHeader>
 *           <DialogTitle>Edit profile</DialogTitle>
 *           <DialogDescription>Make changes to your profile here.</DialogDescription>
 *         </DialogHeader>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * @see {@link DialogContent}
 * @see {@link DialogTrigger}
 * @since 1.0.0
 */
function Dialog(props: DialogProps): JSX.Element {
  return <DialogPrimitive {...props} />;
}

/**
 * The button that opens the dialog. It is a native button by default; `as` renders another element,
 * such as the shadcn `Button`. Enter and Space activate it.
 *
 * @param props The trigger props: the attributes of the rendered element, and `as`.
 * @returns The trigger.
 * @throws Error when rendered outside a {@link Dialog}.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
 *
 * export function OpenDialog() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger as={Button}>Open</DialogTrigger>
 *       <DialogContent>Dialog body.</DialogContent>
 *     </Dialog>
 *   );
 * }
 * @see {@link Dialog}
 * @since 1.0.0
 */
function DialogTrigger<T extends PolymorphicTarget = "button">(
  props: DialogTriggerProps<T>,
): JSX.Element {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Renders the overlay and the content into `document.body`, or into the `container` you pass, while
 * the dialog is open. {@link DialogContent} already portals itself, so use this only to choose another
 * container.
 *
 * @param props The portal props: `container` and `forceMount`.
 * @returns The portal, or nothing while the dialog is closed.
 * @throws Error when rendered outside a {@link Dialog}.
 * @example
 * import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTrigger } from "@/components/ui/dialog";
 *
 * export function Portaled() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger>Open</DialogTrigger>
 *       <DialogPortal>
 *         <DialogOverlay />
 *         <DialogContent>Dialog body.</DialogContent>
 *       </DialogPortal>
 *     </Dialog>
 *   );
 * }
 * @see {@link DialogContent}
 * @since 1.0.0
 */
function DialogPortal(props: DialogPortalProps): JSX.Element {
  return <DialogPrimitive.Portal {...props} />;
}

/**
 * A button that closes the dialog. It is a native button by default; `as` renders another element. Enter
 * and Space activate it.
 *
 * @param props The close props: the attributes of the rendered element, and `as`.
 * @returns The close button.
 * @throws Error when rendered outside a {@link Dialog}.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
 *
 * export function Confirm() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger>Delete</DialogTrigger>
 *       <DialogContent>
 *         <DialogFooter>
 *           <DialogClose as={Button} variant="outline">
 *             Cancel
 *           </DialogClose>
 *         </DialogFooter>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * @see {@link Dialog}
 * @since 1.0.0
 */
function DialogClose<T extends PolymorphicTarget = "button">(
  props: DialogCloseProps<T>,
): JSX.Element {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * The dimmed backdrop behind a modal dialog. It is hidden from assistive technology, and a press on it
 * closes the dialog. {@link DialogContent} renders one already.
 *
 * @param props The overlay props: `class`, which is merged with the backdrop classes.
 * @returns The overlay.
 * @throws Error when rendered outside a {@link Dialog}.
 * @example
 * import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTrigger } from "@/components/ui/dialog";
 *
 * export function Dimmed() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger>Open</DialogTrigger>
 *       <DialogPortal>
 *         <DialogOverlay class="bg-black/70" />
 *         <DialogContent>Dialog body.</DialogContent>
 *       </DialogPortal>
 *     </Dialog>
 *   );
 * }
 * @see {@link DialogContent}
 * @since 1.0.0
 */
function DialogOverlay(props: DialogOverlayProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      class={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Own props of {@link DialogContent}: the parts the panel adds.
 * @see {@link DialogContent}
 * @since 1.0.0
 */
export interface DialogContentExtraProps {
  /**
   * Shows the close button in the top-right corner. The button is named "Close".
   * @default true
   */
  readonly showCloseButton?: boolean | undefined;
}

/**
 * The dialog panel: it renders the portal and the overlay, and the centered content with a close
 * button in the corner unless `showCloseButton` is `false`. Put the {@link DialogHeader} (with
 * {@link DialogTitle} and {@link DialogDescription}) and your content inside it.
 *
 * @param props The panel props: see {@link DialogContentProps} and {@link DialogContentExtraProps}.
 * @returns The panel, rendered in a portal while the dialog is open.
 * @throws Error when rendered outside a {@link Dialog}.
 * @example
 * import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 *
 * export function Notice() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger>Show notice</DialogTrigger>
 *       <DialogContent showCloseButton={false}>
 *         <DialogHeader>
 *           <DialogTitle>Saved</DialogTitle>
 *           <DialogDescription>Your changes are saved.</DialogDescription>
 *         </DialogHeader>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * @see {@link Dialog}
 * @see {@link DialogHeader}
 * @since 1.0.0
 */
function DialogContent(props: DialogContentProps & DialogContentExtraProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children", "showCloseButton"]);
  const t = useUiStrings();
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        class={cn(
          "fixed start-1/2 top-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg rtl:translate-x-1/2",
          local.class,
        )}
        {...rest}
      >
        {local.children}
        {local.showCloseButton !== false && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            class="absolute end-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 outline-none focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-transparent disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span class="sr-only">{t("dialog.close", "Close")}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * The layout of the title and description at the top of a dialog. It is a plain `div` with no role.
 *
 * @param props The header props: the attributes of the rendered `div`.
 * @returns The header.
 * @example
 * import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 *
 * export function Heading() {
 *   return (
 *     <DialogHeader>
 *       <DialogTitle>Edit profile</DialogTitle>
 *       <DialogDescription>Make changes here.</DialogDescription>
 *     </DialogHeader>
 *   );
 * }
 * @see {@link DialogTitle}
 * @since 1.0.0
 */
function DialogHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="dialog-header"
      class={cn("flex flex-col gap-2 text-center sm:text-start", local.class)}
      {...rest}
    />
  );
}

/**
 * The layout of the action buttons at the bottom of a dialog: stacked on small screens, and aligned to
 * the end on larger ones. It is a plain `div` with no role.
 *
 * @param props The footer props: the attributes of the rendered `div`.
 * @returns The footer.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { DialogFooter } from "@/components/ui/dialog";
 *
 * export function Actions() {
 *   return (
 *     <DialogFooter>
 *       <Button>Save</Button>
 *     </DialogFooter>
 *   );
 * }
 * @see {@link DialogContent}
 * @since 1.0.0
 */
function DialogFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="dialog-footer"
      class={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", local.class)}
      {...rest}
    />
  );
}

/**
 * The accessible name of the dialog, and its visible heading. The dialog is labeled by it. Use
 * `aria-label` on the content instead only when there is no visible heading. The title has no keys.
 *
 * @param props The title props: the attributes of the rendered `h2`.
 * @returns The heading.
 * @throws Error when rendered outside a {@link Dialog}.
 * @example
 * import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 *
 * export function Titled() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger>Edit profile</DialogTrigger>
 *       <DialogContent>
 *         <DialogTitle>Edit profile</DialogTitle>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * @see {@link DialogDescription}
 * @since 1.0.0
 */
function DialogTitle(props: DialogTitleProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      class={cn("text-lg leading-none font-semibold", local.class)}
      {...rest}
    />
  );
}

/**
 * The accessible description of the dialog: the text a screen reader reads after its name. It is a
 * plain paragraph and has no keys.
 *
 * @param props The description props: the attributes of the rendered `p`.
 * @returns The paragraph.
 * @throws Error when rendered outside a {@link Dialog}.
 * @example
 * import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 *
 * export function Described() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger>Delete</DialogTrigger>
 *       <DialogContent>
 *         <DialogTitle>Delete account</DialogTitle>
 *         <DialogDescription>This cannot be undone.</DialogDescription>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * @see {@link DialogTitle}
 * @since 1.0.0
 */
function DialogDescription(props: DialogDescriptionProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      class={cn("text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
