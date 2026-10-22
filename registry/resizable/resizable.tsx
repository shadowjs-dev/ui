import { onMount, splitProps, useSignal } from "@shadow-js/core";
import {
  createPartContext,
  type Direction,
  useDirectionAround,
  useRefSignal,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { GripVerticalIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * Moves `delta` percent of the space from panel `index` to panel `index + 1` (or back, for a negative
 * delta), keeping every panel within its bounds and the total unchanged. It is the arithmetic behind
 * the handles, as a pure function.
 *
 * @param sizes The panel sizes, in percent.
 * @param index The panel on the left (or top) of the handle.
 * @param delta The movement in percent; positive moves the handle toward the second panel.
 * @param min The smallest size of each panel.
 * @param max The largest size of each panel.
 * @returns The new sizes, as a new array.
 * @example
 * import { resizeSizes } from "@/components/ui/resizable";
 *
 * resizeSizes([50, 50], 0, 10, [0, 0], [100, 100]); // [60, 40]
 * @since 1.0.0 * @see {@link ResizableHandle}
 */
export function resizeSizes(
  sizes: readonly number[],
  index: number,
  delta: number,
  min: readonly number[],
  max: readonly number[],
): number[] {
  const first = sizes[index];
  const second = sizes[index + 1];
  if (first === undefined || second === undefined) return [...sizes];
  const firstMin = min[index] ?? 0;
  const secondMin = min[index + 1] ?? 0;
  const firstMax = max[index] ?? 100;
  const secondMax = max[index + 1] ?? 100;
  // The first panel can grow to its max or shrink to its min; the second the other way round.
  const low = Math.max(firstMin - first, second - secondMax);
  const high = Math.min(firstMax - first, second - secondMin);
  const step = Math.min(high, Math.max(low, delta));
  const next = [...sizes];
  next[index] = first + step;
  next[index + 1] = second - step;
  return next;
}

/** What the group shares with its panels and handles. @internal */
interface ResizableContextValue {
  readonly direction: () => "horizontal" | "vertical";
  readonly dir: () => Direction;
  readonly sizes: () => number[];
  readonly min: () => number[];
  readonly max: () => number[];
  readonly claimPanel: (defaultSize: number, minSize: number, maxSize: number) => number;
  readonly move: (index: number, delta: number) => void;
  readonly set: (index: number, size: number) => void;
  /** How many panels have rendered so far: a handle sits after panel `n - 1`, so its index is `n - 1`. */
  readonly panelsClaimed: () => number;
  readonly storageKey: () => string | undefined;
}

/**
 * Reports a storage problem. The layout keeps working without storage; the warning tells the
 * developer why the sizes are not remembered.
 */
function reportStorage(action: string, error: unknown): void {
  console.warn(`[shadow-ui] resizable: ${action} failed; the sizes are not remembered`, error);
}

const resizableContext = createPartContext<ResizableContextValue>("ResizablePanelGroup");

/**
 * Props of {@link ResizablePanelGroup}: the `div` attributes plus the layout options below.
 * @since 1.0.0
 * @see {@link ResizablePanelGroup}
 */
export interface ResizablePanelGroupProps extends ComponentProps<"div"> {
  /**
   * The direction of the layout: `horizontal` (panels side by side) or `vertical` (stacked).
   * @default "horizontal"
   */
  readonly direction?: "horizontal" | "vertical" | undefined;
  /**
   * The shadcn name for `direction` (the v4 prop). When both are given, `direction` wins.
   * @default "horizontal"
   * @see {@link ResizablePanelGroupProps}
   */
  readonly orientation?: "horizontal" | "vertical" | undefined;
  /**
   * Remembers the sizes in `localStorage`, under the key `shadow-ui:resizable:<id>`, and restores
   * them after the group mounts, so the server markup and the first client render agree.
   * @default none (the sizes are not remembered)
   */
  readonly autoSaveId?: string | undefined;
  /**
   * Called with the new sizes (percent of the group) after every change the user makes, by
   * dragging a handle or with its keys. It is not called when a remembered layout is restored.
   * @default none
   */
  readonly onLayout?: ((sizes: number[]) => void) | undefined;
  /**
   * The reading direction. `"rtl"` mirrors a horizontal group, so the first panel is on the right
   * and the handle keys swap.
   * @default none (inherited from the nearest `DirectionProvider`, then the document, then `"ltr"`)
   */
  readonly dir?: Direction | undefined;
}

/**
 * Panels with draggable handles between them. The group keeps the sizes (percent of the group);
 * a handle moves space from one panel to the next, and no handle takes a panel below its `minSize`
 * or above its `maxSize`.
 *
 * Keyboard and ARIA: the group is a plain `div` with no role and no keys of its own. Its handles
 * are the focusable parts; see {@link ResizableHandle}.
 *
 * @param props See {@link ResizablePanelGroupProps}. `class` adds to the group's classes; the rest
 * are the `div` attributes.
 * @returns The group `div` with its panels and handles inside.
 * @example
 * import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
 *
 * <ResizablePanelGroup direction="horizontal" autoSaveId="editor">
 *   <ResizablePanel defaultSize={30} minSize={15}>Files</ResizablePanel>
 *   <ResizableHandle withHandle />
 *   <ResizablePanel defaultSize={70}>Editor</ResizablePanel>
 * </ResizablePanelGroup>
 * @since 1.0.0
 * @see {@link ResizablePanel}
 */
function ResizablePanelGroup(props: ResizablePanelGroupProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "class",
    "direction",
    "orientation",
    "autoSaveId",
    "onLayout",
    "dir",
    "children",
  ]);
  const direction = (): "horizontal" | "vertical" =>
    local.direction ?? local.orientation ?? "horizontal";
  // A dir attribute above the group applies when there is no prop: found after mount, when the
  // group has ancestors.
  const [groupElement, setGroupElement] = useRefSignal<HTMLElement>();
  let groupNode: HTMLElement | undefined;
  const dir = useDirectionAround(() => local.dir as Direction | undefined, groupElement);
  // The panels register their defaults while they render (plain arrays, no signal writes during a
  // render). The sizes signal starts empty and is filled by the first change or the restore on mount.
  const defaults: number[] = [];
  const minimums: number[] = [];
  const maximums: number[] = [];
  const [sizes, setSizes] = useSignal<number[]>([]);
  const currentSizes = (): number[] => {
    const current = sizes();
    return current.length > 0 ? current : [...defaults];
  };
  let claimed = 0;
  const storageKey = (): string | undefined =>
    local.autoSaveId === undefined
      ? undefined
      : `shadow-ui:resizable:${local.autoSaveId as string}`;

  const commit = (next: number[]): void => {
    setSizes(next);
    (local.onLayout as ((sizes: number[]) => void) | undefined)?.(next);
    const key = storageKey();
    if (key === undefined) return;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch (error) {
      // Storage can be full or blocked: the layout still works, it is just not remembered.
      reportStorage("saving the layout", error);
    }
  };

  // Restores the remembered sizes after mount, so the server and the first client render agree.
  onMount(() => {
    setGroupElement(groupNode);
    const key = storageKey();
    if (key === undefined) return;
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      if (
        Array.isArray(saved) &&
        saved.length === defaults.length &&
        saved.every((value) => typeof value === "number")
      ) {
        setSizes(saved as number[]);
      }
    } catch (error) {
      // A value that is not JSON is ignored and the defaults apply; the mismatch is reported.
      reportStorage("reading the saved layout", error);
    }
  });

  const context: ResizableContextValue = {
    direction,
    dir,
    sizes: currentSizes,
    min: () => minimums,
    max: () => maximums,
    claimPanel(defaultSize, minSize, maxSize) {
      const index = claimed;
      claimed += 1;
      defaults.push(defaultSize);
      minimums.push(minSize);
      maximums.push(maxSize);
      return index;
    },
    move(index, delta) {
      commit(resizeSizes(currentSizes(), index, delta, minimums, maximums));
    },
    set(index, size) {
      const current = currentSizes();
      const delta = size - (current[index] ?? 0);
      commit(resizeSizes(current, index, delta, minimums, maximums));
    },
    panelsClaimed: () => defaults.length,
    storageKey,
  };

  return (
    <resizableContext.Provider value={context}>
      <div
        ref={(node: HTMLElement) => {
          groupNode = node;
        }}
        data-slot="resizable-panel-group"
        data-panel-group-direction={direction()}
        data-orientation={direction()}
        dir={local.dir as Direction | undefined}
        class={cn(
          "flex h-full w-full",
          direction() === "vertical" ? "flex-col" : "flex-row",
          local.class,
        )}
        {...rest}
      >
        {local.children as JSX.Element}
      </div>
    </resizableContext.Provider>
  );
}

