// biome-ignore-all lint/a11y/noAriaHiddenOnFocusable: the SVG drawing parts that are hidden (grid, labels, shapes) are never focusable; the rule cannot tell them from interactive elements
// biome-ignore-all lint/a11y/noInteractiveElementToNoninteractiveRole: a data point is a focus stop that carries a name, the pattern charting libraries use for keyboard access to points
import {
  type Accessor,
  children,
  onCleanup,
  onMount,
  splitProps,
  useMemo,
  useSignal,
} from "@shadow-js/core";
import {
  createPartContext,
  type Direction,
  getRovingTarget,
  useDirection,
  useDirectionAround,
  useRefSignal,
} from "@shadow-js/primitives";
import { type ComponentProps, For, type JSX, Show } from "@shadow-js/web";
import {
  arcPath,
  areaPath,
  bandPositions,
  type ChartCurve,
  cssKey,
  decimateIndices,
  linearScale,
  linePath,
  nearestIndex,
  niceDomain,
  niceMax,
  niceTicks,
  pieAngles,
  pointPositions,
  polarPoint,
  slicePath,
  stackColumns,
} from "@/lib/chart-scale";
import { useUiLocale, useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

export { areaPath, linearScale, linePath, nearestIndex, niceMax, polarPoint, slicePath };

/**
 * An icon for a series, drawn instead of the color swatch in the legend and the tooltip. Any component
 * that takes a `class` and renders an inline SVG fits, such as the icons of `@/components/ui/icons`.
 * @see {@link ChartConfig}
 * @since 1.0.0
 */
export type ChartIcon = (props: { readonly class?: string }) => JSX.Element;

/**
 * The series of a chart, keyed by the data key of each series (or by the name of each slice of a pie).
 * Each series has a `label` for the legend and the tooltip, an optional `color` and an optional `icon`.
 * Without a color a series uses the theme's `--chart-1` to `--chart-5` tokens, in order, cycling.
 * @see {@link ChartContainer}
 * @since 1.0.0
 */
export type ChartConfig = Readonly<
  Record<
    string,
    {
      /** The name shown in the legend and the tooltip. */
      readonly label: string;
      /** Any CSS color. @default the theme's `--chart-1` to `--chart-5`, by series position */
      readonly color?: string | undefined;
      /** An icon shown instead of the color swatch. @default none */
      readonly icon?: ChartIcon | undefined;
    }
  >
>;

/**
 * One row of chart data: an object with the category value (`xKey`, or `nameKey` for a pie) and one
 * numeric value per series key.
 * @see {@link ChartSeriesProps}
 * @since 1.0.0
 */
export type ChartDatum = Readonly<Record<string, unknown>>;

/** The color of a series: its config color, else a theme chart token. @internal */
function seriesColor(config: ChartConfig, key: string, index: number): string {
  return config[key]?.color ?? `var(--chart-${(index % 5) + 1})`;
}

/** The label of a series. @internal */
function seriesLabel(config: ChartConfig, key: string): string {
  return config[key]?.label ?? key;
}

/** A value as a finite number: anything else counts as zero. @internal */
function num(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

/** Most data points drawn before a series is thinned. @internal */
const DEFAULT_MAX_POINTS = 5000;
/** Most rows in the table for screen readers. @internal */
const TABLE_LIMIT = 500;
/** Most points that get a focus target each; past it the chart itself is the one tab stop. @internal */
const TARGET_LIMIT = 200;

/** What a chart container shares with the charts inside it. @internal */
interface ChartContextValue {
  readonly config: Accessor<ChartConfig>;
  readonly width: Accessor<number>;
  readonly dir: Accessor<Direction>;
  readonly locale: Accessor<string>;
  readonly format: Accessor<Intl.NumberFormat>;
}

const chartContext = createPartContext<ChartContextValue>("ChartContainer");

/** A number format for a locale; an invalid locale tag falls back to US English. @internal */
function makeFormat(locale: string): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  }
}

/** The settings of the container above, or those of a chart that has none. @internal */
function useEnvironment(): ChartContextValue {
  const container = chartContext.useOptional();
  const uiLocale = useUiLocale();
  const direction = useDirection();
  const locale = (): string => uiLocale() ?? "en-US";
  const format = useMemo(() => makeFormat(locale()));
  return (
    container ?? {
      config: () => ({}),
      width: () => 600,
      dir: direction,
      locale,
      format,
    }
  );
}

/**
 * Props of {@link ChartContainer}: the series configuration and the initial width, plus the attributes of
 * the rendered `div`.
 * @see {@link ChartContainer}
 * @since 1.0.0
 */
export interface ChartContainerProps extends ComponentProps<"div"> {
  /**
   * The series: a label, and optionally a color and an icon, for each key used in the data.
   * @default none (required)
   */
  readonly config: ChartConfig;
  /**
   * The width in pixels used before the container is measured. The charts then follow the measured width.
   * @default 600
   */
  readonly initialWidth?: number | undefined;
  /**
   * The language of the numbers (axis labels, tooltip, table), such as `"ar-EG"` for Arabic-Indic digits.
   * Pass it explicitly when the server and the browser could disagree about the default.
   * @default the locale of the UI strings provider, else `"en-US"`
   */
  readonly locale?: string | undefined;
  /**
   * The reading direction. In right-to-left text the x axis runs from right to left, the y axis sits on the
   * right, and the arrow keys follow what is on screen.
   * @default a direction provider, else the nearest `dir` attribute above the chart, else the document's
   */
  readonly dir?: Direction | undefined;
}

/**
 * The frame of a chart. It measures its own width with a `ResizeObserver` (started after mount, and
 * disconnected when the container is removed), so the charts inside fit it, and it gives each series
 * color to the charts inside as the `--color-<key>` CSS variable. It also gives them the locale of the
 * numbers and the reading direction. Put one or more charts inside it.
 *
 * Keyboard and ARIA: the container has no role. Each chart is an `svg` named by its kind and series
 * (`role="group"` with `aria-roledescription="chart"`), whose data points are one roving tab stop: the
 * arrow keys move between them (they follow the screen in right-to-left text), Home and End jump to the
 * ends, and Escape hides the tooltip. The focused point is announced through a polite live region. A
 * visually hidden table holds every value for screen readers.
 *
 * shadcn/ui differences: the prop is `class`, not `className`, and every part has a `data-slot`. The chart
 * is drawn by ShadowJS with no charting library, so `ChartTooltip` and `ChartLegend` are parts of one of the
 * chart components below instead of Recharts children, and a color is one CSS color (no `theme` pair: use a
 * token such as `var(--chart-1)` that follows the theme).
 *
 * @param props The container props: see {@link ChartContainerProps}.
 * @returns The container.
 * @example
 * import { ChartArea, ChartContainer } from "@/components/ui/chart";
 *
 * const rows = [
 *   { day: "Mon", visits: 120 },
 *   { day: "Tue", visits: 180 },
 * ];
 *
 * export function Visits() {
 *   return (
 *     <ChartContainer config={{ visits: { label: "Visits" } }}>
 *       <ChartArea data={rows} xKey="day" series={["visits"]} />
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartArea}
 * @see {@link ChartConfig}
 * @since 1.0.0
 */
function ChartContainer(props: ChartContainerProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "class",
    "config",
    "initialWidth",
    "locale",
    "dir",
    "children",
  ]);
  const uiLocale = useUiLocale();
  // A NaN or Infinity width would put "NaN" into every path; fall back to the default instead.
  const initial = local.initialWidth as number | undefined;
  const [width, setWidth] = useSignal<number>(
    initial !== undefined && Number.isFinite(initial) ? initial : 600,
  );
  const [element, setElement] = useRefSignal<HTMLElement>();
  let node: HTMLElement | undefined;
  const dir = useDirectionAround(() => local.dir as Direction | undefined, element);
  const config = (): ChartConfig => local.config as ChartConfig;
  const locale = (): string => (local.locale as string | undefined) ?? uiLocale() ?? "en-US";
  const format = useMemo(() => makeFormat(locale()));
  // Started after mount, so the server render and the first client render measure nothing.
  onMount(() => {
    setElement(node);
    if (node === undefined || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width ?? 0;
      if (measured > 0) setWidth(Math.round(measured));
    });
    observer.observe(node);
    onCleanup(() => observer.disconnect());
  });
  const variables = (): Record<string, string> => {
    const entries = Object.keys(config()).map((key, index) => [
      `--color-${cssKey(key)}`,
      seriesColor(config(), key, index),
    ]);
    return Object.fromEntries(entries);
  };
  return (
    <chartContext.Provider value={{ config, width, dir, locale, format }}>
      <div
        data-slot="chart-container"
        ref={(created: HTMLElement) => {
          node = created;
        }}
        style={variables()}
        class={cn("flex w-full justify-center text-xs", local.class)}
        {...rest}
      >
        {local.children as JSX.Element}
      </div>
    </chartContext.Provider>
  );
}

