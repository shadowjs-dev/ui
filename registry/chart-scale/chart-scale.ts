/**
 * A point `[x, y]` in the coordinates of an SVG: `x` grows to the right and `y` grows downward.
 * @see {@link linePath}
 * @since 1.0.0
 */
export type ChartPoint = readonly [number, number];

/**
 * How a line joins its points: `"linear"` draws straight segments, `"monotone"` draws a smooth curve
 * that never rises or falls between two points more than the points themselves do, and `"step"`
 * draws a horizontal run to the middle of each gap and a vertical jump there.
 * @see {@link linePath}
 * @since 1.0.0
 */
export type ChartCurve = "linear" | "monotone" | "step";

/** A full turn, less the rounding a user-supplied angle can carry. @internal */
const FULL_TURN = Math.PI * 2 - 1e-9;

/** A coordinate with two decimals. @internal */
const fixed = (value: number): string => value.toFixed(2);

/** A radius as a short number: `40` stays `40`, `40.456` becomes `40.46`. @internal */
const short = (value: number): string => String(Number(value.toFixed(2)));

/**
 * Maps a value from a domain to a range, linearly. It is the scale the charts use for their axes. A flat
 * domain (`low` equal to `high`) maps to the middle of the range.
 *
 * @param domain The input `[low, high]`.
 * @param range The output `[low, high]`; `low` may be above `high`, as for a y axis that points up.
 * @param value The value to map.
 * @returns The mapped value.
 * @example
 * import { linearScale } from "@/lib/chart-scale";
 *
 * export const middle = linearScale([0, 100], [200, 0], 50); // 100
 * @see {@link invertLinear}
 * @see {@link niceMax}
 * @since 1.0.0
 */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
  value: number,
): number {
  const [low, high] = domain;
  const [from, to] = range;
  if (high === low) return (from + to) / 2;
  return from + ((value - low) / (high - low)) * (to - from);
}

/**
 * The inverse of {@link linearScale}: the value that maps to a position. A flat range gives the low end
 * of the domain.
 *
 * @param domain The input `[low, high]` of the scale.
 * @param range The output `[low, high]` of the scale.
 * @param position A position in the range.
 * @returns The value in the domain.
 * @example
 * import { invertLinear } from "@/lib/chart-scale";
 *
 * export const value = invertLinear([0, 100], [200, 0], 100); // 50
 * @see {@link linearScale}
 * @since 1.0.0
 */
export function invertLinear(
  domain: readonly [number, number],
  range: readonly [number, number],
  position: number,
): number {
  const [low, high] = domain;
  const [from, to] = range;
  if (to === from) return low;
  return low + ((position - from) / (to - from)) * (high - low);
}

/**
 * A round upper bound for a value, so an axis ends on a tidy number: 1, 2, 5 or 10 times a power of ten.
 * A value that is not positive, or not finite, gives `1`.
 *
 * @param value The largest value the axis must show.
 * @returns The bound, which is at least `value`.
 * @example
 * import { niceMax } from "@/lib/chart-scale";
 *
 * export const top = niceMax(87); // 100
 * export const small = niceMax(0.4); // 0.5
 * @see {@link niceTicks}
 * @since 1.0.0
 */
export function niceMax(value: number): number {
  if (!(value > 0) || !Number.isFinite(value)) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const fraction = value / power;
  const step = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return step * power;
}