/**
 * Props of {@link ResizablePanel}: the `div` attributes plus the size bounds below.
 * @since 1.0.0
 * @see {@link ResizablePanel}
 */
export interface ResizablePanelProps extends ComponentProps<"div"> {
  /**
   * The starting size, in percent of the group.
   * @default 50
   */
  readonly defaultSize?: number | undefined;
  /**
   * The smallest size a handle can leave this panel, in percent of the group.
   * @default 10
   */
  readonly minSize?: number | undefined;
  /**
   * The largest size a handle can give this panel, in percent of the group.
   * @default 100
   */
  readonly maxSize?: number | undefined;
}

/**
 * One panel of a {@link ResizablePanelGroup}. It takes its share of the group's space: `defaultSize`
 * until a handle moves it, within `minSize` and `maxSize`.
 *
 * Keyboard and ARIA: a plain `div` with no role and no keys; its size is changed by the handles.
 *
 * @param props See {@link ResizablePanelProps}. `class` adds to the panel's classes; the rest are the
 * `div` attributes.
 * @returns The panel `div`.
 * @throws Error when rendered outside a {@link ResizablePanelGroup}.
 * @example
 * import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
 *
 * <ResizablePanelGroup>
 *   <ResizablePanel defaultSize={30} minSize={15}>Files</ResizablePanel>
 * </ResizablePanelGroup>
 * @since 1.0.0
 * @see {@link ResizableHandle}
 */