/**
 * One line of the tooltip: a series and its value at the active point. {@link ChartTooltipContent} draws
 * one for each series, and its `formatter` receives it.
 * @see {@link ChartTooltipContent}
 * @since 1.0.0
 */
export interface ChartTooltipRow {
  /** The data key of the series (the name of the slice in a pie). */
  readonly key: string;
  /** The label of the series from the chart config. */
  readonly label: string;
  /** The color of the series. */
  readonly color: string;
  /** The icon of the series from the chart config, if it has one. */
  readonly icon: ChartIcon | undefined;
  /** The value. */
  readonly value: number;
  /** The value as text, in the locale of the chart (or from `valueFormatter`). */
  readonly text: string;
  /** The share of the whole as text (`"55%"`), for the slices of a pie. Absent elsewhere. */
  readonly share: string | undefined;
}

/**
 * The data point a pointer or the keyboard is on, as the tooltip, the legend and the live region see it.
 * @see {@link ChartTooltipContent}
 * @since 1.0.0
 */
export interface ChartActivePoint {
  /** The position of the point among the points that are drawn. */
  readonly index: number;
  /** The category of the point (the x value); empty for a pie and a radial chart. */
  readonly label: string;
  /** The values at the point, one for each series. */
  readonly rows: readonly ChartTooltipRow[];
  /** The text the live region announces. */
  readonly text: string;
  /** The inline style that places the tooltip next to the point. */
  readonly style: Readonly<Record<string, string>>;
}

/** One entry of the legend. @internal */
interface ChartLegendItem {
  readonly key: string;
  readonly label: string;
  readonly color: string;
  readonly icon: ChartIcon | undefined;
}

/** What a chart shares with its tooltip and legend parts. @internal */
interface ChartPlotValue {
  readonly items: Accessor<readonly ChartLegendItem[]>;
  readonly active: Accessor<ChartActivePoint | undefined>;
  /** Set by the parts, while they render, so the chart knows not to draw its default ones. */
  readonly slots: { tooltip: boolean; legend: boolean };
}

const plotContext = createPartContext<ChartPlotValue>("Chart");

/** The state of the active point and the keys, the pointer and the focus that move it. @internal */
function useActivePoint(options: {
  readonly count: Accessor<number>;
  readonly dir: Accessor<Direction>;
  readonly targets: Accessor<boolean>;
  readonly root: Accessor<Element | undefined>;
}) {
  const [active, setActive] = useSignal(-1);
  const [current, setCurrent] = useSignal(0);
  let focusInside = false;
  let pointerInside = false;

  const goTo = (index: number): void => {
    setCurrent(index);
    setActive(index);
    if (options.targets()) {
      const target = options.root()?.querySelector<SVGElement>(`[data-chart-point="${index}"]`);
      target?.focus({ preventScroll: true });
    }
  };

  return {
    active,
    current,
    show: (index: number): void => {
      pointerInside = true;
      if (index !== active()) setActive(index);
    },
    clear: (): void => {
      setActive(-1);
    },
    leave: (touch: boolean): void => {
      pointerInside = false;
      // A finger that lifts leaves the chart at once; its tooltip stays until the next tap elsewhere.
      if (!touch && !focusInside) setActive(-1);
    },
    focusIn: (index: number | undefined): void => {
      focusInside = true;
      if (index !== undefined) {
        setCurrent(index);
        setActive(index);
      }
    },
    focusOut: (): void => {
      focusInside = false;
      if (!pointerInside) setActive(-1);
    },
    key: (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        if (active() >= 0) setActive(-1);
        return;
      }
      const count = options.count();
      if (count === 0) return;
      const from = active() >= 0 ? active() : options.targets() ? current() : -1;
      const next = getRovingTarget({
        key: event.key,
        orientation: "horizontal",
        dir: options.dir(),
        loop: false,
        disabled: new Array<boolean>(count).fill(false),
        current: from,
      });
      if (next === undefined) return;
      event.preventDefault();
      goTo(next);
    },
  };
}

/** Hides the active point when a pointer goes down anywhere outside the chart (a tap elsewhere). @internal */
function dismissOutside(root: Accessor<Element | undefined>, clear: () => void): void {
  onMount(() => {
    const listener = (event: Event): void => {
      const element = root();
      if (element !== undefined && !element.contains(event.target as Node | null)) clear();
    };
    document.addEventListener("pointerdown", listener);
    onCleanup(() => document.removeEventListener("pointerdown", listener));
  });
}

/**
 * Props of the cartesian charts: {@link ChartArea}, {@link ChartLine} and {@link ChartBar}. They take the
 * rows, the category key, the series keys and the layout, plus the attributes of the rendered `figure`.
 * `children` may hold a {@link ChartTooltip} and a {@link ChartLegend}, which replace the default ones.
 * @see {@link ChartArea}
 * @since 1.0.0
 */
export interface ChartSeriesProps extends ComponentProps<"figure"> {
  /**
   * The rows to draw, in order along the x axis. The y axis starts at zero (and goes below it for negative
   * values) unless `yDomain` says otherwise. A very long series is thinned for drawing: see `maxPoints`.
   * @default none (required)
   */
  readonly data: readonly ChartDatum[];
  /**
   * The key of the category (x) value in each row, such as `"month"`.
   * @default none (required)
   */
  readonly xKey: string;
  /**
   * The keys of the series to draw, each one a numeric value in the rows.
   * @default none (required)
   */
  readonly series: readonly string[];
  /**
   * The height of the plot in pixels.
   * @default 240
   */
  readonly height?: number | undefined;
  /**
   * Shows the default legend under the chart. A {@link ChartLegend} in `children` replaces it.
   * @default true
   */
  readonly legend?: boolean | undefined;
  /**
   * Shows the default tooltip next to the active point. A {@link ChartTooltip} in `children` replaces it.
   * Turning it off does not silence the live region, which announces the active point either way.
   * @default true
   */
  readonly tooltip?: boolean | undefined;
  /**
   * Grid lines: `true` draws one for each y tick, `"both"` adds one for each x value, `false` draws none.
   * @default true
   */
  readonly grid?: boolean | "both" | undefined;
  /**
   * Shows the x axis (the category labels).
   * @default true
   */
  readonly xAxis?: boolean | undefined;
  /**
   * Shows the y axis (the value labels).
   * @default true
   */
  readonly yAxis?: boolean | undefined;
  /**
   * How a line or an area joins its points: `"linear"`, `"monotone"` (smooth, no overshoot) or `"step"`.
   * Bars ignore it.
   * @default "linear"
   */
  readonly curve?: ChartCurve | undefined;
  /**
   * Stacks the series on top of each other, for bars and areas. The y axis then reaches the sum.
   * @default false
   */
  readonly stacked?: boolean | undefined;
  /**
   * Draws a dot on every point of a line or an area (the active point always has dots).
   * @default false
   */
  readonly dots?: boolean | undefined;
  /**
   * The lowest and the highest value of the y axis, instead of the range of the data.
   * @default the data, rounded to a nice number and including zero
   */
  readonly yDomain?: readonly [number, number] | undefined;
  /**
   * The text of an x label, from the category and its position.
   * @default the category as it is
   */
  readonly xTickFormatter?: ((value: string, index: number) => string) | undefined;
  /**
   * The text of a y label.
   * @default the number in the locale of the chart
   */
  readonly yTickFormatter?: ((value: number) => string) | undefined;
  /**
   * The text of a value in the tooltip, the table and the live region.
   * @default the number in the locale of the chart
   */
  readonly valueFormatter?: ((value: number, key: string) => string) | undefined;
  /**
   * The most points drawn. A longer series is thinned: each run of rows keeps its lowest and highest value
   * of every series, so a spike is never lost, and the first and last rows. The screen reader table is
   * thinned the same way, to at most 500 rows.
   * @default 5000
   */
  readonly maxPoints?: number | undefined;
  /**
   * Draws the cursor (a line, or a band behind a bar) at the active point.
   * @default true
   */
  readonly cursor?: boolean | undefined;
  /**
   * The accessible name of the chart.
   * @default "Line chart of Sales, Returns" (the kind and the series labels, from the UI strings)
   */
  readonly label?: string | undefined;
}

