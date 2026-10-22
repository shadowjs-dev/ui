import { onCleanup, onMount, splitProps, useEffect, useSignal } from "@shadow-js/core";
import {
  createPartContext,
  type Direction,
  useDirectionAround,
  useRefSignal,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * The carousel's axis.
 * @since 1.0.0
 * @see {@link CarouselProps}
 */
export type CarouselOrientation = "horizontal" | "vertical";

/** The index of the slide that is nearest the start of the scroll position. @internal */
function slideIndexAt(scroll: number, slideSize: number, count: number): number {
  if (slideSize <= 0 || count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(Math.abs(scroll) / slideSize)));
}

/**
 * The text a carousel shows and announces, for a language other than English. Every part has an
 * English default; pass the ones you translate or reword as `labels`.
 * @since 1.0.0
 * @see {@link CarouselProps}
 */
export interface CarouselLabels {
  /**
   * The accessible name of the button that goes back.
   * @default "Previous slide"
   */
  readonly previous?: string | undefined;
  /**
   * The accessible name of the button that goes forward.
   * @default "Next slide"
   */
  readonly next?: string | undefined;
  /**
   * The name of a slide, from its 1-based position and the number of slides. The default gives
   * names such as "1 of 3".
   * @default (position, total) => `${position} of ${total}`
   */
  readonly slide?: ((position: number, total: number) => string) | undefined;
  /**
   * The accessible name of an indicator, from the 1-based position of its slide. The default gives
   * names such as "Go to slide 2".
   * @default (position) => `Go to slide ${position}`
   */
  readonly goToSlide?: ((position: number) => string) | undefined;
}

/** The labels with every default filled in. @internal */
interface ResolvedLabels {
  readonly previous: string;
  readonly next: string;
  readonly slide: (position: number, total: number) => string;
  readonly goToSlide: (position: number) => string;
}

/** @internal */
function resolveLabels(
  labels: CarouselLabels | undefined,
  t: ReturnType<typeof useUiStrings>,
): ResolvedLabels {
  return {
    previous: labels?.previous ?? t("carousel.previous", "Previous slide"),
    next: labels?.next ?? t("carousel.next", "Next slide"),
    slide:
      labels?.slide ??
      ((position, total) => t("carousel.slide", "{position} of {total}", { position, total })),
    goToSlide:
      labels?.goToSlide ??
      ((position) => t("carousel.goToSlide", "Go to slide {position}", { position })),
  };
}

/** What the carousel shares with its parts. @internal */
interface CarouselContextValue {
  readonly orientation: () => CarouselOrientation;
  readonly dir: () => Direction;
  readonly index: () => number;
  readonly count: () => number;
  readonly canPrevious: () => boolean;
  readonly canNext: () => boolean;
  readonly scrollToIndex: (index: number) => void;
  readonly previous: () => void;
  readonly next: () => void;
  readonly setViewport: (element: HTMLElement | undefined) => void;
  readonly claimSlide: () => number;
  readonly registerCount: () => void;
  readonly pause: (paused: boolean) => void;
  readonly labels: () => ResolvedLabels;
  /** True once the carousel is mounted in the browser; the slide names wait for it (see CarouselItem). */
  readonly ready: () => boolean;
  /** The viewport scrolled by hand (or by a drag): the index follows the position, next frame. */
  readonly scrolled: () => void;
  /** The user touched the viewport: a programmatic move in progress no longer holds the index. */
  readonly userMoved: () => void;
}

const carouselContext = createPartContext<CarouselContextValue>("Carousel");

/**
 * The options of a carousel in the shape of shadcn/ui's `opts`, for the keys this carousel supports.
 * Embla's other options (`align`, `dragFree`, `slidesToScroll`, ...) do not exist here, and a type
 * error says so.
 * @since 1.0.0
 */
export interface CarouselOptions {
  /** Wrap from the last slide to the first. The `loop` prop wins when both are set. @default false */
  readonly loop?: boolean | undefined;
  /** The slide the carousel opens on, without animation. @default 0 */
  readonly startIndex?: number | undefined;
  /** `"y"` scrolls vertically. The `orientation` prop wins when both are set. @default "x" */
  readonly axis?: "x" | "y" | undefined;
  /** Reading direction. The `dir` prop wins when both are set. @default none (inherited from the page) */
  readonly direction?: Direction | undefined;
}