/**
 * Round, evenly spaced tick values that cover a range: the step is 1, 2 or 5 times a power of ten, the
 * first tick is at or below `min` and the last is at or above `max`. About `count` ticks are made, never
 * more than twice that plus two. A flat range (`min` equal to `max`, or closer than a millionth of the larger one) is shown from zero to the value,
 * and a range that is not finite gives the ticks of `0` to `1`.
 *
 * @param min The lowest value to cover.
 * @param max The highest value to cover.
 * @param count About how many ticks to make (default `5`).
 * @returns The ticks, in ascending order, at least two.
 * @example
 * import { niceTicks } from "@/lib/chart-scale";
 *
 * export const ticks = niceTicks(0, 87, 5); // [0, 20, 40, 60, 80, 100]
 * @see {@link niceDomain}
 * @since 1.0.0
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  let low = Math.min(min, max);
  let high = Math.max(min, max);
  const scale = Math.max(Math.abs(low), Math.abs(high));
  if (!Number.isFinite(scale) || scale < 1e-290) {
    low = 0;
    high = 1;
  } else if (high - low <= 1e-6 * scale) {
    if (high > 0) low = 0;
    else high = 0;
  }
  const wanted = Math.min(50, Math.max(1, Math.floor(count) || 5));
  const raw = (high - low) / wanted;
  const base = 10 ** Math.floor(Math.log10(raw));
  const error = raw / base;
  const factor =
    error >= Math.sqrt(50) ? 10 : error >= Math.sqrt(10) ? 5 : error >= Math.SQRT2 ? 2 : 1;
  const step = factor * base;
  const first = Math.floor(low / step + 1e-9);
  const last = Math.ceil(high / step - 1e-9);
  const ticks: number[] = [];
  for (let index = first; index <= last; index += 1) {
    const value = Number((index * step).toPrecision(15));
    ticks.push(value === 0 ? 0 : value);
  }
  return ticks;
}

/**
 * The nice range of an axis: the first and last of {@link niceTicks}.
 *
 * @param min The lowest value to cover.
 * @param max The highest value to cover.
 * @param count About how many ticks the axis has (default `5`).
 * @returns The domain `[low, high]`, which contains `[min, max]`.
 * @example
 * import { niceDomain } from "@/lib/chart-scale";
 *
 * export const domain = niceDomain(3, 87); // [0, 100]
 * @see {@link niceTicks}
 * @since 1.0.0
 */
export function niceDomain(min: number, max: number, count = 5): [number, number] {
  const ticks = niceTicks(min, max, count);
  return [ticks[0] ?? 0, ticks[ticks.length - 1] ?? 1];
}

/**
 * Evenly spaced positions from `from` to `to`, both ends included: where the points of a line sit. One
 * point sits in the middle. `from` may be above `to`, which mirrors the row for a right-to-left chart.
 *
 * @param count How many positions.
 * @param from The position of the first point.
 * @param to The position of the last point.
 * @returns The positions, in order.
 * @example
 * import { pointPositions } from "@/lib/chart-scale";
 *
 * export const xs = pointPositions(3, 0, 100); // [0, 50, 100]
 * @see {@link bandPositions}
 * @since 1.0.0
 */
export function pointPositions(count: number, from: number, to: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [(from + to) / 2];
  const gap = (to - from) / (count - 1);
  return Array.from({ length: count }, (_, index) => from + index * gap);
}

/**
 * The layout of bars: `count` equal bands between `from` and `to`, each with a centered bar that leaves a
 * share of the band empty. `from` may be above `to`, which mirrors the row for a right-to-left chart.
 *
 * @param count How many bands.
 * @param from The edge where the first band starts.
 * @param to The edge where the last band ends.
 * @param padding The share of each band left empty, from `0` to below `1` (default `0.2`).
 * @returns The `centers` of the bands, the signed `step` between two centers, and the `bandwidth` (the
 * width of a bar group).
 * @example
 * import { bandPositions } from "@/lib/chart-scale";
 *
 * export const bands = bandPositions(4, 0, 100); // centers 12.5, 37.5, 62.5, 87.5
 * @see {@link pointPositions}
 * @since 1.0.0
 */
export function bandPositions(
  count: number,
  from: number,
  to: number,
  padding = 0.2,
): { readonly centers: number[]; readonly step: number; readonly bandwidth: number } {
  if (count <= 0) return { centers: [], step: 0, bandwidth: 0 };
  const step = (to - from) / count;
  const share = Math.min(1, Math.max(0, padding));
  return {
    centers: Array.from({ length: count }, (_, index) => from + (index + 0.5) * step),
    step,
    bandwidth: Math.abs(step) * (1 - share),
  };
}

/**
 * The index of the position nearest to `x`, which is how a pointer over a chart finds the data point under
 * it. The positions must be in order, ascending or descending (the x positions of a chart are, mirrored or
 * not). The first of two equally near positions wins. It takes time proportional to the logarithm of the
 * number of positions.
 *
 * @param positions The x positions of the items, in order.
 * @param x The x position to match.
 * @returns The index of the nearest position, or `-1` when there are no positions or `x` is not finite.
 * @example
 * import { nearestIndex } from "@/lib/chart-scale";
 *
 * export const index = nearestIndex([0, 50, 100], 60); // 1
 * @see {@link pointPositions}
 * @since 1.0.0
 */