/** A cartesian chart of one kind. @internal */
function Cartesian(
  props: ChartSeriesProps & { readonly kind: "line" | "area" | "bar" },
): JSX.Element {
  const environment = useEnvironment();
  const t = useUiStrings();
  const [local, rest] = splitProps(props, [
    "data",
    "xKey",
    "series",
    "height",
    "legend",
    "tooltip",
    "grid",
    "xAxis",
    "yAxis",
    "curve",
    "stacked",
    "dots",
    "yDomain",
    "xTickFormatter",
    "yTickFormatter",
    "valueFormatter",
    "maxPoints",
    "cursor",
    "label",
    "kind",
    "class",
    "children",
  ]);
  const [svg, setSvg] = useRefSignal<SVGSVGElement>();
  const config = (): ChartConfig => environment.config();
  const width = (): number => environment.width();
  const height = (): number => (local.height as number | undefined) ?? 240;
  const mirrored = (): boolean => environment.dir() === "rtl";
  const keys = (): readonly string[] => local.series as readonly string[];
  const rows = (): readonly ChartDatum[] => local.data as readonly ChartDatum[];
  const xKey = (): string => local.xKey as string;
  const stacked = (): boolean => local.kind !== "line" && local.stacked === true;
  const valueText = (value: number, key: string): string =>
    (local.valueFormatter as ((value: number, key: string) => string) | undefined)?.(value, key) ??
    environment.format().format(value);

  const columns = useMemo(() => keys().map((key) => rows().map((row) => num(row[key]))));
  const limit = (): number =>
    Math.max(2, Math.floor((local.maxPoints as number | undefined) ?? DEFAULT_MAX_POINTS));
  const drawn = useMemo(() => decimateIndices(columns(), limit()));
  const count = (): number => drawn().length;
  const shown = useMemo(() =>
    columns().map((column) => drawn().map((index) => column[index] ?? 0)),
  );
  const labels = useMemo(() => drawn().map((index) => String(rows()[index]?.[xKey()] ?? "")));
  const stack = useMemo(() => stackColumns(shown()));

  const extent = useMemo((): [number, number] => {
    let low = 0;
    let high = 0;
    const lists = stacked() ? [...stack().lower, ...stack().upper] : shown();
    for (const list of lists) {
      for (const value of list) {
        if (value < low) low = value;
        if (value > high) high = value;
      }
    }
    return [low, high];
  });
  const domain = useMemo((): [number, number] => {
    const given = local.yDomain as readonly [number, number] | undefined;
    return given === undefined ? niceDomain(extent()[0], extent()[1]) : [given[0], given[1]];
  });
  const ticks = useMemo(() => {
    const [low, high] = domain();
    return niceTicks(low, high).filter((tick) => tick >= low && tick <= high);
  });
  const tickText = (tick: number): string =>
    (local.yTickFormatter as ((value: number) => string) | undefined)?.(tick) ??
    environment.format().format(tick);

  const padding = { top: 12, end: 12 };
  const bottom = (): number => (local.xAxis === false ? 8 : 28);
  const axisWidth = (): number => {
    if (local.yAxis === false) return 12;
    const longest = ticks().reduce((most, tick) => Math.max(most, tickText(tick).length), 1);
    return Math.max(40, Math.ceil(longest * 7) + 16);
  };
  const plotStart = (): number => (mirrored() ? padding.end : axisWidth());
  const plotEnd = (): number => width() - (mirrored() ? axisWidth() : padding.end);
  const plotBottom = (): number => height() - bottom();
  const yOf = (value: number): number =>
    linearScale([domain()[0], domain()[1]], [plotBottom(), padding.top], value);
  const zero = (): number => yOf(Math.min(Math.max(0, domain()[0]), domain()[1]));

  const layout = useMemo(() => {
    const from = mirrored() ? plotEnd() : plotStart();
    const to = mirrored() ? plotStart() : plotEnd();
    if (local.kind === "bar") {
      const bands = bandPositions(count(), from, to, 0.2);
      return { xs: bands.centers, span: Math.abs(bands.step), group: bands.bandwidth };
    }
    const xs = pointPositions(count(), from, to);
    return {
      xs,
      span: count() <= 1 ? Math.abs(to - from) : Math.abs(to - from) / (count() - 1),
      group: 0,
    };
  });
  const xs = (): readonly number[] => layout().xs;

  const pointsOf = (series: number): Array<[number, number]> => {
    const list = stacked() ? (stack().upper[series] ?? []) : (shown()[series] ?? []);
    return list.map((value, index) => [xs()[index] ?? 0, yOf(value)]);
  };
  const lowerPointsOf = (series: number): Array<[number, number]> | number =>
    stacked()
      ? (stack().lower[series] ?? []).map((value, index) => [xs()[index] ?? 0, yOf(value)])
      : zero();
  const curve = (): ChartCurve => (local.curve as ChartCurve | undefined) ?? "linear";

  const barBox = (
    series: number,
    index: number,
  ): { x: number; y: number; width: number; height: number } => {
    const center = xs()[index] ?? 0;
    if (stacked()) {
      const top = yOf(stack().upper[series]?.[index] ?? 0);
      const base = yOf(stack().lower[series]?.[index] ?? 0);
      return {
        x: center - layout().group / 2,
        y: Math.min(top, base),
        width: layout().group,
        height: Math.abs(base - top),
      };
    }
    const each = layout().group / Math.max(keys().length, 1);
    const offset = (series + 0.5) * each - layout().group / 2;
    const y = yOf(shown()[series]?.[index] ?? 0);
    return {
      x: center + (mirrored() ? -offset : offset) - each / 2,
      y: Math.min(y, zero()),
      width: each,
      height: Math.abs(zero() - y),
    };
  };

  const items = useMemo((): ChartLegendItem[] =>
    keys().map((key, index) => ({
      key,
      label: seriesLabel(config(), key),
      color: seriesColor(config(), key, index),
      icon: config()[key]?.icon,
    })),
  );
  const listSeparator = (): string => t("chart.separator", ", ");

  const targets = (): boolean => count() > 0 && count() <= TARGET_LIMIT;
  const motion = useActivePoint({ count, dir: environment.dir, targets, root: svg });
  dismissOutside(svg, motion.clear);

  const point = useMemo((): ChartActivePoint | undefined => {
    const index = motion.active();
    if (index < 0 || index >= count()) return undefined;
    const label = labels()[index] ?? "";
    const list = items().map((item, series): ChartTooltipRow => {
      const value = shown()[series]?.[index] ?? 0;
      return { ...item, value, text: valueText(value, item.key), share: undefined };
    });
    const values = list
      .map((row) => t("chart.value", "{name}: {value}", { name: row.label, value: row.text }))
      .join(listSeparator());
    const share = (xs()[index] ?? 0) / Math.max(width(), 1);
    return {
      index,
      label,
      rows: list,
      text: t("chart.announce", "{label}: {values}", { label, values }),
      style: {
        left: `${(share * 100).toFixed(2)}%`,
        transform: share > 0.6 ? "translateX(calc(-100% - 0.75rem))" : "translateX(0.75rem)",
      },
    };
  });

  const accessibleName = (): string => {
    const name = local.label as string | undefined;
    if (name !== undefined) return name;
    const series = items()
      .map((item) => item.label)
      .join(listSeparator());
    if (local.kind === "line") return t("chart.label.line", "Line chart of {series}", { series });
    if (local.kind === "area") return t("chart.label.area", "Area chart of {series}", { series });
    return t("chart.label.bar", "Bar chart of {series}", { series });
  };

  const listed = useMemo(() => decimateIndices(columns(), Math.min(limit(), TABLE_LIMIT)));
  const indices = useMemo(() => Array.from({ length: count() }, (_, index) => index));
  const tabStop = (): number => Math.min(motion.current(), Math.max(count() - 1, 0));
  // About as many x labels as fit side by side, from the longest label; the rest are left out.
  const labelRoom = (): number =>
    Math.min(160, 16 + 7 * labels().reduce((most, label) => Math.max(most, label.length), 1));
  const xLabelStep = (): number =>
    Math.max(
      1,
      Math.ceil(count() / Math.max(1, Math.floor((plotEnd() - plotStart()) / labelRoom()))),
    );
  const xTickIndices = useMemo(() => indices().filter((index) => index % xLabelStep() === 0));
  const indexAt = (event: PointerEvent): number => {
    const box = svg()?.getBoundingClientRect();
    if (box === undefined) return -1;
    const x = ((event.clientX - box.left) / Math.max(box.width, 1)) * width();
    return nearestIndex(xs(), x);
  };
  const targetOf = (event: Event): number | undefined => {
    const found = (event.target as Element | null)?.closest?.("[data-chart-point]");
    const index =
      found === null || found === undefined
        ? undefined
        : Number(found.getAttribute("data-chart-point"));
    return index === undefined || Number.isNaN(index) ? undefined : index;
  };

  return (
    <figure
      data-slot="chart"
      data-kind={local.kind}
      class={cn("relative flex w-full flex-col", local.class)}
      {...rest}
    >
      <plotContext.Provider
        value={{ items, active: point, slots: { tooltip: false, legend: false } }}
      >
        <svg
          data-slot="chart-plot"
          ref={(created: SVGSVGElement) => setSvg(created)}
          viewBox={`0 0 ${width()} ${height()}`}
          role="group"
          aria-roledescription={t("chart.roledescription", "chart")}
          aria-label={accessibleName()}
          tabindex={targets() || count() === 0 ? undefined : 0}
          style={{ height: `${height()}px` }}
          class="w-full overflow-visible rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent"
          onPointerMove={(event: PointerEvent) => motion.show(indexAt(event))}
          onPointerDown={(event: PointerEvent) => {
            if (event.pointerType === "touch") motion.show(indexAt(event));
          }}
          onPointerLeave={(event: PointerEvent) => motion.leave(event.pointerType === "touch")}
          onKeyDown={motion.key}
          onFocusIn={(event: FocusEvent) => motion.focusIn(targetOf(event))}
          onFocusOut={motion.focusOut}
        >
          <g aria-hidden="true">
            <For each={local.grid === false ? [] : ticks()}>
              {(tick) => (
                <line
                  data-slot="chart-grid"
                  x1={plotStart()}
                  x2={plotEnd()}
                  y1={yOf(tick)}
                  y2={yOf(tick)}
                  class="stroke-border"
                  stroke-width={1}
                />
              )}
            </For>
            <For each={local.grid === "both" ? indices() : []}>
              {(index) => (
                <line
                  data-slot="chart-grid"
                  x1={xs()[index] ?? 0}
                  x2={xs()[index] ?? 0}
                  y1={padding.top}
                  y2={plotBottom()}
                  class="stroke-border"
                  stroke-width={1}
                />
              )}
            </For>
            <Show when={local.yAxis !== false}>
              <For each={ticks()}>
                {(tick) => (
                  <text
                    data-slot="chart-y-tick"
                    x={mirrored() ? plotEnd() + 8 : plotStart() - 8}
                    y={yOf(tick)}
                    dy="0.32em"
                    text-anchor={mirrored() ? "start" : "end"}
                    class="fill-muted-foreground"
                  >
                    {tickText(tick)}
                  </text>
                )}
              </For>
            </Show>
            <Show when={local.xAxis !== false}>
              <For each={xTickIndices()}>
                {(index) => (
                  <text
                    data-slot="chart-x-tick"
                    x={xs()[index] ?? 0}
                    y={height() - 8}
                    text-anchor="middle"
                    class="fill-muted-foreground"
                  >
                    {(
                      local.xTickFormatter as ((value: string, index: number) => string) | undefined
                    )?.(labels()[index] ?? "", index) ?? labels()[index]}
                  </text>
                )}
              </For>
            </Show>
          </g>
          <Show when={local.cursor !== false && motion.active() >= 0 && local.kind === "bar"}>
            <rect
              data-slot="chart-cursor"
              x={(xs()[motion.active()] ?? 0) - layout().span / 2}
              y={padding.top}
              width={layout().span}
              height={Math.max(0, plotBottom() - padding.top)}
              class="fill-muted/50"
              aria-hidden="true"
            />
          </Show>
          <Show when={local.cursor !== false && motion.active() >= 0 && local.kind !== "bar"}>
            <line
              data-slot="chart-cursor"
              x1={xs()[motion.active()] ?? 0}
              x2={xs()[motion.active()] ?? 0}
              y1={padding.top}
              y2={plotBottom()}
              class="stroke-border"
              aria-hidden="true"
            />
          </Show>
          <For each={keys()}>
            {(key, series) => (
              <Show
                when={local.kind === "bar"}
                fallback={
                  <g aria-hidden="true">
                    <Show when={local.kind === "area"}>
                      <path
                        data-series={key}
                        d={areaPath(pointsOf(series()), lowerPointsOf(series()), curve())}
                        fill={items()[series()]?.color}
                        fill-opacity={0.25}
                        class="animate-chart-fade motion-reduce:animate-none"
                      />
                    </Show>
                    <path
                      data-series={local.kind === "line" ? key : undefined}
                      d={linePath(pointsOf(series()), curve())}
                      pathLength={1}
                      fill="none"
                      stroke={items()[series()]?.color}
                      stroke-width={2}
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="animate-chart-draw [stroke-dasharray:1] motion-reduce:animate-none"
                    />
                    <Show when={local.dots === true}>
                      <For each={indices()}>
                        {(index) => (
                          <circle
                            cx={xs()[index] ?? 0}
                            cy={pointsOf(series())[index]?.[1] ?? 0}
                            r={3}
                            fill={items()[series()]?.color}
                          />
                        )}
                      </For>
                    </Show>
                  </g>
                }
              >
                <g aria-hidden="true">
                  <For each={indices()}>
                    {(index) => (
                      <rect
                        data-series={key}
                        data-index={index}
                        x={barBox(series(), index).x}
                        y={barBox(series(), index).y}
                        width={barBox(series(), index).width}
                        height={barBox(series(), index).height}
                        fill={items()[series()]?.color}
                        rx={2}
                        class={cn(
                          "[transform-box:fill-box] animate-chart-rise motion-reduce:animate-none",
                          (shown()[series()]?.[index] ?? 0) < 0 ? "origin-top" : "origin-bottom",
                        )}
                      />
                    )}
                  </For>
                </g>
              </Show>
            )}
          </For>
          <Show when={local.kind !== "bar" && motion.active() >= 0}>
            <g aria-hidden="true">
              <For each={keys()}>
                {(_, series) => (
                  <circle
                    data-slot="chart-dot"
                    cx={xs()[motion.active()] ?? 0}
                    cy={pointsOf(series())[motion.active()]?.[1] ?? 0}
                    r={4}
                    fill={items()[series()]?.color}
                    class="stroke-background"
                    stroke-width={2}
                  />
                )}
              </For>
            </g>
          </Show>
          <Show when={targets()}>
            <For each={indices()}>
              {(index) => (
                <rect
                  data-slot="chart-point"
                  data-chart-point={index}
                  role="img"
                  aria-label={labels()[index]}
                  tabindex={tabStop() === index ? 0 : -1}
                  x={(xs()[index] ?? 0) - layout().span / 2}
                  y={padding.top}
                  width={layout().span}
                  height={Math.max(0, plotBottom() - padding.top)}
                  fill="transparent"
                  class="outline-none"
                />
              )}
            </For>
          </Show>
        </svg>
        <table class="sr-only" data-slot="chart-table">
          <caption>
            {listed().length < rows().length
              ? t(
                  "chart.captionTruncated",
                  "{series}. Showing {shown, number} of {total, plural, one {# data point} other {# data points}}.",
                  {
                    series: items()
                      .map((item) => item.label)
                      .join(listSeparator()),
                    shown: listed().length,
                    total: rows().length,
                  },
                )
              : items()
                  .map((item) => item.label)
                  .join(listSeparator())}
          </caption>
          <thead>
            <tr>
              <th scope="col">{xKey()}</th>
              <For each={items()} key={(item: ChartLegendItem) => item.key}>
                {(item) => <th scope="col">{item().label}</th>}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={listed()}>
              {(index) => (
                <tr>
                  <th scope="row">{String(rows()[index]?.[xKey()] ?? "")}</th>
                  <For each={keys()}>
                    {(key) => <td>{valueText(num(rows()[index]?.[key]), key)}</td>}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <div
          data-slot="chart-announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          class="sr-only"
        >
          {point()?.text ?? ""}
        </div>
        <ChartSlots tooltip={local.tooltip !== false} legend={local.legend !== false}>
          {local.children as JSX.Element}
        </ChartSlots>
      </plotContext.Provider>
    </figure>
  );
}

/** The parts the caller put in the chart, then the default ones that were not replaced. @internal */
function ChartSlots(props: {
  readonly tooltip: boolean;
  readonly legend: boolean;
  readonly children?: JSX.Element | undefined;
}): JSX.Element {
  const plot = plotContext.use("Chart");
  const resolved = children(() => props.children);
  // Read once now, so the parts register before the defaults are decided.
  resolved();
  return (
    <>
      {resolved() as JSX.Element}
      <Show when={props.tooltip && !plot.slots.tooltip}>
        <ChartTooltip />
      </Show>
      <Show when={props.legend && !plot.slots.legend}>
        <ChartLegend />
      </Show>
    </>
  );
}

/**
 * Props of {@link ChartTooltip}: the attributes of the `div` that holds the content.
 * @see {@link ChartTooltip}
 * @since 1.0.0
 */
export type ChartTooltipProps = ComponentProps<"div">;

/**
 * The tooltip of a chart: a box next to the active data point (the one under the pointer, or the one the
 * keyboard is on) that holds {@link ChartTooltipContent} or the content you pass. Put it inside a chart.
 * A chart draws a default tooltip unless it has this part (or `tooltip={false}`).
 *
 * Keyboard and ARIA: the box is hidden from assistive technology (`aria-hidden`) and ignores the pointer;
 * the same text is announced by the chart's polite live region, so it is not read twice. Escape hides it.
 *
 * shadcn/ui differences: the content is `children`, not a `content` prop, and `class` replaces `className`.
 *
 * @param props The tooltip props: see {@link ChartTooltipProps}.
 * @returns The tooltip while there is an active point.
 * @throws Error when rendered outside a chart.
 * @example
 * import { ChartContainer, ChartLine, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
 *
 * const rows = [
 *   { day: "Mon", visits: 120 },
 *   { day: "Tue", visits: 180 },
 * ];
 *
 * export function Visits() {
 *   return (
 *     <ChartContainer config={{ visits: { label: "Visits" } }}>
 *       <ChartLine data={rows} xKey="day" series={["visits"]}>
 *         <ChartTooltip>
 *           <ChartTooltipContent indicator="line" />
 *         </ChartTooltip>
 *       </ChartLine>
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartTooltipContent}
 * @since 1.0.0
 */
function ChartTooltip(props: ChartTooltipProps): JSX.Element {
  const plot = plotContext.use("ChartTooltip");
  plot.slots.tooltip = true;
  const [local, rest] = splitProps(props, ["class", "style", "children"]);
  return (
    <Show when={plot.active()}>
      {(point) => (
        <div
          data-slot="chart-tooltip"
          aria-hidden="true"
          style={point().style}
          class={cn("pointer-events-none absolute top-0 z-10", local.class)}
          {...rest}
        >
          {(local.children as JSX.Element | undefined) ?? <ChartTooltipContent />}
        </div>
      )}
    </Show>
  );
}

/** One row of the tooltip: the caller's `formatter` draws it, else the default row. @internal */
function TooltipRow(props: {
  readonly row: Accessor<ChartTooltipRow>;
  readonly position: Accessor<number>;
  readonly indicator: "dot" | "line" | "dashed";
  readonly hideIndicator: boolean;
  readonly formatter: ((row: ChartTooltipRow, index: number) => JSX.Element) | undefined;
}): JSX.Element {
  return (
    <Show
      when={props.formatter}
      fallback={
        <div
          data-slot="chart-tooltip-row"
          class="flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground"
        >
          <Show when={!props.hideIndicator}>
            <Show
              when={props.row().icon}
              fallback={
                <span
                  data-slot="chart-tooltip-indicator"
                  data-indicator={props.indicator}
                  style={
                    props.indicator === "dashed"
                      ? { "border-color": props.row().color, background: "transparent" }
                      : { background: props.row().color }
                  }
                  class={cn(
                    "shrink-0 rounded-[2px]",
                    props.indicator === "dot" && "size-2.5 self-center",
                    props.indicator === "line" && "w-1",
                    props.indicator === "dashed" && "w-0 border-[1.5px] border-dashed",
                  )}
                />
              }
            >
              {(Icon) => <>{Icon()({})}</>}
            </Show>
          </Show>
          <div class="flex flex-1 items-center justify-between gap-4 leading-none">
            <span data-slot="chart-tooltip-name" class="text-muted-foreground">
              {props.row().label}
            </span>
            <span class="flex items-baseline gap-1.5">
              <span
                data-slot="chart-tooltip-value"
                class="font-mono font-medium text-foreground tabular-nums"
              >
                {props.row().text}
              </span>
              <Show when={props.row().share}>
                <span data-slot="chart-tooltip-share" class="text-muted-foreground">
                  {props.row().share}
                </span>
              </Show>
            </span>
          </div>
        </div>
      }
    >
      {(format) => <>{format()(props.row(), props.position())}</>}
    </Show>
  );
}

/**
 * Props of {@link ChartTooltipContent}.
 * @see {@link ChartTooltipContent}
 * @since 1.0.0
 */
export interface ChartTooltipContentProps extends ComponentProps<"div"> {
  /**
   * The mark in front of each row: a `"dot"`, a vertical `"line"` or a `"dashed"` line.
   * @default "dot"
   */
  readonly indicator?: "dot" | "line" | "dashed" | undefined;
  /**
   * Leaves out the category line above the rows.
   * @default false
   */
  readonly hideLabel?: boolean | undefined;
  /**
   * Leaves out the mark in front of each row.
   * @default false
   */
  readonly hideIndicator?: boolean | undefined;
  /**
   * The category line, from the category and the active point.
   * @default the category as it is
   */
  readonly labelFormatter?:
    | ((label: string, point: ChartActivePoint) => JSX.Element | string)
    | undefined;
  /**
   * Draws a row yourself, from the row and its position.
   * @default the mark, the series name and the value
   */
  readonly formatter?: ((row: ChartTooltipRow, index: number) => JSX.Element) | undefined;
}

/**
 * The content of a {@link ChartTooltip}: the category of the active point, then a row for each series with
 * its mark, its name and its value. Pie slices also show their share.
 *
 * Keyboard and ARIA: no keys of its own; it is shown by the chart's pointer and keyboard handling and is
 * hidden from assistive technology with its tooltip.
 *
 * shadcn/ui differences: `labelFormatter` and `formatter` receive the ShadowJS rows
 * ({@link ChartTooltipRow}) and return elements, and there is no `nameKey` or `labelKey`: names come from
 * the chart config.
 *
 * @param props The content props: see {@link ChartTooltipContentProps}.
 * @returns The content while there is an active point.
 * @throws Error when rendered outside a chart.
 * @example
 * import { ChartContainer, ChartLine, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
 *
 * export function Hidden() {
 *   return (
 *     <ChartContainer config={{ visits: { label: "Visits" } }}>
 *       <ChartLine data={[{ day: "Mon", visits: 1 }]} xKey="day" series={["visits"]}>
 *         <ChartTooltip>
 *           <ChartTooltipContent hideLabel indicator="dashed" />
 *         </ChartTooltip>
 *       </ChartLine>
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartTooltip}
 * @since 1.0.0
 */
function ChartTooltipContent(props: ChartTooltipContentProps): JSX.Element {
  const plot = plotContext.use("ChartTooltipContent");
  const [local, rest] = splitProps(props, [
    "class",
    "indicator",
    "hideLabel",
    "hideIndicator",
    "labelFormatter",
    "formatter",
  ]);
  const indicator = (): "dot" | "line" | "dashed" =>
    (local.indicator as "dot" | "line" | "dashed" | undefined) ?? "dot";
  return (
    <Show when={plot.active()}>
      {(point) => (
        <div
          data-slot="chart-tooltip-content"
          class={cn(
            "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
            local.class,
          )}
          {...rest}
        >
          <Show when={local.hideLabel !== true && point().label !== ""}>
            <div data-slot="chart-tooltip-label" class="font-medium">
              {(
                local.labelFormatter as
                  | ((label: string, point: ChartActivePoint) => JSX.Element | string)
                  | undefined
              )?.(point().label, point()) ?? point().label}
            </div>
          </Show>
          <div class="grid gap-1.5">
            <For each={point().rows} key={(row: ChartTooltipRow) => row.key}>
              {(row, position) => (
                <TooltipRow
                  row={row}
                  position={position}
                  indicator={indicator()}
                  hideIndicator={local.hideIndicator === true}
                  formatter={
                    local.formatter as
                      | ((row: ChartTooltipRow, index: number) => JSX.Element)
                      | undefined
                  }
                />
              )}
            </For>
          </div>
        </div>
      )}
    </Show>
  );
}

/**
 * Props of {@link ChartLegend}: the attributes of the `div` that holds the content, where the legend
 * sits, and the series for a legend used outside a chart.
 * @see {@link ChartLegend}
 * @since 1.0.0
 */
export interface ChartLegendProps extends ComponentProps<"div"> {
  /**
   * Where the legend sits: `"bottom"` under the chart, `"top"` above it.
   * @default "bottom"
   */
  readonly verticalAlign?: "top" | "bottom" | undefined;
  /**
   * The keys of the series to list, for a legend placed in a {@link ChartContainer} outside any chart.
   * Inside a chart the legend lists the chart's series.
   * @default none
   */
  readonly series?: readonly string[] | undefined;
}

/**
 * The legend of a chart: a box under (or above) the chart that holds {@link ChartLegendContent} or the
 * content you pass. Put it inside a chart, or on its own inside a {@link ChartContainer} with `series`. A
 * chart draws a default legend unless it has this part (or `legend={false}`).
 *
 * Keyboard and ARIA: a plain list; no keys and no role of its own besides the list.
 *
 * shadcn/ui differences: the content is `children`, not a `content` prop, `verticalAlign` takes `"top"` and
 * `"bottom"`, and `class` replaces `className`.
 *
 * @param props The legend props: see {@link ChartLegendProps}.
 * @returns The legend.
 * @example
 * import { ChartContainer, ChartLegend } from "@/components/ui/chart";
 *
 * export function Key() {
 *   return (
 *     <ChartContainer config={{ visits: { label: "Visits" } }}>
 *       <ChartLegend series={["visits"]} />
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartLegendContent}
 * @since 1.0.0
 */
function ChartLegend(props: ChartLegendProps): JSX.Element {
  const plot = plotContext.useOptional();
  if (plot !== undefined) plot.slots.legend = true;
  const [local, rest] = splitProps(props, ["class", "verticalAlign", "series", "children"]);
  const align = (): "top" | "bottom" =>
    (local.verticalAlign as "top" | "bottom" | undefined) ?? "bottom";
  return (
    <div
      data-slot="chart-legend"
      data-align={align()}
      class={cn(
        "flex items-center justify-center",
        align() === "top" ? "order-first pb-3" : "pt-3",
        local.class,
      )}
      {...rest}
    >
      {(local.children as JSX.Element | undefined) ?? (
        <ChartLegendContent series={local.series as readonly string[] | undefined} />
      )}
    </div>
  );
}

/**
 * Props of {@link ChartLegendContent}.
 * @see {@link ChartLegendContent}
 * @since 1.0.0
 */
export interface ChartLegendContentProps extends ComponentProps<"ul"> {
  /**
   * Leaves out the swatch and the icon in front of each name.
   * @default false
   */
  readonly hideIcon?: boolean | undefined;
  /**
   * The keys of the series to list when there is no chart around the legend.
   * @default none
   */
  readonly series?: readonly string[] | undefined;
}

/**
 * The content of a {@link ChartLegend}: a list with a color swatch (or the series icon) and the label of
 * each series.
 *
 * Keyboard and ARIA: a `ul` of `li` items; no keys. The swatch is decorative.
 *
 * shadcn/ui differences: `class` replaces `className`; there is no `nameKey`.
 *
 * @param props The content props: see {@link ChartLegendContentProps}.
 * @returns The list.
 * @example
 * import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
 *
 * export function Plain() {
 *   return (
 *     <ChartContainer config={{ visits: { label: "Visits" } }}>
 *       <ChartLegend series={["visits"]}>
 *         <ChartLegendContent hideIcon series={["visits"]} />
 *       </ChartLegend>
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartLegend}
 * @since 1.0.0
 */
function ChartLegendContent(props: ChartLegendContentProps): JSX.Element {
  const plot = plotContext.useOptional();
  const container = chartContext.useOptional();
  const [local, rest] = splitProps(props, ["class", "hideIcon", "series"]);
  const items = (): readonly ChartLegendItem[] => {
    if (plot !== undefined) return plot.items();
    const config = container?.config() ?? {};
    return ((local.series as readonly string[] | undefined) ?? []).map((key, index) => ({
      key,
      label: seriesLabel(config, key),
      color: seriesColor(config, key, index),
      icon: config[key]?.icon,
    }));
  };
  return (
    <ul
      data-slot="chart-legend-content"
      class={cn("flex flex-wrap items-center justify-center gap-4", local.class)}
      {...rest}
    >
      <For each={items()} key={(item: ChartLegendItem) => item.key}>
        {(item) => (
          <li
            data-slot="chart-legend-item"
            class="flex items-center gap-1.5 text-muted-foreground [&>svg]:size-3 [&>svg]:text-muted-foreground"
          >
            <Show when={local.hideIcon !== true}>
              <Show
                when={item().icon}
                fallback={
                  <span
                    data-slot="chart-legend-swatch"
                    aria-hidden="true"
                    class="size-2 shrink-0 rounded-[2px]"
                    style={{ background: item().color }}
                  />
                }
              >
                {(Icon) => <>{Icon()({})}</>}
              </Show>
            </Show>
            {item().label}
          </li>
        )}
      </For>
    </ul>
  );
}

/**
 * An area chart: one filled area per series, drawn from zero up to the value (or stacked). Use it to show a
 * total or a trend over an ordered x axis. Put it inside a {@link ChartContainer}.
 *
 * @param props The chart props: see {@link ChartSeriesProps}.
 * @returns The chart.
 * @example
 * import { ChartArea, ChartContainer } from "@/components/ui/chart";
 *
 * const rows = [
 *   { month: "Jan", sales: 40 },
 *   { month: "Feb", sales: 65 },
 * ];
 *
 * export function Sales() {
 *   return (
 *     <ChartContainer config={{ sales: { label: "Sales" } }}>
 *       <ChartArea data={rows} xKey="month" series={["sales"]} curve="monotone" />
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartLine}
 * @see {@link ChartBar}
 * @since 1.0.0
 */
function ChartArea(props: ChartSeriesProps): JSX.Element {
  return <Cartesian {...props} kind="area" />;
}

/**
 * A line chart: one line per series, with the points spaced evenly along the x axis. Use it to compare
 * trends. Put it inside a {@link ChartContainer}.
 *
 * @param props The chart props: see {@link ChartSeriesProps}.
 * @returns The chart.
 * @example
 * import { ChartContainer, ChartLine } from "@/components/ui/chart";
 *
 * const rows = [
 *   { month: "Jan", sales: 40, returns: 4 },
 *   { month: "Feb", sales: 65, returns: 7 },
 * ];
 *
 * export function Trend() {
 *   return (
 *     <ChartContainer
 *       config={{ sales: { label: "Sales" }, returns: { label: "Returns" } }}
 *     >
 *       <ChartLine data={rows} xKey="month" series={["sales", "returns"]} dots />
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartArea}
 * @since 1.0.0
 */
function ChartLine(props: ChartSeriesProps): JSX.Element {
  return <Cartesian {...props} kind="line" />;
}

/**
 * A bar chart: one bar per series in each category, the bars of a category side by side (or stacked). Use
 * it to compare values across categories. Put it inside a {@link ChartContainer}.
 *
 * @param props The chart props: see {@link ChartSeriesProps}.
 * @returns The chart.
 * @example
 * import { ChartBar, ChartContainer } from "@/components/ui/chart";
 *
 * const rows = [
 *   { month: "Jan", sales: 40 },
 *   { month: "Feb", sales: 65 },
 * ];
 *
 * export function Bars() {
 *   return (
 *     <ChartContainer config={{ sales: { label: "Sales" } }}>
 *       <ChartBar data={rows} xKey="month" series={["sales"]} />
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartLine}
 * @since 1.0.0
 */
function ChartBar(props: ChartSeriesProps): JSX.Element {
  return <Cartesian {...props} kind="bar" />;
}

/**
 * Props of {@link ChartPie} and {@link ChartRadial}: the rows, which keys hold the name and the value, and
 * the layout, plus the attributes of the rendered `figure`.
 * @see {@link ChartPie}
 * @since 1.0.0
 */
export interface ChartPolarProps extends ComponentProps<"figure"> {
  /**
   * The rows to draw, one slice (or ring) each.
   * @default none (required)
   */
  readonly data: readonly ChartDatum[];
  /**
   * The key of the name of each row, which is also its key in the chart config.
   * @default none (required)
   */
  readonly nameKey: string;
  /**
   * The key of the numeric value of each row.
   * @default none (required)
   */
  readonly valueKey: string;
  /**
   * The size of the drawing in pixels; it scales down to fit the container (at most 240 wide).
   * @default 240
   */
  readonly height?: number | undefined;
  /**
   * Shows the default legend under the chart. A {@link ChartLegend} in `children` replaces it.
   * @default true
   */
  readonly legend?: boolean | undefined;
  /**
   * Shows the default tooltip. A {@link ChartTooltip} in `children` replaces it.
   * @default true
   */
  readonly tooltip?: boolean | undefined;
  /**
   * The text of a value in the tooltip, the table and the live region.
   * @default the number in the locale of the chart
   */
  readonly valueFormatter?: ((value: number, key: string) => string) | undefined;
  /**
   * The accessible name of the chart.
   * @default "Pie chart of Chrome, Safari" (the kind and the names, from the UI strings)
   */
  readonly label?: string | undefined;
  /**
   * Content in the middle of a donut or a radial chart, such as the total. It is placed over the drawing
   * and ignores the pointer.
   * @default none
   */
  readonly center?: JSX.Element | undefined;
  /**
   * The inner radius as a share of the outer one: `0` is a pie, `0.6` a donut. For a radial chart it is
   * the share of the radius the rings leave empty.
   * @default 0 for a pie, 0.3 for a radial chart
   */
  readonly innerRadius?: number | undefined;
  /**
   * The gap between two slices, in degrees. Pie only.
   * @default 0
   */
  readonly gap?: number | undefined;
  /**
   * The value that fills a ring completely. Radial only.
   * @default the largest value, rounded to a nice number
   */
  readonly max?: number | undefined;
  /**
   * Where the arc starts, in degrees clockwise from the top. Radial only; a pie always starts at the top.
   * @default 0
   */
  readonly startAngle?: number | undefined;
  /**
   * Where the arc ends, in degrees clockwise from the top. Radial only.
   * @default startAngle plus 360
   */
  readonly endAngle?: number | undefined;
}

/** A pie, a donut or a radial chart. @internal */
function Polar(props: ChartPolarProps & { readonly kind: "pie" | "radial" }): JSX.Element {
  const environment = useEnvironment();
  const t = useUiStrings();
  const [local, rest] = splitProps(props, [
    "data",
    "nameKey",
    "valueKey",
    "height",
    "legend",
    "tooltip",
    "valueFormatter",
    "label",
    "center",
    "innerRadius",
    "gap",
    "max",
    "startAngle",
    "endAngle",
    "kind",
    "class",
    "children",
  ]);
  const [svg, setSvg] = useRefSignal<SVGSVGElement>();
  // Resolved once: reading the prop twice would build its elements twice (and break hydration keys).
  const center = children(() => local.center);
  center();
  const config = (): ChartConfig => environment.config();
  const size = (): number => (local.height as number | undefined) ?? 240;
  const mirrored = (): boolean => environment.dir() === "rtl";
  const rows = (): readonly ChartDatum[] => local.data as readonly ChartDatum[];
  const names = useMemo(() => rows().map((row) => String(row[local.nameKey as string] ?? "")));
  const values = useMemo(() => rows().map((row) => num(row[local.valueKey as string])));
  const valueText = (value: number, key: string): string =>
    (local.valueFormatter as ((value: number, key: string) => string) | undefined)?.(value, key) ??
    environment.format().format(value);
  const percent = (fraction: number): string => {
    try {
      return new Intl.NumberFormat(environment.locale(), {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(fraction);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return `${Math.round(fraction * 100)}%`;
    }
  };
  const items = useMemo((): ChartLegendItem[] =>
    names().map((name, index) => ({
      key: name,
      label: seriesLabel(config(), name),
      color: seriesColor(config(), name, index),
      icon: config()[name]?.icon,
    })),
  );
  const listSeparator = (): string => t("chart.separator", ", ");
  const centerX = (): number => size() / 2;
  const outer = (): number => size() / 2 - 2;
  const radial = (): boolean => local.kind === "radial";
  const innerShare = (): number =>
    Math.min(0.95, Math.max(0, (local.innerRadius as number | undefined) ?? (radial() ? 0.3 : 0)));
  const arcStart = (): number => (((local.startAngle as number | undefined) ?? 0) * Math.PI) / 180;
  const arcEnd = (): number =>
    ((local.endAngle as number | undefined) ??
      ((local.startAngle as number | undefined) ?? 0) + 360) *
    (Math.PI / 180);
  const maximum = (): number =>
    (local.max as number | undefined) ??
    niceMax(values().reduce((most, value) => Math.max(most, value), 0));
  const total = (): number => values().reduce((sum, value) => sum + Math.max(0, value), 0);
  const angles = useMemo(() =>
    pieAngles(values(), {
      start: arcStart(),
      end: arcStart() + Math.PI * 2,
      pad: (((local.gap as number | undefined) ?? 0) * Math.PI) / 180,
    }),
  );

  /** The path of the slice, ring or bar, and of its track. */
  const shapes = useMemo(() => {
    const cx = centerX();
    if (!radial()) {
      return angles().map((angle) => ({
        d: arcPath(cx, cx, outer() * innerShare(), outer(), angle.start, angle.end),
        track: "",
        mid: (angle.start + angle.end) / 2,
        radius: (outer() * (1 + innerShare())) / 2,
      }));
    }
    const rings = Math.max(rows().length, 1);
    const base = outer() * innerShare();
    const step = (outer() - base) / rings;
    return values().map((value, index) => {
      const to = outer() - index * step;
      const from = to - step * 0.8;
      const sweep = Math.min(Math.max(value / (maximum() || 1), 0), 1) * (arcEnd() - arcStart());
      return {
        d: arcPath(cx, cx, from, to, arcStart(), arcStart() + sweep),
        track: arcPath(cx, cx, from, to, arcStart(), arcEnd()),
        mid: arcStart() + sweep / 2,
        radius: (from + to) / 2,
      };
    });
  });

  const targets = (): boolean => rows().length > 0;
  const count = (): number => rows().length;
  const motion = useActivePoint({ count, dir: environment.dir, targets, root: svg });
  dismissOutside(svg, motion.clear);

  const point = useMemo((): ChartActivePoint | undefined => {
    const index = motion.active();
    if (index < 0 || index >= count()) return undefined;
    const item = items()[index] as ChartLegendItem;
    const value = values()[index] ?? 0;
    const text = valueText(value, item.key);
    const fraction = total() === 0 ? 0 : Math.max(0, value) / total();
    const share = radial() ? undefined : percent(fraction);
    const shape = shapes()[index];
    const [x] = polarPoint(centerX(), centerX(), shape?.radius ?? 0, shape?.mid ?? 0);
    const anchor = mirrored() ? size() - x : x;
    return {
      index,
      label: "",
      rows: [{ ...item, value, text, share }],
      text:
        share === undefined
          ? t("chart.value", "{name}: {value}", { name: item.label, value: text })
          : t("chart.share", "{name}: {value} ({percent})", {
              name: item.label,
              value: text,
              percent: share,
            }),
      style: {
        left: `calc(50% + ${(anchor - centerX()).toFixed(2)}px)`,
        transform: "translateX(0.75rem)",
      },
    };
  });

  const accessibleName = (): string => {
    const name = local.label as string | undefined;
    if (name !== undefined) return name;
    const series = items()
      .map((item) => item.label)
      .join(listSeparator());
    if (radial()) return t("chart.label.radial", "Radial chart of {series}", { series });
    return innerShare() > 0
      ? t("chart.label.donut", "Donut chart of {series}", { series })
      : t("chart.label.pie", "Pie chart of {series}", { series });
  };
  const indices = useMemo(() => Array.from({ length: count() }, (_, index) => index));
  const tabStop = (): number => Math.min(motion.current(), Math.max(count() - 1, 0));
  const targetOf = (event: Event): number | undefined => {
    const found = (event.target as Element | null)?.closest?.("[data-chart-point]");
    const index =
      found === null || found === undefined
        ? undefined
        : Number(found.getAttribute("data-chart-point"));
    return index === undefined || Number.isNaN(index) ? undefined : index;
  };

  return (
    <figure
      data-slot="chart"
      data-kind={radial() ? "radial" : innerShare() > 0 ? "donut" : "pie"}
      class={cn("relative flex w-full flex-col", local.class)}
      {...rest}
    >
      <plotContext.Provider
        value={{ items, active: point, slots: { tooltip: false, legend: false } }}
      >
        <div class="relative mx-auto w-full max-w-60">
          <svg
            data-slot="chart-plot"
            ref={(created: SVGSVGElement) => setSvg(created)}
            viewBox={`0 0 ${size()} ${size()}`}
            role="group"
            aria-roledescription={t("chart.roledescription", "chart")}
            aria-label={accessibleName()}
            class="mx-auto block w-full"
            onKeyDown={motion.key}
            onFocusIn={(event: FocusEvent) => motion.focusIn(targetOf(event))}
            onFocusOut={motion.focusOut}
          >
            <g transform={mirrored() ? `translate(${size()} 0) scale(-1 1)` : undefined}>
              <Show when={radial()}>
                <g aria-hidden="true">
                  <For each={indices()}>
                    {(index) => (
                      <path data-track="" d={shapes()[index]?.track} class="fill-muted" />
                    )}
                  </For>
                </g>
              </Show>
              <For each={indices()}>
                {(index) => (
                  <path
                    data-slice=""
                    data-chart-point={index}
                    data-slot="chart-point"
                    role="img"
                    aria-label={items()[index]?.label}
                    tabindex={tabStop() === index ? 0 : -1}
                    d={shapes()[index]?.d}
                    fill={items()[index]?.color}
                    data-dimmed={
                      motion.active() >= 0 && motion.active() !== index ? "true" : undefined
                    }
                    class="animate-chart-fade stroke-background outline-none transition-opacity data-[dimmed=true]:opacity-60 motion-reduce:animate-none motion-reduce:transition-none"
                    stroke-width={radial() ? 0 : 1}
                    onPointerMove={() => motion.show(index)}
                    onPointerDown={(event: PointerEvent) => {
                      if (event.pointerType === "touch") motion.show(index);
                    }}
                    onPointerLeave={(event: PointerEvent) =>
                      motion.leave(event.pointerType === "touch")
                    }
                  />
                )}
              </For>
            </g>
          </svg>
          <Show when={center.count() > 0}>
            <div
              data-slot="chart-center"
              class="pointer-events-none absolute inset-0 flex items-center justify-center text-center"
            >
              {center() as JSX.Element}
            </div>
          </Show>
        </div>
        <table class="sr-only" data-slot="chart-table">
          <caption>
            {items()
              .map((item) => item.label)
              .join(listSeparator())}
          </caption>
          <thead>
            <tr>
              <th scope="col">{local.nameKey as string}</th>
              <th scope="col">{local.valueKey as string}</th>
            </tr>
          </thead>
          <tbody>
            <For each={indices()}>
              {(index) => (
                <tr>
                  <th scope="row">{items()[index]?.label}</th>
                  <td>{valueText(values()[index] ?? 0, items()[index]?.key ?? "")}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <div
          data-slot="chart-announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          class="sr-only"
        >
          {point()?.text ?? ""}
        </div>
        <ChartSlots tooltip={local.tooltip !== false} legend={local.legend !== false}>
          {local.children as JSX.Element}
        </ChartSlots>
      </plotContext.Provider>
    </figure>
  );
}

/**
 * A pie chart of one value per row: each row is a slice, sized by its share of the total. Each slice is
 * named by the row's `nameKey` value and takes the color of that name in the config, or a theme chart token
 * by position. With `innerRadius` it is a donut, and `center` puts content in the hole. Put it inside a
 * {@link ChartContainer} to use its colors.
 *
 * Keyboard and ARIA: the slices are one roving tab stop, each named by its slice name; the arrow keys,
 * Home and End move between them (they follow the screen in right-to-left text, where the slices run
 * counterclockwise), and the active slice is announced. A visually hidden table holds the values.
 *
 * @param props The chart props: see {@link ChartPolarProps}.
 * @returns The chart.
 * @example
 * import { ChartContainer, ChartPie } from "@/components/ui/chart";
 *
 * const rows = [
 *   { browser: "Chrome", share: 60 },
 *   { browser: "Safari", share: 40 },
 * ];
 *
 * export function Browsers() {
 *   return (
 *     <ChartContainer config={{ Chrome: { label: "Chrome" }, Safari: { label: "Safari" } }}>
 *       <ChartPie data={rows} nameKey="browser" valueKey="share" innerRadius={0.6} />
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartRadial}
 * @see {@link ChartContainer}
 * @since 1.0.0
 */
function ChartPie(props: ChartPolarProps): JSX.Element {
  return <Polar {...props} kind="pie" />;
}

/**
 * A radial chart: one concentric ring per row, the first on the outside, swept from the start angle by the
 * row's share of `max`, over a faint track. Use it to show progress toward a goal. Put it inside a
 * {@link ChartContainer}.
 *
 * Keyboard and ARIA: as for {@link ChartPie}: the rings are one roving tab stop and are announced.
 *
 * @param props The chart props: see {@link ChartPolarProps}.
 * @returns The chart.
 * @example
 * import { ChartContainer, ChartRadial } from "@/components/ui/chart";
 *
 * const rows = [
 *   { goal: "Move", done: 75 },
 *   { goal: "Exercise", done: 40 },
 * ];
 *
 * export function Goals() {
 *   return (
 *     <ChartContainer config={{ Move: { label: "Move" }, Exercise: { label: "Exercise" } }}>
 *       <ChartRadial data={rows} nameKey="goal" valueKey="done" max={100} />
 *     </ChartContainer>
 *   );
 * }
 * @see {@link ChartPie}
 * @since 1.0.0
 */
function ChartRadial(props: ChartPolarProps): JSX.Element {
  return <Polar {...props} kind="radial" />;
}

export {
  ChartArea,
  ChartBar,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartLine,
  ChartPie,
  ChartRadial,
  ChartTooltip,
  ChartTooltipContent,
};
