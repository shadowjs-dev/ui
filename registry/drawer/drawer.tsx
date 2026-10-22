import { onCleanup, splitProps, useSignal } from "@shadow-js/core";
import {
  createPartContext,
  type DialogCloseProps,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogOverlayProps,
  type DialogPortalProps,
  Dialog as DialogPrimitive,
  type DialogTitleProps,
  type DialogTriggerProps,
  type PolymorphicTarget,
  useControllableState,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * The rest positions of a {@link Drawer}, as visible fractions of its height in ascending order:
 * `[0.5, 1]` is a half-open position and a fully open one. After a drag the drawer rests at the nearest
 * position.
 * @see {@link Drawer}
 * @since 1.0.0
 */
export type DrawerSnapPoints = readonly number[];

/** The nearest snap index to a visible fraction. @internal */
function nearestSnap(points: DrawerSnapPoints, visible: number): number {
  let best = 0;
  for (let index = 1; index < points.length; index += 1) {
    const candidate = points[index] ?? 0;
    const current = points[best] ?? 0;
    if (Math.abs(candidate - visible) < Math.abs(current - visible)) best = index;
  }
  return best;
}

/**
 * The edge a {@link Drawer} slides in from. `bottom` is the default; `start` and `end` follow the
 * reading direction, so they swap sides in a right-to-left page (there is no physical `left` or
 * `right`, on purpose).
 * @since 1.0.0
 */
export type DrawerDirection = "bottom" | "top" | "start" | "end";

/** The positioning, border, rounding and slide animation of each direction. @internal */
function directionClasses(direction: DrawerDirection): string {
  switch (direction) {
    case "top":
      return "inset-x-0 top-0 max-h-[96%] rounded-b-xl border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top";
    case "start":
      return "inset-y-0 start-0 h-full w-3/4 max-w-sm rounded-e-xl border-e rtl:[--drawer-dir:-1] data-[state=closed]:ltr:slide-out-to-left data-[state=closed]:rtl:slide-out-to-right data-[state=open]:ltr:slide-in-from-left data-[state=open]:rtl:slide-in-from-right";
    case "end":
      return "inset-y-0 end-0 h-full w-3/4 max-w-sm rounded-s-xl border-s rtl:[--drawer-dir:-1] data-[state=closed]:ltr:slide-out-to-right data-[state=closed]:rtl:slide-out-to-left data-[state=open]:ltr:slide-in-from-right data-[state=open]:rtl:slide-in-from-left";
    default:
      return "inset-x-0 bottom-0 max-h-[96%] rounded-t-xl border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom";
  }
}

/** True for the directions that move along the horizontal axis. @internal */
const isHorizontal = (direction: DrawerDirection): boolean =>
  direction === "start" || direction === "end";

/** True when the element is laid out right to left. @internal */
function isRtl(element: Element | null): boolean {
  if (element === null) return false;
  const computed = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  return computed === "rtl" || element.closest("[dir]")?.getAttribute("dir") === "rtl";
}

/**
 * The sign that turns a pointer movement into "pushed away from the open edge": positive means the
 * sheet is being dismissed. @internal
 */
function dismissSign(direction: DrawerDirection, rtl: boolean): number {
  if (direction === "bottom") return 1;
  if (direction === "top") return -1;
  // end: the right edge in ltr, so toward the right dismisses; start is the mirror.
  const toEnd = direction === "end" ? 1 : -1;
  return rtl ? -toEnd : toEnd;
}

/** What the drawer shares with its parts. @internal */
interface DrawerContextValue {
  readonly direction: () => DrawerDirection;
  readonly isOpen: () => boolean;
  readonly close: () => void;
  readonly snapPoints: () => DrawerSnapPoints;
  readonly snap: () => number;
  readonly setSnap: (index: number) => void;
  readonly dismissible: () => boolean;
}

const drawerContext = createPartContext<DrawerContextValue>("Drawer");

/** What the content shares with its grip. @internal */
interface DrawerSheetContextValue {
  readonly offset: () => number;
  readonly dragging: () => boolean;
  readonly startDrag: (event: PointerEvent, size: number) => void;
  /** Moves the snap point by `step` (positive opens further). */
  readonly nudge: (step: number) => void;
}

const drawerSheetContext = createPartContext<DrawerSheetContextValue>("DrawerContent");

/**
 * Props of {@link Drawer}: the open state of the dialog, and the snap points and dismissal of the sheet.
 * @see {@link Drawer}
 * @since 1.0.0
 */
export interface DrawerProps {
  /**
   * Controlled open state. Leave it unset to let the drawer manage its own state.
   * @default none
   */
  readonly open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called with the requested open state when the drawer opens or closes.
   * @default none
   */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Whether the drawer is modal: focus is trapped, the page behind is inert and scroll is locked.
   * `false` leaves the page usable beside the sheet and sets no `aria-modal`.
   * @default true
   */
  readonly modal?: boolean | undefined;
  /**
   * The edge the drawer slides in from: `"bottom"`, `"top"`, `"start"` or `"end"` (the last two follow
   * the reading direction). Dragging the grip toward that edge dismisses the sheet.
   * @default "bottom"
   */
  readonly direction?: DrawerDirection | undefined;
  /**
   * Rest positions as visible fractions of the drawer's size along its axis (height for `bottom` and
   * `top`, width for `start` and `end`). Without them the drawer is one size.
   * @default none
   */
  readonly snapPoints?: DrawerSnapPoints | undefined;
  /**
   * Index of the snap point the sheet rests at. Setting it controls the snap point.
   * @default none
   */
  readonly snap?: number | undefined;
  /**
   * Index of the snap point the drawer opens at when uncontrolled.
   * @default 0
   */
  readonly defaultSnap?: number | undefined;
  /**
   * Called with the new snap index when a drag or the arrow keys change it.
   * @default none
   */
  readonly onSnapChange?: ((index: number) => void) | undefined;
  /**
   * Whether dragging the sheet down far enough closes it. Without snap points, a drag of more than a
   * quarter of the sheet's height closes it. With snap points, a drag that leaves less than half of the
   * lowest snap point visible closes it.
   * @default true
   */
  readonly dismissible?: boolean | undefined;
  /**
   * The {@link DrawerTrigger}, {@link DrawerContent} and any other parts.
   * @default none
   */
  readonly children?: JSX.Element | readonly JSX.Element[];
}

/**
 * A panel that slides up from the bottom of the screen: a mobile sheet with a grip. Use it for a
 * secondary task on a phone, such as filters or a short form. It is a modal dialog: focus is trapped,
 * the page behind is inert and scroll-locked, and Escape closes it. Drag the grip down to dismiss the
 * sheet, or to move it between snap points when `snapPoints` is set.
 *
 * Keyboard and ARIA: Enter or Space on the trigger opens the drawer, and Escape or a press on the
 * overlay closes it, which returns focus to the trigger. The grip is a focusable `role="separator"`
 * labeled "Drag to resize". With snap points it has `aria-valuemin`, `aria-valuemax` and
 * `aria-valuenow` (the snap index), and ArrowUp and ArrowDown move the sheet to a taller or a shorter
 * snap point. Without snap points the grip only announces that it is a separator, and the arrow keys
 * do nothing. The content is named by {@link DrawerTitle} and described by {@link DrawerDescription}.
 *
 * shadcn/ui differences: the drawer is a dialog with snap points built in (`snapPoints`, `snap`,
 * `defaultSnap`, `onSnapChange`), not a separate sheet library. `as` replaces `asChild` on the trigger
 * and the close button. The prop is `class`, not `className`, and every part has a `data-slot`.
 * `direction` (`bottom`, `top`, `start`, `end`) replaces vaul's `direction` with logical sides, `modal={false}`
 * keeps the page usable, `dismissible={false}` is the way to stop a swipe or press outside from closing it, and
 * the content takes the dialog's `onOpenAutoFocus` to choose the first focus.
 *
 * @param props The drawer props: see {@link DrawerProps}.
 * @returns The drawer. It renders no element of its own.
 * @example
 * import {
 *   Drawer,
 *   DrawerContent,
 *   DrawerDescription,
 *   DrawerHandle,
 *   DrawerHeader,
 *   DrawerTitle,
 *   DrawerTrigger,
 * } from "@/components/ui/drawer";
 *
 * export function Filters() {
 *   return (
 *     <Drawer snapPoints={[0.5, 1]}>
 *       <DrawerTrigger>Filters</DrawerTrigger>
 *       <DrawerContent>
 *         <DrawerHandle />
 *         <DrawerHeader>
 *           <DrawerTitle>Filters</DrawerTitle>
 *           <DrawerDescription>Narrow the list.</DrawerDescription>
 *         </DrawerHeader>
 *       </DrawerContent>
 *     </Drawer>
 *   );
 * }
 * @see {@link DrawerContent}
 * @see {@link DrawerHandle}
 * @since 1.0.0
 */
function Drawer(props: DrawerProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "open",
    "defaultOpen",
    "onOpenChange",
    "modal",
    "direction",
    "snapPoints",
    "snap",
    "defaultSnap",
    "onSnapChange",
    "dismissible",
    "children",
  ]);
  const [open, setOpen] = useControllableState<boolean>({
    value: () => local.open,
    defaultValue: () => local.defaultOpen === true,
    onChange: () => {
      const callback = local.onOpenChange;
      return callback === undefined ? undefined : (next) => callback(next === true);
    },
    name: "Drawer open",
  });
  const [snap, setSnap] = useControllableState<number>({
    value: () => local.snap,
    defaultValue: () => local.defaultSnap ?? 0,
    onChange: () => {
      const callback = local.onSnapChange;
      return callback === undefined ? undefined : (next) => callback(next ?? 0);
    },
    name: "Drawer snap",
  });
  const context: DrawerContextValue = {
    direction: () => local.direction ?? "bottom",
    isOpen: () => open() === true,
    close: () => setOpen(false),
    snapPoints: () => local.snapPoints ?? [],
    snap: () => snap() ?? 0,
    setSnap: (index) => setSnap(index),
    dismissible: () => local.dismissible !== false,
  };
  return (
    <drawerContext.Provider value={context}>
      <DialogPrimitive
        open={open()}
        onOpenChange={(next: boolean) => setOpen(next)}
        modal={local.modal}
        {...rest}
      >
        {local.children as JSX.Element}
      </DialogPrimitive>
    </drawerContext.Provider>
  );
}