export function nearestIndex(positions: readonly number[], x: number): number {
  const count = positions.length;
  if (count === 0 || !Number.isFinite(x)) return -1;
  const first = positions[0] ?? 0;
  const last = positions[count - 1] ?? 0;
  const ascending = last >= first;
  let low = 0;
  let high = count - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    const position = positions[middle] ?? 0;
    if (ascending ? position < x : position > x) low = middle + 1;
    else high = middle;
  }
  if (low === 0) return 0;
  const before = Math.abs((positions[low - 1] ?? 0) - x);
  const after = Math.abs((positions[low] ?? 0) - x);
  let best = after < before ? low : low - 1;
  // Of several items at one position the first wins.
  while (best > 0 && positions[best - 1] === positions[best]) best -= 1;
  return best;
}

/** The slopes a monotone curve leaves each point with, per unit of distance along the line. @internal */
function monotoneSlopes(points: readonly ChartPoint[]): { slopes: number[]; widths: number[] } {
  const widths: number[] = [];
  const secants: number[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index] as ChartPoint;
    const to = points[index + 1] as ChartPoint;
    const width = Math.abs(to[0] - from[0]);
    widths.push(width);
    secants.push(width === 0 ? 0 : (to[1] - from[1]) / width);
  }
  const slopes: number[] = [secants[0] ?? 0];
  for (let index = 1; index < points.length - 1; index += 1) {
    const before = secants[index - 1] ?? 0;
    const after = secants[index] ?? 0;
    const left = widths[index - 1] ?? 0;
    const right = widths[index] ?? 0;
    const first = 2 * right + left;
    const second = right + 2 * left;
    slopes.push(
      before * after <= 0 || first + second === 0
        ? 0
        : (first + second) / (first / before + second / after),
    );
  }
  slopes.push(secants[secants.length - 1] ?? 0);
  return { slopes, widths };
}

/**
 * The SVG path `d` through points, joined by straight segments, steps or a smooth monotone curve. The
 * coordinates are written with two decimals.
 *
 * A monotone curve (a weighted harmonic mean of the neighboring slopes, as in Fritsch and Butland) never
 * bulges past a point: between two points it stays between their heights. The points may run in either
 * direction along x.
 *
 * @param points The points `[x, y]`, in drawing order.
 * @param curve How to join the points (default `"linear"`).
 * @returns The path data, or an empty string for no points.
 * @example
 * import { linePath } from "@/lib/chart-scale";
 *
 * export const line = linePath([
 *   [0, 10],
 *   [50, 4],
 * ]); // "M0.00 10.00 L50.00 4.00"
 * @see {@link areaPath}
 * @since 1.0.0
 */
export function linePath(points: readonly ChartPoint[], curve: ChartCurve = "linear"): string {
  const first = points[0];
  if (first === undefined) return "";
  const parts = [`M${fixed(first[0])} ${fixed(first[1])}`];
  if (curve === "monotone" && points.length > 1) {
    const { slopes, widths } = monotoneSlopes(points);
    for (let index = 0; index < points.length - 1; index += 1) {
      const from = points[index] as ChartPoint;
      const to = points[index + 1] as ChartPoint;
      const third = (to[0] - from[0]) / 3;
      const reach = (widths[index] ?? 0) / 3;
      const startY = from[1] + (slopes[index] ?? 0) * reach;
      const endY = to[1] - (slopes[index + 1] ?? 0) * reach;
      parts.push(
        `C${fixed(from[0] + third)} ${fixed(startY)} ${fixed(to[0] - third)} ${fixed(endY)} ${fixed(to[0])} ${fixed(to[1])}`,
      );
    }
    return parts.join(" ");
  }
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1] as ChartPoint;
    const to = points[index] as ChartPoint;
    if (curve === "step") {
      const middle = (from[0] + to[0]) / 2;
      parts.push(
        `L${fixed(middle)} ${fixed(from[1])}`,
        `L${fixed(middle)} ${fixed(to[1])}`,
        `L${fixed(to[0])} ${fixed(to[1])}`,
      );
    } else parts.push(`L${fixed(to[0])} ${fixed(to[1])}`);
  }
  return parts.join(" ");
}