function ResizablePanel(props: ResizablePanelProps): JSX.Element {
  const group = resizableContext.use("ResizablePanel");
  const [local, rest] = splitProps(props, [
    "class",
    "defaultSize",
    "minSize",
    "maxSize",
    "children",
  ]);
  const index = group.claimPanel(
    (local.defaultSize as number | undefined) ?? 50,
    (local.minSize as number | undefined) ?? 10,
    (local.maxSize as number | undefined) ?? 100,
  );
  return (
    <div
      data-slot="resizable-panel"
      data-panel-index={index}
      style={{ flex: `${group.sizes()[index] ?? 0} 1 0%`, minWidth: 0, minHeight: 0 }}
      class={cn("min-h-0 min-w-0 overflow-hidden", local.class)}
      {...rest}
    >
      {local.children as JSX.Element}
    </div>
  );
}

/**
 * Props of {@link ResizableHandle}: the `div` attributes plus `withHandle`.
 * @since 1.0.0
 * @see {@link ResizableHandle}
 */
export interface ResizableHandleProps extends ComponentProps<"div"> {
  /**
   * Shows a grip in the middle of the handle, so the bar reads as draggable.
   * @default false
   */
  readonly withHandle?: boolean | undefined;
}

/**
 * The bar between two panels. Drag it with the pointer. Focus it and use the arrow keys to move it
 * 5 percent a step (mirrored in right-to-left layouts), or Home and End to make the first panel as
 * small or as large as its bounds allow.
 *
 * Keyboard and ARIA: a focusable `role="separator"` (`tabindex="0"`). Its `aria-orientation` is the
 * handle's own axis (`vertical` in a horizontal group). `aria-valuenow`, `aria-valuemin` and
 * `aria-valuemax` give the first panel's size and bounds, rounded. It is named "Resize panels" unless
 * you pass your own `aria-label`. Left and Right move a handle in a horizontal group; Up and Down
 * move a handle in a vertical group. Home and End set the first panel to its smallest and largest.
 *
 * @param props See {@link ResizableHandleProps}. `class` adds to the handle's classes; the rest are
 * the `div` attributes.
 * @returns The handle `div`.
 * @throws Error when rendered outside a {@link ResizablePanelGroup}.
 * @example
 * import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
 *
 * <ResizablePanelGroup>
 *   <ResizablePanel>Files</ResizablePanel>
 *   <ResizableHandle withHandle />
 *   <ResizablePanel>Editor</ResizablePanel>
 * </ResizablePanelGroup>
 * @since 1.0.0
 * @see {@link ResizablePanelGroup}
 */