/**
 * The button that opens the drawer. It is a native button; `as` renders another element.
 *
 * @param props The trigger props: the attributes of the rendered element, and `as`.
 * @returns The trigger.
 * @throws Error when rendered outside a {@link Drawer}.
 * @example
 * import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
 *
 * export function OpenSheet() {
 *   return (
 *     <Drawer>
 *       <DrawerTrigger>Open</DrawerTrigger>
 *       <DrawerContent>Sheet body.</DrawerContent>
 *     </Drawer>
 *   );
 * }
 * @see {@link Drawer}
 * @since 1.0.0
 */
function DrawerTrigger<T extends PolymorphicTarget = "button">(
  props: DialogTriggerProps<T>,
): JSX.Element {
  return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

/**
 * A button that closes the drawer. It is a native button; `as` renders another element.
 *
 * @param props The close props: the attributes of the rendered element, and `as`.
 * @returns The close button.
 * @throws Error when rendered outside a {@link Drawer}.
 * @example
 * import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
 *
 * export function CancellableSheet() {
 *   return (
 *     <Drawer>
 *       <DrawerTrigger>Open</DrawerTrigger>
 *       <DrawerContent>
 *         <DrawerClose>Cancel</DrawerClose>
 *       </DrawerContent>
 *     </Drawer>
 *   );
 * }
 * @see {@link Drawer}
 * @since 1.0.0
 */
function DrawerClose<T extends PolymorphicTarget = "button">(
  props: DialogCloseProps<T>,
): JSX.Element {
  return <DialogPrimitive.Close data-slot="drawer-close" {...props} />;
}

/**
 * Renders the overlay and the sheet into `document.body`, or into the `container` you pass, while the
 * drawer is open. {@link DrawerContent} already portals itself, so use this only to choose another
 * container.
 *
 * @param props The portal props: `container` and `forceMount`.
 * @returns The portal, or nothing while the drawer is closed.
 * @throws Error when rendered outside a {@link Drawer}.
 * @example
 * import { Drawer, DrawerContent, DrawerOverlay, DrawerPortal, DrawerTrigger } from "@/components/ui/drawer";
 *
 * export function PortaledSheet() {
 *   return (
 *     <Drawer>
 *       <DrawerTrigger>Open</DrawerTrigger>
 *       <DrawerPortal>
 *         <DrawerOverlay />
 *         <DrawerContent>Sheet body.</DrawerContent>
 *       </DrawerPortal>
 *     </Drawer>
 *   );
 * }
 * @see {@link DrawerContent}
 * @since 1.0.0
 */
function DrawerPortal(props: DialogPortalProps): JSX.Element {
  return <DialogPrimitive.Portal {...props} />;
}

/**
 * The dimmed backdrop behind the drawer. A press on it closes the drawer. {@link DrawerContent} renders
 * one already.
 *
 * @param props The overlay props: `class`, which is merged with the backdrop classes.
 * @returns The overlay.
 * @throws Error when rendered outside a {@link Drawer}.
 * @example
 * import { Drawer, DrawerContent, DrawerOverlay, DrawerPortal, DrawerTrigger } from "@/components/ui/drawer";
 *
 * export function DimmedSheet() {
 *   return (
 *     <Drawer>
 *       <DrawerTrigger>Open</DrawerTrigger>
 *       <DrawerPortal>
 *         <DrawerOverlay class="bg-black/70" />
 *         <DrawerContent>Sheet body.</DrawerContent>
 *       </DrawerPortal>
 *     </Drawer>
 *   );
 * }
 * @see {@link DrawerContent}
 * @since 1.0.0
 */
function DrawerOverlay(props: DialogOverlayProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Overlay
      data-slot="drawer-overlay"
      class={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The drawer panel: a sheet at the bottom of the screen, with the overlay. While the grip is dragged the
 * sheet follows the pointer; on release it rests at the nearest snap point, or closes when it was
 * dragged far enough (see {@link DrawerProps.dismissible}). `class` is merged with its own classes.
 *
 * @param props The panel props: the attributes of the rendered `div`, and `class`.
 * @returns The panel, rendered in a portal while the drawer is open.
 * @throws Error when rendered outside a {@link Drawer}.
 * @example
 * import { Drawer, DrawerContent, DrawerHandle, DrawerTrigger } from "@/components/ui/drawer";
 *
 * export function Sheet() {
 *   return (
 *     <Drawer>
 *       <DrawerTrigger>Open</DrawerTrigger>
 *       <DrawerContent class="max-h-[80vh]">
 *         <DrawerHandle />
 *         <p>Sheet body.</p>
 *       </DrawerContent>
 *     </Drawer>
 *   );
 * }
 * @see {@link Drawer}
 * @see {@link DrawerHandle}
 * @since 1.0.0
 */
function DrawerContent(props: DialogContentProps): JSX.Element {
  const drawer = drawerContext.use("DrawerContent");
  const [local, rest] = splitProps(props, ["class", "children"]);
  // The offset is how far the sheet is pushed away from its edge, in pixels: 0 is the snap point it rests at.
  const [dragOffset, setDragOffset] = useSignal<number | undefined>(undefined);
  let stopDrag: (() => void) | undefined;
  onCleanup(() => stopDrag?.());

  const restOffset = (size: number): number => {
    const points = drawer.snapPoints();
    if (points.length === 0) return 0;
    return (1 - (points[drawer.snap()] ?? 1)) * size;
  };

  // Decides where a release leaves the sheet: a snap point, or closed when dragged far enough.
  const settle = (offset: number, size: number): void => {
    const points = drawer.snapPoints();
    const visible = size > 0 ? 1 - offset / size : 1;
    setDragOffset(undefined);
    if (points.length === 0) {
      if (drawer.dismissible() && offset > size * 0.25) drawer.close();
      return;
    }
    const lowest = points[0] ?? 0;
    if (drawer.dismissible() && visible < lowest * 0.5) {
      drawer.close();
      return;
    }
    drawer.setSnap(nearestSnap(points, visible));
  };

  // Where the sheet is while dragged: pushed away from its edge by `offset` pixels, in screen terms.
  const dragTransform = (offset: number, rtl: boolean): string => {
    const direction = drawer.direction();
    const signed = offset * dismissSign(direction, rtl);
    return isHorizontal(direction)
      ? `translate3d(${signed}px, 0, 0)`
      : `translate3d(0, ${signed}px, 0)`;
  };
  // The reading direction found when the drag started; the sheet's own classes mirror the rest.
  let dragRtl = false;

  const sheet: DrawerSheetContextValue = {
    offset: () => dragOffset() ?? 0,
    dragging: () => dragOffset() !== undefined,
    startDrag(event: PointerEvent, size: number): void {
      if (event.button !== 0) return;
      stopDrag?.();
      event.preventDefault();
      const direction = drawer.direction();
      const horizontal = isHorizontal(direction);
      dragRtl = isRtl(
        (event.currentTarget as Element | null)?.closest('[data-slot="drawer-content"]') ?? null,
      );
      const sign = dismissSign(direction, dragRtl);
      const origin = horizontal ? event.clientX : event.clientY;
      const base = dragOffset() ?? restOffset(size);
      let current = base;
      setDragOffset(base);
      // Only the pointer that pressed the grip moves the sheet; another finger is not part of this drag.
      const pointer = event.pointerId;
      const move = (moveEvent: PointerEvent): void => {
        if (moveEvent.pointerId !== pointer) return;
        const at = horizontal ? moveEvent.clientX : moveEvent.clientY;
        current = Math.max(0, base + (at - origin) * sign);
        setDragOffset(current);
      };
      const end = (finished: PointerEvent): void => {
        if (finished.pointerId !== pointer) return;
        stopDrag?.();
        settle(current, size);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      stopDrag = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        stopDrag = undefined;
      };
    },
    nudge(step: number): void {
      const points = drawer.snapPoints();
      if (points.length === 0) return;
      const next = Math.min(points.length - 1, Math.max(0, drawer.snap() + step));
      drawer.setSnap(next);
    },
  };

  // The rest position is a percentage of the sheet's own size along its axis, so it needs no
  // measurement: a half-open sheet is pushed away by half its size and the fully open one is not
  // moved. Horizontal sheets mirror it with `--drawer-dir` (1, or -1 in a right-to-left page).
  const restPercent = (): number => (1 - (drawer.snapPoints()[drawer.snap()] ?? 1)) * 100;
  const restTransform = (): string => {
    const direction = drawer.direction();
    const percent = restPercent();
    if (direction === "bottom") return `translate3d(0, ${percent}%, 0)`;
    if (direction === "top") return `translate3d(0, ${-percent}%, 0)`;
    const toEnd = direction === "end" ? percent : -percent;
    return `translate3d(calc(var(--drawer-dir, 1) * ${toEnd}%), 0, 0)`;
  };

  // Direct attributes (not a spread): the style and the class follow the drag as it happens. At
  // rest with snap points the sheet sits at its snap point, and the release animates it there.
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        class={cn(
          "fixed z-50 flex flex-col bg-background shadow-lg outline-none transition-transform duration-300 ease-out motion-reduce:transition-none data-[state=closed]:animate-out data-[state=open]:animate-in",
          directionClasses(drawer.direction()),
          local.class,
        )}
        style={
          dragOffset() !== undefined
            ? { transform: dragTransform(dragOffset() ?? 0, dragRtl), transition: "none" }
            : drawer.snapPoints().length > 0
              ? { transform: restTransform() }
              : undefined
        }
        {...rest}
      >
        <drawerSheetContext.Provider value={sheet}>
          {local.children as JSX.Element}
        </drawerSheetContext.Provider>
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
}

/**
 * The grip at the top of the drawer. Drag it to move the sheet. With snap points, ArrowUp moves to a
 * taller snap point and ArrowDown to a shorter one. It is a focusable `role="separator"` labeled "Drag
 * to resize", and with snap points it announces the snap index as `aria-valuenow`.
 *
 * @param props The grip props: the attributes of the rendered `div`, and `class`.
 * @returns The grip.
 * @throws Error when rendered outside a {@link Drawer}.
 * @example
 * import { Drawer, DrawerContent, DrawerHandle, DrawerTrigger } from "@/components/ui/drawer";
 *
 * export function Grip() {
 *   return (
 *     <Drawer snapPoints={[0.5, 1]}>
 *       <DrawerTrigger>Open</DrawerTrigger>
 *       <DrawerContent>
 *         <DrawerHandle />
 *       </DrawerContent>
 *     </Drawer>
 *   );
 * }
 * @see {@link DrawerContent}
 * @since 1.0.0
 */
function DrawerHandle(props: ComponentProps<"div">): JSX.Element {
  const drawer = drawerContext.use("DrawerHandle");
  const sheet = drawerSheetContext.use("DrawerHandle");
  const t = useUiStrings();
  const [local, rest] = splitProps(props, ["class"]);
  const points = (): DrawerSnapPoints => drawer.snapPoints();
  const horizontal = (): boolean => isHorizontal(drawer.direction());
  return (
    <div
      role="separator"
      aria-orientation={horizontal() ? "vertical" : "horizontal"}
      aria-label={t("drawer.handle", "Drag to resize")}
      aria-valuemin={points().length > 0 ? 0 : undefined}
      aria-valuemax={points().length > 0 ? points().length - 1 : undefined}
      aria-valuenow={points().length > 0 ? drawer.snap() : undefined}
      tabindex={0}
      data-slot="drawer-handle"
      data-dragging={sheet.dragging() ? "" : undefined}
      class={cn(
        "shrink-0 cursor-grab touch-none rounded-full bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 forced-colors:bg-[CanvasText] active:cursor-grabbing focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        horizontal() ? "mx-2 my-auto h-12 w-1.5" : "mx-auto mt-4 mb-2 h-1.5 w-12",
        local.class,
      )}
      onPointerDown={(event: PointerEvent) => {
        const target = event.currentTarget as HTMLElement | null;
        const content = target?.closest('[data-slot="drawer-content"]');
        const box = content instanceof HTMLElement ? content.getBoundingClientRect() : undefined;
        sheet.startDrag(event, (horizontal() ? box?.width : box?.height) ?? 0);
      }}
      onKeyDown={(event: KeyboardEvent) => {
        // Toward the open edge's far side opens further: up for bottom, down for top, away from the
        // docked edge for start and end (mirrored in a right-to-left page).
        const direction = drawer.direction();
        const rtl = isRtl(event.currentTarget as Element | null);
        const open =
          direction === "bottom"
            ? "ArrowUp"
            : direction === "top"
              ? "ArrowDown"
              : (direction === "end") !== rtl
                ? "ArrowLeft"
                : "ArrowRight";
        const close =
          direction === "bottom"
            ? "ArrowDown"
            : direction === "top"
              ? "ArrowUp"
              : open === "ArrowLeft"
                ? "ArrowRight"
                : "ArrowLeft";
        if (event.key === open) {
          event.preventDefault();
          sheet.nudge(1);
        } else if (event.key === close) {
          event.preventDefault();
          sheet.nudge(-1);
        }
      }}
      {...rest}
    />
  );
}

/**
 * The header of the drawer, with its title and description. It is a plain `div` with no role.
 *
 * @param props The header props: the attributes of the rendered `div`.
 * @returns The header.
 * @example
 * import { DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
 *
 * export function Heading() {
 *   return (
 *     <DrawerHeader>
 *       <DrawerTitle>Filters</DrawerTitle>
 *       <DrawerDescription>Narrow the list.</DrawerDescription>
 *     </DrawerHeader>
 *   );
 * }
 * @see {@link DrawerTitle}
 * @since 1.0.0
 */
function DrawerHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="drawer-header"
      class={cn("flex flex-col gap-1.5 p-4 text-center md:text-start", local.class)}
      {...rest}
    />
  );
}

/**
 * The footer of the drawer, with its actions at the bottom of the sheet. It is a plain `div` with no role.
 *
 * @param props The footer props: the attributes of the rendered `div`.
 * @returns The footer.
 * @example
 * import { Button } from "@/components/ui/button";
 * import { DrawerFooter } from "@/components/ui/drawer";
 *
 * export function Actions() {
 *   return (
 *     <DrawerFooter>
 *       <Button>Apply</Button>
 *     </DrawerFooter>
 *   );
 * }
 * @see {@link DrawerContent}
 * @since 1.0.0
 */
function DrawerFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="drawer-footer"
      class={cn("mt-auto flex flex-col gap-2 p-4", local.class)}
      {...rest}
    />
  );
}