/**
 * The closed SVG path of the area between a line of points and a baseline or a second line: the top
 * line, then down to the baseline at the last x, across to the first x, and closed. With a second line of
 * points (the bottom edge of a stacked area, one point for each of the top ones) the path goes back along
 * that line instead.
 *
 * @param points The points `[x, y]` of the top edge, in drawing order.
 * @param baseline The y coordinate of the bottom edge, or the points of the bottom edge in the same
 * order as the top ones.
 * @param curve How to join the points of both edges (default `"linear"`).
 * @returns The path data, or an empty string for no points.
 * @example
 * import { areaPath } from "@/lib/chart-scale";
 *
 * export const area = areaPath(
 *   [
 *     [0, 10],
 *     [50, 4],
 *   ],
 *   100,
 * );
 * @see {@link linePath}
 * @since 1.0.0
 */
export function areaPath(
  points: readonly ChartPoint[],
  baseline: number | readonly ChartPoint[],
  curve: ChartCurve = "linear",
): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) return "";
  const top = linePath(points, curve);
  if (typeof baseline === "number") {
    return `${top} L${fixed(last[0])} ${fixed(baseline)} L${fixed(first[0])} ${fixed(baseline)} Z`;
  }
  const back = linePath([...baseline].reverse(), curve);
  return back === "" ? `${top} Z` : `${top} L${back.slice(1)} Z`;
}

/**
 * A point on a circle, measured in radians clockwise from the top: angle `0` points up, `Math.PI / 2`
 * points right. Use it to place labels around a pie.
 *
 * @param cx The x coordinate of the center.
 * @param cy The y coordinate of the center.
 * @param radius The distance from the center.
 * @param angle The angle in radians.
 * @returns The point `[x, y]`.
 * @example
 * import { polarPoint } from "@/lib/chart-scale";
 *
 * export const right = polarPoint(50, 50, 40, Math.PI / 2); // [90, 50] up to rounding
 * @see {@link slicePath}
 * @since 1.0.0
 */
export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): [number, number] {
  return [cx + radius * Math.sin(angle), cy - radius * Math.cos(angle)];
}

/**
 * The closed SVG path of a pie slice: a wedge from the center to the arc between two angles. Angles are in
 * radians, clockwise from the top, as in {@link polarPoint}. A slice of a full turn is a disc, and a slice
 * with no sweep gives an empty string.
 *
 * @param cx The x coordinate of the center.
 * @param cy The y coordinate of the center.
 * @param radius The radius of the arc.
 * @param start The angle the slice starts at, in radians.
 * @param end The angle the slice ends at, in radians, after `start`.
 * @returns The path data.
 * @example
 * import { slicePath } from "@/lib/chart-scale";
 *
 * export const quarter = slicePath(50, 50, 40, 0, Math.PI / 2);
 * @see {@link arcPath}
 * @since 1.0.0
 */
export function slicePath(
  cx: number,
  cy: number,
  radius: number,
  start: number,
  end: number,
): string {
  const sweep = end - start;
  if (!(sweep > 0)) return "";
  const r = short(radius);
  const [x1, y1] = polarPoint(cx, cy, radius, start);
  if (sweep >= FULL_TURN) {
    const [x2, y2] = polarPoint(cx, cy, radius, start + Math.PI);
    return `M${fixed(x1)} ${fixed(y1)} A${r} ${r} 0 1 1 ${fixed(x2)} ${fixed(y2)} A${r} ${r} 0 1 1 ${fixed(x1)} ${fixed(y1)} Z`;
  }
  const [x2, y2] = polarPoint(cx, cy, radius, end);
  const large = sweep > Math.PI ? 1 : 0;
  return `M${cx} ${cy} L${fixed(x1)} ${fixed(y1)} A${r} ${r} 0 ${large} 1 ${fixed(x2)} ${fixed(y2)} Z`;
}

/**
 * The closed SVG path of a ring segment: the part of a ring between two radii and two angles. It is how a
 * donut slice and a radial bar are drawn. Angles are in radians, clockwise from the top. With an inner
 * radius of zero it is the wedge of {@link slicePath}; a segment of a full turn is a whole ring.
 *
 * @param cx The x coordinate of the center.
 * @param cy The y coordinate of the center.
 * @param inner The inner radius.
 * @param outer The outer radius.
 * @param start The angle the segment starts at, in radians.
 * @param end The angle the segment ends at, in radians, after `start`.
 * @returns The path data, or an empty string when the segment has no sweep or no thickness.
 * @example
 * import { arcPath } from "@/lib/chart-scale";
 *
 * export const ring = arcPath(50, 50, 20, 40, 0, Math.PI);
 * @see {@link slicePath}
 * @since 1.0.0
 */
