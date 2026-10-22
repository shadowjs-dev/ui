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

/** The positioning, border and slide animation of each side. */
const SIDES: Record<SheetSide, string> = {
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
  top: "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
  bottom:
    "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
  start:
    "inset-y-0 start-0 h-full w-3/4 border-e data-[state=closed]:ltr:slide-out-to-left data-[state=closed]:rtl:slide-out-to-right data-[state=open]:ltr:slide-in-from-left data-[state=open]:rtl:slide-in-from-right sm:max-w-sm",
  end: "inset-y-0 end-0 h-full w-3/4 border-s data-[state=closed]:ltr:slide-out-to-right data-[state=closed]:rtl:slide-out-to-left data-[state=open]:ltr:slide-in-from-right data-[state=open]:rtl:slide-in-from-left sm:max-w-sm",
};

/**
 * The edge a {@link SheetContent} slides in from. `left` and `right` are the physical edges, as in
 * shadcn/ui. `start` and `end` are the inline-start and inline-end edges, which swap in
 * right-to-left layouts (the border, the position and the slide animation included).
 * @since 1.0.0
 * @see {@link SheetContent}
 */
export type SheetSide = "top" | "right" | "bottom" | "left" | "start" | "end";

/**
 * A modal panel that slides in from an edge of the screen, built on the dialog primitive. Put a
 * {@link SheetTrigger} and a {@link SheetContent} inside it. Control it with `open` and
 * `onOpenChange`, or start it open with `defaultOpen`.
 *
 * Keyboard and ARIA: focus moves into the sheet when it opens and returns to the trigger when it
 * closes. Tab and Shift+Tab cycle inside the sheet. Escape closes it, and so does a press outside
 * the panel (on the overlay). The panel is a `role="dialog"` with `aria-modal="true"`, named by its
 * {@link SheetTitle} and described by its {@link SheetDescription}; while it is open the rest of the
 * page is hidden from assistive technology. A sheet with no title needs an `aria-label` on its
 * content to have a name.
 *
 * shadcn/ui differences: `as` replaces `asChild` on the trigger and the close buttons, and `class`
 * replaces `className`. `side` also takes `"start"` and `"end"` for right-to-left layouts.
 *
 * @param props - The props: `open`, `defaultOpen` and `onOpenChange`, see {@link DialogProps}.
 * @returns The dialog context around the sheet's parts. It renders no element of its own.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import {
 *   Sheet,
 *   SheetContent,
 *   SheetDescription,
 *   SheetHeader,
 *   SheetTitle,
 *   SheetTrigger,
 * } from "@/components/ui/sheet";
 *
 * export function ProfileSheet() {
 *   return (
 *     <Sheet>
 *       <SheetTrigger as={Button} variant="outline">
 *         Edit profile
 *       </SheetTrigger>
 *       <SheetContent side="right">
 *         <SheetHeader>
 *           <SheetTitle>Edit profile</SheetTitle>
 *           <SheetDescription>Make changes to your profile here.</SheetDescription>
 *         </SheetHeader>
 *       </SheetContent>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SheetContent}
 */
function Sheet(props: DialogProps): JSX.Element {
  return <DialogPrimitive {...props} />;
}

/**
 * The button that opens the sheet. It renders a `button` by default; `as` renders another element,
 * such as a shadcn/ui `Button`.
 *
 * Keyboard and ARIA: Enter and Space activate it. It has `aria-haspopup="dialog"`, `aria-expanded`
 * (`"true"` while the sheet is open) and `aria-controls` pointing at the sheet.
 *
 * shadcn/ui differences: `as` replaces `asChild`, and `class` replaces `className`.
 *
 * @param props - The props: `as` and the attributes of the trigger element.
 * @returns The trigger element.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
 *
 * export function MenuSheet() {
 *   return (
 *     <Sheet>
 *       <SheetTrigger as={Button}>Open</SheetTrigger>
 *       <SheetContent>
 *         <SheetTitle>Menu</SheetTitle>
 *       </SheetContent>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SheetTrigger<T extends PolymorphicTarget = "button">(
  props: DialogTriggerProps<T>,
): JSX.Element {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

/**
 * A button that closes the sheet. It renders a `button` by default; `as` renders another element,
 * such as a shadcn/ui `Button`.
 *
 * Keyboard and ARIA: Enter and Space close the sheet. Its name is its text; pass `aria-label` when
 * the text is not descriptive.
 *
 * shadcn/ui differences: `as` replaces `asChild`, and `class` replaces `className`.
 *
 * @param props - The props: `as` and the attributes of the close element.
 * @returns The close element.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
 *
 * export function CancelSheet() {
 *   return (
 *     <Sheet defaultOpen>
 *       <SheetContent>
 *         <SheetTitle>Discard changes</SheetTitle>
 *         <SheetClose as={Button} variant="outline">
 *           Cancel
 *         </SheetClose>
 *       </SheetContent>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SheetClose<T extends PolymorphicTarget = "button">(
  props: DialogCloseProps<T>,
): JSX.Element {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

/**
 * Renders the overlay and the content into `document.body` while the sheet is open. {@link SheetContent}
 * already includes one, so you rarely render it yourself. A sheet that is open at render time is
 * server-rendered as well.
 *
 * @param props - The props: `container`, `forceMount`, and `children`.
 * @returns The portal, or nothing while the sheet is closed.
 * @example
 * ```tsx
 * import { Sheet, SheetOverlay, SheetPortal } from "@/components/ui/sheet";
 *
 * export function BackdropOnly() {
 *   return (
 *     <Sheet defaultOpen>
 *       <SheetPortal>
 *         <SheetOverlay class="bg-black/70" />
 *       </SheetPortal>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SheetPortal(props: DialogPortalProps): JSX.Element {
  return <DialogPrimitive.Portal {...props} />;
}

/**
 * The dimmed backdrop behind the sheet. Pressing it closes the sheet.
 *
 * Keyboard and ARIA: `aria-hidden="true"`, and no keys, so assistive technology skips it.
 *
 * shadcn/ui differences: `class` replaces `className`. Its default is `bg-black/50`.
 *
 * @param props - The props: `class`, and the attributes of the overlay element.
 * @returns The overlay element.
 * @example
 * ```tsx
 * import { Sheet, SheetOverlay, SheetPortal } from "@/components/ui/sheet";
 *
 * export function DarkBackdrop() {
 *   return (
 *     <Sheet defaultOpen>
 *       <SheetPortal>
 *         <SheetOverlay class="bg-black/70" />
 *       </SheetPortal>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SheetPortal}
 */