function ResizableHandle(props: ResizableHandleProps): JSX.Element {
  const group = resizableContext.use("ResizableHandle");
  const t = useUiStrings();
  const [local, rest] = splitProps(props, ["class", "withHandle"]);
  // A handle sits right after the panel before it, so its index follows from the panels rendered.
  const handleIndex = Math.max(0, group.panelsClaimed() - 1);
  const step = 5;
  const vertical = (): boolean => group.direction() === "vertical";
  let stopDrag: (() => void) | undefined;

  const startDrag = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    stopDrag?.();
    event.preventDefault();
    const axis = vertical() ? "clientY" : "clientX";
    const start = event[axis];
    // The group is the handle's parent: measured from the event, so no reference is needed.
    const box = (event.currentTarget as HTMLElement | null)?.parentElement?.getBoundingClientRect();
    const length = box === undefined ? 0 : vertical() ? box.height : box.width;
    const mirror = !vertical() && group.dir() === "rtl" ? -1 : 1;
    const startSize = group.sizes()[handleIndex] ?? 0;
    // Only the pointer that pressed the handle moves it; another finger is not part of this drag.
    const pointer = event.pointerId;
    const move = (moveEvent: PointerEvent): void => {
      if (moveEvent.pointerId !== pointer || length <= 0) return;
      const percent = ((moveEvent[axis] - start) / length) * 100 * mirror;
      group.set(handleIndex, startSize + percent);
    };
    const end = (finished: PointerEvent): void => {
      if (finished.pointerId === pointer) stopDrag?.();
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
  };

  return (
    <div
      role="separator"
      tabindex={0}
      aria-orientation={vertical() ? "horizontal" : "vertical"}
      aria-valuenow={Math.round(group.sizes()[handleIndex] ?? 0)}
      aria-valuemin={Math.round(group.min()[handleIndex] ?? 0)}
      aria-valuemax={Math.round(group.max()[handleIndex] ?? 100)}
      aria-label={t("resizable.handle", "Resize panels")}
      data-slot="resizable-handle"
      data-orientation={vertical() ? "vertical" : "horizontal"}
      class={cn(
        // touch-none: a touch drag moves the handle; the browser must not pan or scroll instead.
        "relative flex touch-none items-center justify-center bg-border outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 forced-colors:bg-[CanvasText] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        vertical()
          ? "h-px w-full after:absolute after:inset-x-0 after:top-1/2 after:h-1 after:-translate-y-1/2 cursor-row-resize"
          : "h-full w-px after:absolute after:inset-y-0 after:start-1/2 after:w-1 after:-translate-x-1/2 cursor-col-resize",
        local.class,
      )}
      onPointerDown={(event: PointerEvent) => startDrag(event)}
      onKeyDown={(event: KeyboardEvent) => {
        const forward = vertical()
          ? "ArrowDown"
          : group.dir() === "rtl"
            ? "ArrowLeft"
            : "ArrowRight";
        const back = vertical() ? "ArrowUp" : group.dir() === "rtl" ? "ArrowRight" : "ArrowLeft";
        if (event.key === forward) {
          event.preventDefault();
          group.move(handleIndex, step);
        } else if (event.key === back) {
          event.preventDefault();
          group.move(handleIndex, -step);
        } else if (event.key === "Home") {
          event.preventDefault();
          group.set(handleIndex, group.min()[handleIndex] ?? 0);
        } else if (event.key === "End") {
          event.preventDefault();
          group.set(handleIndex, group.max()[handleIndex] ?? 100);
        }
      }}
      {...rest}
    >
      {local.withHandle === true && (
        <div class="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border">
          <GripVerticalIcon class={cn("size-2.5", vertical() && "rotate-90")} />
        </div>
      )}
    </div>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