export function arcPath(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  start: number,
  end: number,
): string {
  if (inner <= 0) return slicePath(cx, cy, outer, start, end);
  const sweep = end - start;
  if (!(sweep > 0) || outer <= inner) return "";
  const big = short(outer);
  const small = short(inner);
  const [ox1, oy1] = polarPoint(cx, cy, outer, start);
  const [ix1, iy1] = polarPoint(cx, cy, inner, start);
  if (sweep >= FULL_TURN) {
    const [ox2, oy2] = polarPoint(cx, cy, outer, start + Math.PI);
    const [ix2, iy2] = polarPoint(cx, cy, inner, start + Math.PI);
    return [
      `M${fixed(ox1)} ${fixed(oy1)} A${big} ${big} 0 1 1 ${fixed(ox2)} ${fixed(oy2)} A${big} ${big} 0 1 1 ${fixed(ox1)} ${fixed(oy1)} Z`,
      `M${fixed(ix1)} ${fixed(iy1)} A${small} ${small} 0 1 0 ${fixed(ix2)} ${fixed(iy2)} A${small} ${small} 0 1 0 ${fixed(ix1)} ${fixed(iy1)} Z`,
    ].join(" ");
  }
  const [ox2, oy2] = polarPoint(cx, cy, outer, end);
  const [ix2, iy2] = polarPoint(cx, cy, inner, end);
  const large = sweep > Math.PI ? 1 : 0;
  return `M${fixed(ox1)} ${fixed(oy1)} A${big} ${big} 0 ${large} 1 ${fixed(ox2)} ${fixed(oy2)} L${fixed(ix2)} ${fixed(iy2)} A${small} ${small} 0 ${large} 0 ${fixed(ix1)} ${fixed(iy1)} Z`;
}

/**
 * One slice of {@link pieAngles}: where it starts and ends, and its share of the total.
 * @see {@link pieAngles}
 * @since 1.0.0
 */
export interface PieAngle {
  /** The angle the slice starts at, in radians clockwise from the top. */
  readonly start: number;
  /** The angle the slice ends at, in radians. */
  readonly end: number;
  /** The slice's share of the total, from `0` to `1`. */
  readonly fraction: number;
}

/**
 * Options of {@link pieAngles}.
 * @see {@link pieAngles}
 * @since 1.0.0
 */
export interface PieAngleOptions {
  /**
   * The angle the first slice starts at, in radians clockwise from the top.
   * @default 0
   */
  readonly start?: number | undefined;
  /**
   * The angle the last slice ends at.
   * @default start plus a full turn
   */
  readonly end?: number | undefined;
  /**
   * The gap left between two slices, in radians. A slice thinner than the gap shrinks to a line.
   * @default 0
   */
  readonly pad?: number | undefined;
}

/**
 * The angles of the slices of a pie: each value gets a share of the arc in proportion to its size. A value
 * that is zero, negative or not finite gets no slice (an empty one at its place), and when every value is
 * empty no slice has a share.
 *
 * @param values The value of each slice, in order.
 * @param options The arc to fill and the gap between slices.
 * @returns One {@link PieAngle} for each value, in the same order.
 * @example
 * import { pieAngles } from "@/lib/chart-scale";
 *
 * export const slices = pieAngles([1, 1, 2]); // fractions 0.25, 0.25, 0.5
 * @see {@link arcPath}
 * @since 1.0.0
 */
export function pieAngles(values: readonly number[], options: PieAngleOptions = {}): PieAngle[] {
  const start = options.start ?? 0;
  const end = options.end ?? start + Math.PI * 2;
  const gap = Math.max(0, options.pad ?? 0);
  const weights = values.map((value) => (value > 0 && Number.isFinite(value) ? value : 0));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = start;
  return weights.map((weight) => {
    if (weight === 0 || total === 0) return { start: cursor, end: cursor, fraction: 0 };
    const fraction = weight / total;
    const room = (end - start) * fraction;
    const from = cursor;
    cursor += room;
    const inset = Math.min(gap / 2, Math.abs(room) / 2);
    return { start: from + inset, end: cursor - inset, fraction };
  });
}