/**
 * The control handle that `setApi` receives, shaped like the parts of Embla's API that carousels use
 * most: moving, asking where it is and listening for slide changes.
 * @since 1.0.0
 */
export interface CarouselApi {
  /** Moves to the previous slide (wraps when looping, stays at the first otherwise). */
  readonly scrollPrev: () => void;
  /** Moves to the next slide (wraps when looping, stays at the last otherwise). */
  readonly scrollNext: () => void;
  /** Moves to the slide at `index` (clamped, or wrapped when looping). */
  readonly scrollTo: (index: number) => void;
  /** True when a previous slide exists, always true while looping. */
  readonly canScrollPrev: () => boolean;
  /** True when a next slide exists, always true while looping. */
  readonly canScrollNext: () => boolean;
  /** The index of the current slide. */
  readonly selectedScrollSnap: () => number;
  /** One entry per slide: its index. */
  readonly scrollSnapList: () => number[];
  /** Listens to `"select"` (the current slide changed) or `"reInit"` (the slide count changed). */
  readonly on: (event: CarouselEvent, listener: () => void) => CarouselApi;
  /** Removes a listener added with {@link CarouselApi.on}. */
  readonly off: (event: CarouselEvent, listener: () => void) => CarouselApi;
}

/** The events of {@link CarouselApi.on}. @since 1.0.0 */
export type CarouselEvent = "select" | "reInit";

/**
 * Props of {@link Carousel}: the attributes of a `section` plus the props below.
 * @since 1.0.0
 * @see {@link Carousel}
 */
export interface CarouselProps extends ComponentProps<"section"> {
  /**
   * shadcn-style options: `loop`, `startIndex`, `axis` and `direction`. The matching props win.
   * @default none
   */
  readonly opts?: CarouselOptions | undefined;
  /**
   * Called once after mount with a {@link CarouselApi}, to move the slides from outside and to follow
   * them (`api.on("select", ...)`).
   * @default none
   */
  readonly setApi?: ((api: CarouselApi) => void) | undefined;
  /**
   * The axis the slides scroll along. With `"vertical"` the up and down arrows move the slides.
   * @default "horizontal"
   */
  readonly orientation?: CarouselOrientation | undefined;
  /**
   * Wrap from the last slide to the first, and back. The buttons are never disabled while looping.
   * @default false
   */
  readonly loop?: boolean | undefined;
  /**
   * Milliseconds between slides when the carousel plays itself. Autoplay is off unless you set it.
   * It never runs when the user prefers reduced motion, and it pauses while the pointer is over the
   * carousel or focus is inside it.
   * @default none (autoplay off)
   */
  readonly autoplay?: number | undefined;
  /**
   * Called with the slide index after the carousel moves.
   * @default none
   */
  readonly onIndexChange?: ((index: number) => void) | undefined;
  /**
   * Reading direction. `"rtl"` swaps the horizontal arrow keys and the scroll origin. When unset,
   * the direction is inherited from the page.
   * @default none (inherited from the page)
   */
  readonly dir?: Direction | undefined;
  /**
   * The text of the buttons, the slide names and the indicators. See {@link CarouselLabels}.
   * @default none (the English defaults of {@link CarouselLabels})
   */
  readonly labels?: CarouselLabels | undefined;
}