function SheetOverlay(props: DialogOverlayProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      class={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Own props of {@link SheetContent}.
 * @since 1.0.0
 * @see {@link SheetContent}
 */
export interface SheetContentExtraProps {
  /**
   * The edge the sheet slides in from.
   * @default "right"
   */
  readonly side?: SheetSide | undefined;
  /**
   * Show the close button in the corner.
   * @default true
   */
  readonly showCloseButton?: boolean | undefined;
}

/**
 * The sheet panel: the portal, the overlay, and the content anchored to `side`. It holds the
 * header, the body and the footer. A close button sits in the top corner on the end edge unless
 * `showCloseButton` is `false`.
 *
 * Keyboard and ARIA: see {@link Sheet}. The panel is a `role="dialog"`. The close button is named
 * "Close" (a visually hidden label) and closes the sheet on Enter or Space.
 *
 * shadcn/ui differences: `side` also takes `"start"` and `"end"`, and `showCloseButton` (default
 * `true`) removes the built-in close button when `false`.
 *
 * @param props - The props: `side`, `showCloseButton`, and the attributes of the dialog content.
 * @returns The portal, with the overlay and the content inside.
 * @example
 * ```tsx
 * import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
 *
 * export function MenuSheet() {
 *   return (
 *     <Sheet>
 *       <SheetTrigger>Menu</SheetTrigger>
 *       <SheetContent side="left" showCloseButton={false}>
 *         <SheetTitle>Menu</SheetTitle>
 *       </SheetContent>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SheetContent(props: DialogContentProps & SheetContentExtraProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children", "side", "showCloseButton"]);
  const t = useUiStrings();
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        class={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out outline-none motion-reduce:transition-none data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
          SIDES[local.side ?? "right"],
          local.class,
        )}
        {...rest}
      >
        {local.children}
        {local.showCloseButton !== false && (
          <DialogPrimitive.Close
            data-slot="sheet-close"
            class="absolute end-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 outline-none focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-transparent disabled:pointer-events-none data-[state=open]:bg-secondary motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span class="sr-only">{t("sheet.close", "Close")}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

/**
 * The layout of the title and the description at the top of the sheet.
 *
 * Keyboard and ARIA: no keys and no role of its own.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `div`, and `class`.
 * @returns The header `div`.
 * @example
 * ```tsx
 * import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
 *
 * export function Header() {
 *   return (
 *     <Sheet>
 *       <SheetTrigger>Open</SheetTrigger>
 *       <SheetContent>
 *         <SheetHeader>
 *           <SheetTitle>Edit profile</SheetTitle>
 *           <SheetDescription>Make changes to your profile here.</SheetDescription>
 *         </SheetHeader>
 *       </SheetContent>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SheetHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div data-slot="sheet-header" class={cn("flex flex-col gap-1.5 p-4", local.class)} {...rest} />
  );
}

/**
 * The layout of the action buttons at the bottom of the sheet. It is pushed to the bottom of the
 * panel.
 *
 * Keyboard and ARIA: no keys and no role of its own.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `div`, and `class`.
 * @returns The footer `div`.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
 *
 * export function Actions() {
 *   return (
 *     <Sheet>
 *       <SheetTrigger>Open</SheetTrigger>
 *       <SheetContent>
 *         <SheetFooter>
 *           <SheetClose as={Button}>Save</SheetClose>
 *         </SheetFooter>
 *       </SheetContent>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SheetFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sheet-footer"
      class={cn("mt-auto flex flex-col gap-2 p-4", local.class)}
      {...rest}
    />
  );
}

/**
 * The title of the sheet. It is the sheet's accessible name, so give every sheet a title.
 *
 * Keyboard and ARIA: no keys. The sheet's `aria-labelledby` points at this title.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the title element, and `class`.
 * @returns The title element.
 * @example
 * ```tsx
 * import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
 *
 * export function TitledSheet() {
 *   return (
 *     <Sheet>
 *       <SheetTrigger>Open</SheetTrigger>
 *       <SheetContent>
 *         <SheetTitle>Edit profile</SheetTitle>
 *       </SheetContent>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SheetDescription}
 */
function SheetTitle(props: DialogTitleProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      class={cn("font-semibold text-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * The description of the sheet, read after its title.
 *
 * Keyboard and ARIA: no keys. The sheet's `aria-describedby` points at this description while it is
 * rendered.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the description element, and `class`.
 * @returns The description element.
 * @example
 * ```tsx
 * import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
 *
 * export function DescribedSheet() {
 *   return (
 *     <Sheet>
 *       <SheetTrigger>Open</SheetTrigger>
 *       <SheetContent>
 *         <SheetTitle>Edit profile</SheetTitle>
 *         <SheetDescription>Make changes here.</SheetDescription>
 *       </SheetContent>
 *     </Sheet>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SheetTitle}
 */
function SheetDescription(props: DialogDescriptionProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      class={cn("text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