/**
 * Stacks series on top of each other. The series are columns of numbers, one number for each row. In
 * every row the positive values pile up from zero in series order and the negative ones pile down from
 * zero, so a stack never hides a value.
 *
 * @param columns The values of each series, one array for each series.
 * @returns For each series, where each of its segments starts (`lower`) and ends (`upper`).
 * @example
 * import { stackColumns } from "@/lib/chart-scale";
 *
 * export const stacked = stackColumns([
 *   [1, 2],
 *   [3, 4],
 * ]); // upper: [[1, 2], [4, 6]]
 * @see {@link niceTicks}
 * @since 1.0.0
 */
export function stackColumns(columns: readonly (readonly number[])[]): {
  readonly lower: number[][];
  readonly upper: number[][];
} {
  const rows = columns.reduce((most, column) => Math.max(most, column.length), 0);
  const lower = columns.map(() => new Array<number>(rows).fill(0));
  const upper = columns.map(() => new Array<number>(rows).fill(0));
  for (let row = 0; row < rows; row += 1) {
    let up = 0;
    let down = 0;
    columns.forEach((column, series) => {
      const value = column[row] ?? 0;
      const amount = Number.isFinite(value) ? value : 0;
      const base = amount >= 0 ? up : down;
      (lower[series] as number[])[row] = base;
      (upper[series] as number[])[row] = base + amount;
      if (amount >= 0) up += amount;
      else down += amount;
    });
  }
  return { lower, upper };
}

/**
 * Chooses which rows of a long series to draw. With no more rows than `limit` every row is kept. With more,
 * the rows are cut into runs and each run keeps its lowest and its highest row of every series (so a spike
 * or a dip is never lost), plus the first and the last row. The result has at most `limit` indices, or
 * `2 * columns.length + 2` when `limit` is smaller than that.
 *
 * @param columns The values of each series, one array for each series, all as long as the rows.
 * @param limit The most rows to keep.
 * @returns The indices of the rows to draw, in ascending order, without repeats.
 * @example
 * import { decimateIndices } from "@/lib/chart-scale";
 *
 * const values = Array.from({ length: 20_000 }, (_, index) => Math.sin(index / 40));
 * export const kept = decimateIndices([values], 5000); // fewer than 5000 indices
 * @see {@link linePath}
 * @since 1.0.0
 */
export function decimateIndices(columns: readonly (readonly number[])[], limit: number): number[] {
  let length = 0;
  for (const column of columns) if (column.length > length) length = column.length;
  if (length === 0) return [];
  const cap = Math.max(2, Number.isFinite(limit) ? Math.floor(limit) : 2);
  if (length <= cap) return Array.from({ length }, (_, index) => index);
  const series = columns.length;
  const runs = Math.max(1, Math.floor((cap - 2) / (2 * Math.max(series, 1))));
  const interior = length - 2;
  const keep = new Set<number>([0, length - 1]);
  for (let run = 0; run < runs; run += 1) {
    const from = 1 + Math.floor((run * interior) / runs);
    const to = 1 + Math.floor(((run + 1) * interior) / runs);
    if (to <= from) continue;
    if (series === 0) {
      keep.add(from);
      continue;
    }
    for (const column of columns) {
      let lowest = -1;
      let highest = -1;
      for (let index = from; index < to; index += 1) {
        const value = column[index];
        if (value === undefined || Number.isNaN(value)) continue;
        if (lowest < 0 || value < (column[lowest] as number)) lowest = index;
        if (highest < 0 || value > (column[highest] as number)) highest = index;
      }
      if (lowest >= 0) keep.add(lowest);
      if (highest >= 0) keep.add(highest);
    }
  }
  return [...keep].sort((a, b) => a - b);
}

/**
 * A series key made safe to use inside a CSS custom property name (`--color-<key>`): every character
 * other than a letter, a digit, `-` and `_` becomes `-`. An empty key becomes `series`.
 *
 * @param key The key of a series or the name of a slice.
 * @returns The safe key.
 * @example
 * import { cssKey } from "@/lib/chart-scale";
 *
 * export const name = `--color-${cssKey("Chrome browser")}`; // "--color-Chrome-browser"
 * @since 1.0.0
 */
export function cssKey(key: string): string {
  const safe = key.replace(/[^A-Za-z0-9_-]/g, "-");
  return safe === "" ? "series" : safe;
}