/**
 * A set of slides you move through with buttons, the arrow keys, the indicators, a drag or
 * (opt-in) autoplay. The slides scroll with native scroll-snap, so touch and wheel work as usual.
 * The arrows, indicators and drag only steer that scroll. No carousel library is needed.
 *
 * Keyboard and ARIA: the carousel is a `section` with `role="region"` and
 * `aria-roledescription="carousel"`. Give it an `aria-label` that names it. Left and Right move to
 * the next or previous slide (Up and Down when vertical, and the keys swap in right-to-left
 * layouts). Home and End go to the first and last slide. The keys work while focus is anywhere
 * inside the carousel, including on its buttons. The scrolling viewport is a tab stop, and each
 * slide is a `role="group"` with `aria-roledescription="slide"`, named "n of N" once the carousel
 * has mounted in the browser. The buttons are named "Previous slide" and "Next slide", and each
 * indicator is a button named "Go to slide N" with `aria-current="true"` on the current slide.
 *
 * Compared with shadcn/ui: the carousel does not use Embla. `opts` takes `loop`, `startIndex`, `axis`
 * and `direction` (the matching props win), `setApi` hands over a small {@link CarouselApi}
 * (`scrollPrev`, `scrollNext`, `scrollTo`, `canScrollPrev`, `canScrollNext`, `selectedScrollSnap`,
 * `scrollSnapList`, `on` and `off` for `"select"` and `"reInit"`), and there are no `plugins`: give
 * `autoplay` a number of milliseconds. `onIndexChange` also follows the slide. `class` replaces `className`.
 *
 * @param props - The carousel props: see {@link CarouselProps}.
 * @returns The carousel region.
 * @example
 * ```tsx
 * import {
 *   Carousel,
 *   CarouselContent,
 *   CarouselIndicators,
 *   CarouselItem,
 *   CarouselNext,
 *   CarouselPrevious,
 * } from "@/components/ui/carousel";
 *
 * export function Featured() {
 *   return (
 *     <Carousel aria-label="Featured" loop>
 *       <CarouselContent>
 *         <CarouselItem>One</CarouselItem>
 *         <CarouselItem>Two</CarouselItem>
 *       </CarouselContent>
 *       <CarouselPrevious />
 *       <CarouselNext />
 *       <CarouselIndicators />
 *     </Carousel>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CarouselContent}
 * @see {@link CarouselItem}
 * @see {@link CarouselPrevious}
 * @see {@link CarouselNext}
 * @see {@link CarouselIndicators}
 * @see {@link CarouselProps}
 */