/**
 * The accessible name of the drawer, rendered as its visible heading.
 *
 * @param props The title props: the attributes of the rendered `h2`.
 * @returns The heading.
 * @throws Error when rendered outside a {@link Drawer}.
 * @example
 * import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
 *
 * export function Titled() {
 *   return (
 *     <Drawer>
 *       <DrawerTrigger>Filters</DrawerTrigger>
 *       <DrawerContent>
 *         <DrawerTitle>Filters</DrawerTitle>
 *       </DrawerContent>
 *     </Drawer>
 *   );
 * }
 * @see {@link DrawerDescription}
 * @since 1.0.0
 */
function DrawerTitle(props: DialogTitleProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      class={cn("text-lg leading-none font-semibold", local.class)}
      {...rest}
    />
  );
}

/**
 * The accessible description of the drawer: the text a screen reader reads after its name.
 *
 * @param props The description props: the attributes of the rendered `p`.
 * @returns The paragraph.
 * @throws Error when rendered outside a {@link Drawer}.
 * @example
 * import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
 *
 * export function Described() {
 *   return (
 *     <Drawer>
 *       <DrawerTrigger>Filters</DrawerTrigger>
 *       <DrawerContent>
 *         <DrawerTitle>Filters</DrawerTitle>
 *         <DrawerDescription>Narrow the list.</DrawerDescription>
 *       </DrawerContent>
 *     </Drawer>
 *   );
 * }
 * @see {@link DrawerTitle}
 * @since 1.0.0
 */
function DrawerDescription(props: DialogDescriptionProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      class={cn("text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