function Carousel(props: CarouselProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "class",
    "opts",
    "setApi",
    "orientation",
    "loop",
    "autoplay",
    "onIndexChange",
    "dir",
    "labels",
    "onKeyDown",
    "onPointerEnter",
    "onPointerLeave",
    "onFocusIn",
    "onFocusOut",
    "children",
  ]);
  const opts = (): CarouselOptions => (local.opts as CarouselOptions | undefined) ?? {};
  const orientation = (): CarouselOrientation =>
    (local.orientation as CarouselOrientation | undefined) ??
    (opts().axis === "y" ? "vertical" : "horizontal");
  // A dir attribute above the carousel applies when there is no prop or option: found after mount.
  const [regionElement, setRegionElement] = useRefSignal<HTMLElement>();
  let regionNode: HTMLElement | undefined;
  const dir = useDirectionAround(
    () => (local.dir as Direction | undefined) ?? opts().direction,
    regionElement,
  );
  const listeners: Record<CarouselEvent, Set<() => void>> = {
    select: new Set(),
    reInit: new Set(),
  };
  const emit = (event: CarouselEvent): void => {
    for (const listener of [...listeners[event]]) listener();
  };
  const [index, setIndexState] = useSignal(0);
  const [count, setCount] = useSignal(0);
  const [paused, setPaused] = useSignal(false);
  const [ready, setReady] = useSignal(false);
  let viewport: HTMLElement | undefined;
  let claimed = 0;
  // The slide a programmatic move is heading for, until the scroll arrives there. While it is set,
  // the intermediate positions of a smooth scroll do not move the index back.
  let pending: number | undefined;
  let scheduled = false;
  const loops = (): boolean => ((local.loop as boolean | undefined) ?? opts().loop) === true;
  const t = useUiStrings();
  const labels = (): ResolvedLabels => resolveLabels(local.labels as CarouselLabels | undefined, t);

  const setIndex = (next: number): void => {
    const changed = next !== index();
    setIndexState(next);
    (local.onIndexChange as ((index: number) => void) | undefined)?.(next);
    if (changed) emit("select");
  };
  const slideSize = (): number => {
    if (viewport === undefined) return 0;
    return orientation() === "vertical" ? viewport.clientHeight : viewport.clientWidth;
  };
  const scrollPosition = (): number => {
    if (viewport === undefined) return 0;
    return orientation() === "vertical" ? viewport.scrollTop : Math.abs(viewport.scrollLeft);
  };
  /** Recomputes the index from where the viewport rests. Right-to-left offsets are negative. */
  const syncIndex = (): void => {
    if (viewport === undefined) return;
    const size = slideSize();
    if (size <= 0) return;
    const position = scrollPosition();
    if (pending !== undefined) {
      if (Math.abs(position - pending * size) >= 1) return;
      pending = undefined;
    }
    const nearest = slideIndexAt(position, size, count());
    if (nearest !== index()) setIndex(nearest);
  };
  const scrolled = (): void => {
    if (scheduled) return;
    scheduled = true;
    if (typeof requestAnimationFrame !== "function") {
      scheduled = false;
      syncIndex();
      return;
    }
    requestAnimationFrame(() => {
      scheduled = false;
      syncIndex();
    });
  };
  const scrollToIndex = (target: number, instant = false): void => {
    const total = count();
    if (total === 0) return;
    const bounded = loops()
      ? ((target % total) + total) % total
      : Math.min(total - 1, Math.max(0, target));
    setIndex(bounded);
    if (viewport === undefined) return;
    const reduced =
      instant ||
      (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
    const position = bounded * slideSize();
    const sign = orientation() === "horizontal" && dir() === "rtl" ? -1 : 1;
    pending = Math.abs(scrollPosition() - position) < 1 ? undefined : bounded;
    if (orientation() === "vertical") {
      viewport.scrollTo?.({ top: position, behavior: reduced ? "auto" : "smooth" });
      if (typeof viewport.scrollTo !== "function") viewport.scrollTop = position;
    } else {
      viewport.scrollTo?.({ left: position * sign, behavior: reduced ? "auto" : "smooth" });
      if (typeof viewport.scrollTo !== "function") viewport.scrollLeft = position * sign;
    }
  };
  const canPrevious = (): boolean => loops() || index() > 0;
  const canNext = (): boolean => loops() || index() < count() - 1;

  const context: CarouselContextValue = {
    orientation,
    dir,
    index,
    count,
    canPrevious,
    canNext,
    scrollToIndex,
    previous: () => {
      if (canPrevious()) scrollToIndex(index() - 1);
    },
    next: () => {
      if (canNext()) scrollToIndex(index() + 1);
    },
    setViewport(element) {
      viewport = element;
    },
    claimSlide() {
      const slot = claimed;
      claimed += 1;
      return slot;
    },
    registerCount() {
      const changed = claimed !== count();
      setCount(claimed);
      if (changed && ready()) emit("reInit");
    },
    pause: (value) => setPaused(value),
    labels,
    ready,
    scrolled,
    userMoved: () => {
      pending = undefined;
    },
  };

  const api: CarouselApi = {
    scrollPrev: () => context.previous(),
    scrollNext: () => context.next(),
    scrollTo: (target) => scrollToIndex(target),
    canScrollPrev: canPrevious,
    canScrollNext: canNext,
    selectedScrollSnap: index,
    scrollSnapList: () => Array.from({ length: count() }, (_, slide) => slide),
    on(event, listener) {
      listeners[event].add(listener);
      return api;
    },
    off(event, listener) {
      listeners[event].delete(listener);
      return api;
    },
  };

  onMount(() => {
    setRegionElement(regionNode);
    setReady(true);
    const start = opts().startIndex;
    if (start !== undefined && start > 0) scrollToIndex(start, true);
    (local.setApi as ((api: CarouselApi) => void) | undefined)?.(api);
  });

  // Autoplay is opt-in, and never runs when the user asks for less motion. It follows the
  // `autoplay` prop: changing it retimes the interval, and removing it stops the interval.
  useEffect(() => {
    const interval = local.autoplay as number | undefined;
    if (interval === undefined || interval <= 0) return undefined;
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const timer = setInterval(() => {
      if (paused()) return;
      if (canNext()) scrollToIndex(index() + 1);
      else if (loops()) scrollToIndex(0);
    }, interval);
    return () => clearInterval(timer);
  });

  const onKeyDown = (event: KeyboardEvent): void => {
    const horizontal = orientation() === "horizontal";
    const forward = horizontal ? (dir() === "rtl" ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
    const back = horizontal ? (dir() === "rtl" ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
    if (event.key === forward) {
      event.preventDefault();
      context.next();
    } else if (event.key === back) {
      event.preventDefault();
      context.previous();
    } else if (event.key === "Home") {
      event.preventDefault();
      scrollToIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      scrollToIndex(count() - 1);
    }
  };

  return (
    <carouselContext.Provider value={context}>
      <section
        ref={(node: HTMLElement) => {
          regionNode = node;
        }}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        data-orientation={orientation()}
        dir={local.dir as Direction | undefined}
        class={cn("relative", local.class)}
        onKeyDown={(event: KeyboardEvent) => {
          onKeyDown(event);
          (local.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event);
        }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusIn={() => setPaused(true)}
        onFocusOut={() => setPaused(false)}
        {...rest}
      >
        {local.children as JSX.Element}
      </section>
    </carouselContext.Provider>
  );
}

/**
 * The scrolling row of slides. Dragging it with the mouse scrolls it and snaps to the nearest slide
 * when released; touch and the wheel scroll natively. It renders a focusable `div`, so keyboard
 * users can focus the slides and scroll them.
 *
 * @param props - The content props: `children`, `class`, and the `div` attributes.
 * @returns The viewport element.
 * @example
 * ```tsx
 * import {
 *   Carousel,
 *   CarouselContent,
 *   CarouselItem,
 * } from "@/components/ui/carousel";
 *
 * export function Slides() {
 *   return (
 *     <Carousel aria-label="Photos">
 *       <CarouselContent>
 *         <CarouselItem>First photo</CarouselItem>
 *         <CarouselItem>Second photo</CarouselItem>
 *       </CarouselContent>
 *     </Carousel>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Carousel}
 * @see {@link CarouselItem}
 */
function CarouselContent(props: ComponentProps<"div">): JSX.Element {
  const carousel = carouselContext.use("CarouselContent");
  const [local, rest] = splitProps(props, ["class", "onPointerDown", "onScroll", "onWheel"]);
  let stopDrag: (() => void) | undefined;
  onCleanup(() => stopDrag?.());
  return (
    <div
      data-slot="carousel-content"
      ref={(element: HTMLElement) => carousel.setViewport(element)}
      tabindex={0}
      class={cn(
        "flex overflow-hidden snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        carousel.orientation() === "vertical"
          ? "flex-col snap-y overflow-y-auto"
          : "snap-x overflow-x-auto",
        local.class,
      )}
      onScroll={(event: Event) => {
        (local.onScroll as ((event: Event) => void) | undefined)?.(event);
        carousel.scrolled();
      }}
      onWheel={(event: WheelEvent) => {
        (local.onWheel as ((event: WheelEvent) => void) | undefined)?.(event);
        carousel.userMoved();
      }}
      onPointerDown={(event: PointerEvent) => {
        (local.onPointerDown as ((event: PointerEvent) => void) | undefined)?.(event);
        carousel.userMoved();
        if (event.button !== 0 || event.pointerType === "touch") return;
        const element = event.currentTarget as HTMLElement;
        const vertical = carousel.orientation() === "vertical";
        const start = vertical ? event.clientY : event.clientX;
        const origin = vertical ? element.scrollTop : element.scrollLeft;
        // The content follows the pointer in both directions. Under right-to-left the scroll
        // offsets are negative, so a drag to the right (toward the next slide) lowers the offset.
        const move = (moveEvent: PointerEvent): void => {
          const delta = (vertical ? moveEvent.clientY : moveEvent.clientX) - start;
          if (vertical) element.scrollTop = origin - delta;
          else element.scrollLeft = origin - delta;
        };
        const end = (): void => {
          stopDrag?.();
          const size = vertical ? element.clientHeight : element.clientWidth;
          const current = vertical ? element.scrollTop : Math.abs(element.scrollLeft);
          carousel.scrollToIndex(slideIndexAt(current, size, carousel.count()));
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", end);
        stopDrag = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", end);
          stopDrag = undefined;
        };
      }}
      {...rest}
    />
  );
}

/**
 * One slide. It takes the full width (or height) of the row. It is a `role="group"` with
 * `aria-roledescription="slide"`, and it is named "n of N" (see {@link CarouselLabels}). The name is
 * set once the carousel has mounted in the browser, so the server markup has no slide name.
 *
 * @param props - The slide props: `children`, `class`, and the `div` attributes.
 * @returns The slide element.
 * @example
 * ```tsx
 * import {
 *   Carousel,
 *   CarouselContent,
 *   CarouselItem,
 * } from "@/components/ui/carousel";
 *
 * export function Slide() {
 *   return (
 *     <Carousel aria-label="Tips">
 *       <CarouselContent>
 *         <CarouselItem class="flex h-40 items-center justify-center">Tip one</CarouselItem>
 *       </CarouselContent>
 *     </Carousel>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CarouselContent}
 * @see {@link CarouselLabels}
 */
function CarouselItem(props: ComponentProps<"div">): JSX.Element {
  const carousel = carouselContext.use("CarouselItem");
  const [local, rest] = splitProps(props, ["class"]);
  const slot = carousel.claimSlide();
  // Registered during render, so the server HTML lists one indicator per slide (UI-CRS-09). The
  // count is only complete after the last slide renders, and the server pass renders each slide
  // before the next one is counted; so a slide is named only once the carousel is mounted, and
  // the name then uses the final count (UI-CRS-18).
  carousel.registerCount();
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={
        carousel.ready() ? carousel.labels().slide(slot + 1, carousel.count()) : undefined
      }
      data-slot="carousel-item"
      class={cn(
        "min-w-0 shrink-0 grow-0 basis-full snap-start",
        carousel.orientation() === "vertical" ? "pt-4" : "ps-4",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The button that goes back one slide. It is disabled at the first slide unless the carousel loops.
 * It is a shadcn-style outline icon button, named "Previous slide" by default.
 *
 * Keyboard and ARIA: a native button, so Enter and Space activate it. Its accessible name comes
 * from `labels.previous`. It is disabled (`disabled`) at the first slide.
 *
 * @param props - The button props: `onClick`, `class`, and the attributes of the button.
 * @returns The previous button.
 * @example
 * ```tsx
 * import {
 *   Carousel,
 *   CarouselContent,
 *   CarouselItem,
 *   CarouselPrevious,
 * } from "@/components/ui/carousel";
 *
 * export function Back() {
 *   return (
 *     <Carousel aria-label="Tips">
 *       <CarouselContent>
 *         <CarouselItem>Tip one</CarouselItem>
 *       </CarouselContent>
 *       <CarouselPrevious />
 *     </Carousel>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CarouselNext}
 * @see {@link Carousel}
 */
function CarouselPrevious(props: ComponentProps<"button">): JSX.Element {
  const carousel = carouselContext.use("CarouselPrevious");
  const [local, rest] = splitProps(props, ["class", "onClick"]);
  return (
    <Button
      data-slot="carousel-previous"
      variant="outline"
      size="icon"
      aria-label={carousel.labels().previous}
      class={cn(
        "absolute size-8 rounded-full",
        carousel.orientation() === "vertical"
          ? "-top-12 start-1/2 -translate-x-1/2 rotate-90"
          : "top-1/2 -start-12 -translate-y-1/2 rtl:translate-x-1/2",
        local.class,
      )}
      disabled={!carousel.canPrevious()}
      onClick={(event: MouseEvent) => {
        (local.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
        carousel.previous();
      }}
      {...rest}
    >
      {carousel.orientation() === "vertical" ? (
        <ChevronUpIcon />
      ) : (
        <ChevronLeftIcon class="rtl:-scale-x-100" />
      )}
    </Button>
  );
}

/**
 * The button that goes forward one slide. It is disabled at the last slide unless the carousel
 * loops. It is a shadcn-style outline icon button, named "Next slide" by default.
 *
 * Keyboard and ARIA: a native button, so Enter and Space activate it. Its accessible name comes
 * from `labels.next`. It is disabled (`disabled`) at the last slide.
 *
 * @param props - The button props: `onClick`, `class`, and the attributes of the button.
 * @returns The next button.
 * @example
 * ```tsx
 * import {
 *   Carousel,
 *   CarouselContent,
 *   CarouselItem,
 *   CarouselNext,
 * } from "@/components/ui/carousel";
 *
 * export function Forward() {
 *   return (
 *     <Carousel aria-label="Tips">
 *       <CarouselContent>
 *         <CarouselItem>Tip one</CarouselItem>
 *       </CarouselContent>
 *       <CarouselNext />
 *     </Carousel>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CarouselPrevious}
 * @see {@link Carousel}
 */
function CarouselNext(props: ComponentProps<"button">): JSX.Element {
  const carousel = carouselContext.use("CarouselNext");
  const [local, rest] = splitProps(props, ["class", "onClick"]);
  return (
    <Button
      data-slot="carousel-next"
      variant="outline"
      size="icon"
      aria-label={carousel.labels().next}
      class={cn(
        "absolute size-8 rounded-full",
        carousel.orientation() === "vertical"
          ? "-bottom-12 start-1/2 -translate-x-1/2 rotate-90"
          : "top-1/2 -end-12 -translate-y-1/2 rtl:-translate-x-1/2",
        local.class,
      )}
      disabled={!carousel.canNext()}
      onClick={(event: MouseEvent) => {
        (local.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
        carousel.next();
      }}
      {...rest}
    >
      {carousel.orientation() === "vertical" ? (
        <ChevronDownIcon />
      ) : (
        <ChevronRightIcon class="rtl:-scale-x-100" />
      )}
    </Button>
  );
}

/**
 * One dot per slide. The current slide's dot is marked, and each dot is a button that goes to its
 * slide.
 *
 * Keyboard and ARIA: each dot is a native `button` (Tab to reach it, Enter and Space to use it),
 * named "Go to slide N" by default (see {@link CarouselLabels}). The current dot has
 * `aria-current="true"` and `data-state="active"`.
 *
 * @param props - The indicators props: `class` and the `div` attributes.
 * @returns The indicators container.
 * @example
 * ```tsx
 * import {
 *   Carousel,
 *   CarouselContent,
 *   CarouselIndicators,
 *   CarouselItem,
 * } from "@/components/ui/carousel";
 *
 * export function Dots() {
 *   return (
 *     <Carousel aria-label="Tips">
 *       <CarouselContent>
 *         <CarouselItem>Tip one</CarouselItem>
 *         <CarouselItem>Tip two</CarouselItem>
 *       </CarouselContent>
 *       <CarouselIndicators />
 *     </Carousel>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Carousel}
 */
function CarouselIndicators(props: ComponentProps<"div">): JSX.Element {
  const carousel = carouselContext.use("CarouselIndicators");
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="carousel-indicators"
      class={cn("mt-3 flex justify-center gap-1.5", local.class)}
      {...rest}
    >
      {Array.from({ length: carousel.count() }, (_, slide) => (
        <button
          type="button"
          data-slot="carousel-indicator"
          aria-label={carousel.labels().goToSlide(slide + 1)}
          aria-current={carousel.index() === slide ? "true" : undefined}
          data-state={carousel.index() === slide ? "active" : "inactive"}
          class="group inline-flex size-6 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
          onClick={() => carousel.scrollToIndex(slide)}
        >
          <span
            aria-hidden="true"
            class="size-2 rounded-full bg-muted-foreground/40 transition-colors group-data-[state=active]:bg-primary forced-colors:border forced-colors:border-[ButtonText] forced-colors:group-data-[state=active]:bg-[Highlight] motion-reduce:transition-none"
          />
        </button>
      ))}
    </div>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselIndicators,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
};
