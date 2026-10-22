import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  arcPath,
  areaPath,
  bandPositions,
  cssKey,
  decimateIndices,
  invertLinear,
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
} from "../registry/chart-scale/chart-scale";

const finite = (min: number, max: number) =>
  fc.double({ min, max, noNaN: true, noDefaultInfinity: true });

/** A value rounded to three decimals: pixel positions never need more. */
const rounded = (value: number): number => Math.round(value * 1000) / 1000;
const maxOf = (values: readonly number[]): number =>
  values.reduce((best, value) => (value > best ? value : best), Number.NEGATIVE_INFINITY);
const minOf = (values: readonly number[]): number =>
  values.reduce((best, value) => (value < best ? value : best), Number.POSITIVE_INFINITY);

/** The numbers of a path string, in order. */
const numbersOf = (path: string): number[] => (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

describe("chart-scale: scales", () => {
  it("[UI-CHS-01] linearScale maps a domain onto a range, flat domains to the middle, and invertLinear undoes it", () => {
    expect(linearScale([0, 100], [200, 0], 50)).toBe(100);
    expect(linearScale([0, 100], [0, 300], 100)).toBe(300);
    expect(linearScale([5, 5], [0, 10], 5)).toBe(5);
    expect(invertLinear([0, 100], [200, 0], 100)).toBe(50);
    expect(invertLinear([5, 5], [0, 10], 3)).toBe(5);
  });

  it("[UI-CHS-02] niceMax rounds up to 1, 2, 5 or 10 times a power of ten", () => {
    expect(niceMax(87)).toBe(100);
    expect(niceMax(0.4)).toBe(0.5);
    expect(niceMax(1)).toBe(1);
    expect(niceMax(2.01)).toBe(5);
    expect(niceMax(0)).toBe(1);
    expect(niceMax(-3)).toBe(1);
    expect(niceMax(Number.NaN)).toBe(1);
  });

  it("[UI-CHS-03] niceTicks gives round, evenly spaced ticks that cover the data, and niceDomain is their ends", () => {
    expect(niceTicks(0, 87, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(-3, 3, 4)).toEqual([-4, -2, 0, 2, 4]);
    expect(niceTicks(0.1, 0.4, 3)).toEqual([0.1, 0.2, 0.3, 0.4]);
    expect(niceTicks(7, 7, 5)).toEqual(niceTicks(0, 7, 5));
    expect(niceTicks(-7, -7, 5)).toEqual(niceTicks(-7, 0, 5));
    expect(niceTicks(0, 0, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceTicks(Number.NaN, 4, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceDomain(3, 87, 5)).toEqual([0, 100]);
  });

  it("[UI-CHS-04] property: ticks ascend by one step of 1, 2 or 5 times a power of ten and cover the range", () => {
    fc.assert(
      fc.property(
        finite(-1e7, 1e7),
        finite(0, 1e7),
        fc.integer({ min: 1, max: 12 }),
        (a, span, count) => {
          const min = a;
          const max = a + span;
          const ticks = niceTicks(min, max, count);
          expect(ticks.length).toBeGreaterThanOrEqual(2);
          expect(ticks.length).toBeLessThanOrEqual(2 * count + 3);
          const [first, last] = [ticks[0] as number, ticks[ticks.length - 1] as number];
          const step = (ticks[1] as number) - first;
          expect(step).toBeGreaterThan(0);
          expect(first).toBeLessThanOrEqual(min + step * 1e-6);
          expect(last).toBeGreaterThanOrEqual(max - step * 1e-6);
          const mantissa = step / 10 ** Math.floor(Math.log10(step));
          expect([1, 2, 5, 10].some((m) => Math.abs(mantissa - m) < 1e-6)).toBe(true);
          for (let i = 1; i < ticks.length; i += 1) {
            expect(Math.abs((ticks[i] as number) - (ticks[i - 1] as number) - step)).toBeLessThan(
              step * 1e-6,
            );
          }
        },
      ),
    );
  });

  it("[UI-CHS-05] property: linearScale is monotone and invertLinear round trips", () => {
    fc.assert(
      fc.property(
        finite(-1e4, 1e4),
        finite(1, 1e4),
        finite(-1e4, 1e4),
        finite(1, 1e4),
        finite(0, 1),
        (low, width, from, length, t) => {
          const value = low + t * width;
          const mapped = linearScale([low, low + width], [from, from + length], value);
          expect(mapped).toBeGreaterThanOrEqual(from - 1e-6);
          expect(mapped).toBeLessThanOrEqual(from + length + 1e-6);
          const back = invertLinear([low, low + width], [from, from + length], mapped);
          expect(Math.abs(back - value)).toBeLessThan(1e-6 * (1 + Math.abs(value)));
        },
      ),
    );
  });

  it("[UI-CHS-06] pointPositions spaces points to the ends, and bandPositions centers bands, in either direction", () => {
    expect(pointPositions(0, 0, 100)).toEqual([]);
    expect(pointPositions(1, 0, 100)).toEqual([50]);
    expect(pointPositions(3, 0, 100)).toEqual([0, 50, 100]);
    expect(pointPositions(3, 100, 0)).toEqual([100, 50, 0]);
    const bands = bandPositions(4, 0, 100, 0.2);
    expect(bands.centers).toEqual([12.5, 37.5, 62.5, 87.5]);
    expect(bands.step).toBe(25);
    expect(bands.bandwidth).toBe(20);
    expect(bandPositions(2, 100, 0).centers).toEqual([75, 25]);
    expect(bandPositions(0, 0, 100).centers).toEqual([]);
  });

  it("[UI-CHS-07] property: bands stay inside the range and never overlap", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        finite(-500, 500),
        finite(1, 500),
        fc.boolean(),
        finite(0, 0.9),
        (count, from, length, mirrored, padding) => {
          const start = mirrored ? from + length : from;
          const end = mirrored ? from : from + length;
          const { centers, step, bandwidth } = bandPositions(count, start, end, padding);
          expect(centers).toHaveLength(count);
          const low = Math.min(start, end);
          const high = Math.max(start, end);
          for (const center of centers) {
            expect(center - bandwidth / 2).toBeGreaterThanOrEqual(low - 1e-9);
            expect(center + bandwidth / 2).toBeLessThanOrEqual(high + 1e-9);
          }
          expect(bandwidth).toBeLessThanOrEqual(Math.abs(step) + 1e-9);
        },
      ),
    );
  });
});

describe("chart-scale: nearestIndex", () => {
  it("[UI-CHS-08] finds the nearest position, the first of two equal ones, and -1 for none", () => {
    expect(nearestIndex([10, 50, 90], 60)).toBe(1);
    expect(nearestIndex([0, 10], 5)).toBe(0);
    expect(nearestIndex([], 60)).toBe(-1);
    expect(nearestIndex([5], 999)).toBe(0);
    expect(nearestIndex([10, 50, 90], Number.NaN)).toBe(-1);
    expect(nearestIndex([90, 50, 10], 60)).toBe(1);
  });

  it("[UI-CHS-09] property: it agrees with a scan, for ascending and descending positions", () => {
    fc.assert(
      fc.property(
        fc.array(finite(-1000, 1000).map(rounded), { minLength: 1, maxLength: 60 }),
        finite(-1200, 1200).map(rounded),
        fc.boolean(),
        (values, x, descending) => {
          const positions = [...values].sort((a, b) => (descending ? b - a : a - b));
          let best = -1;
          let distance = Number.POSITIVE_INFINITY;
          positions.forEach((position, index) => {
            const gap = Math.abs(position - x);
            if (gap < distance) {
              distance = gap;
              best = index;
            }
          });
          expect(nearestIndex(positions, x)).toBe(best);
        },
      ),
    );
  });
});

describe("chart-scale: paths", () => {
  it("[UI-CHS-10] linePath joins points with lines, steps or smooth curves, and areaPath closes to a baseline or a second edge", () => {
    expect(linePath([])).toBe("");
    expect(linePath([[1, 2]])).toBe("M1.00 2.00");
    expect(
      linePath([
        [0, 1],
        [2, 3],
      ]),
    ).toBe("M0.00 1.00 L2.00 3.00");
    expect(
      linePath(
        [
          [0, 0],
          [10, 10],
        ],
        "step",
      ),
    ).toBe("M0.00 0.00 L5.00 0.00 L5.00 10.00 L10.00 10.00");
    expect(
      linePath(
        [
          [0, 0],
          [30, 30],
          [60, 0],
        ],
        "monotone",
      ),
    ).toMatch(/^M0\.00 0\.00 C[\d. -]+ C[\d. -]+$/);
    expect(
      areaPath(
        [
          [0, 10],
          [50, 4],
        ],
        100,
      ),
    ).toBe("M0.00 10.00 L50.00 4.00 L50.00 100.00 L0.00 100.00 Z");
    expect(areaPath([], 100)).toBe("");
    expect(
      areaPath(
        [
          [0, 10],
          [50, 4],
        ],
        [
          [0, 30],
          [50, 20],
        ],
      ),
    ).toBe("M0.00 10.00 L50.00 4.00 L50.00 20.00 L0.00 30.00 Z");
  });

  it("[UI-CHS-11] property: a monotone curve never overshoots its data, in either x direction", () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(finite(1, 40), finite(-100, 100)), { minLength: 2, maxLength: 25 }),
        fc.boolean(),
        (steps, backwards) => {
          let x = 0;
          const points: Array<[number, number]> = steps.map(([width, y]) => {
            x += backwards ? -width : width;
            return [x, y];
          });
          const path = linePath(points, "monotone");
          const segments = path.split("C").slice(1);
          expect(segments).toHaveLength(points.length - 1);
          segments.forEach((segment, index) => {
            const [c1x, c1y, c2x, c2y, ex, ey] = numbersOf(segment) as [
              number,
              number,
              number,
              number,
              number,
              number,
            ];
            const from = points[index] as [number, number];
            const to = points[index + 1] as [number, number];
            const low = Math.min(from[1], to[1]) - 0.006;
            const high = Math.max(from[1], to[1]) + 0.006;
            expect(c1y).toBeGreaterThanOrEqual(low);
            expect(c1y).toBeLessThanOrEqual(high);
            expect(c2y).toBeGreaterThanOrEqual(low);
            expect(c2y).toBeLessThanOrEqual(high);
            const xs = [Math.min(from[0], to[0]) - 0.006, Math.max(from[0], to[0]) + 0.006];
            expect(c1x).toBeGreaterThanOrEqual(xs[0] as number);
            expect(c1x).toBeLessThanOrEqual(xs[1] as number);
            expect(c2x).toBeGreaterThanOrEqual(xs[0] as number);
            expect(c2x).toBeLessThanOrEqual(xs[1] as number);
            expect(Math.abs(ex - to[0])).toBeLessThan(0.006);
            expect(Math.abs(ey - to[1])).toBeLessThan(0.006);
          });
        },
      ),
    );
  });

  it("[UI-CHS-12] polarPoint measures clockwise from the top, and slicePath and arcPath draw wedges, rings and full circles", () => {
    const right = polarPoint(50, 50, 40, Math.PI / 2);
    expect(right[0]).toBeCloseTo(90, 6);
    expect(right[1]).toBeCloseTo(50, 6);
    const up = polarPoint(50, 50, 40, 0);
    expect(up[0]).toBeCloseTo(50, 6);
    expect(up[1]).toBeCloseTo(10, 6);
    expect(slicePath(50, 50, 40, 0, Math.PI / 2)).toBe(
      "M50 50 L50.00 10.00 A40 40 0 0 1 90.00 50.00 Z",
    );
    expect(slicePath(50, 50, 40, 0, Math.PI * 1.5)).toContain("A40 40 0 1 1");
    expect(slicePath(50, 50, 40, 1, 1)).toBe("");
    expect(slicePath(50, 50, 40, 0, Math.PI * 2).match(/A/g)).toHaveLength(2);
    const ring = arcPath(50, 50, 20, 40, 0, Math.PI / 2);
    expect(ring).toBe(
      "M50.00 10.00 A40 40 0 0 1 90.00 50.00 L70.00 50.00 A20 20 0 0 0 50.00 30.00 Z",
    );
    expect(arcPath(50, 50, 20, 40, 0, Math.PI * 2).match(/A/g)).toHaveLength(4);
    expect(arcPath(50, 50, 0, 40, 0, Math.PI / 2)).toBe(slicePath(50, 50, 40, 0, Math.PI / 2));
  });

  it("[UI-CHS-13] property: every wedge path is finite and every point sits on its circle", () => {
    fc.assert(
      fc.property(
        finite(1, 200),
        finite(0, 1),
        finite(-7, 7),
        finite(0, 7),
        finite(-300, 300),
        finite(-300, 300),
        (outer, innerShare, start, sweep, cx, cy) => {
          const path = arcPath(cx, cy, outer * innerShare, outer, start, start + sweep);
          expect(path).not.toMatch(/NaN|Infinity/);
          if (start + sweep > start && outer * innerShare < outer) {
            expect(path.endsWith("Z")).toBe(true);
          }
          const [x, y] = polarPoint(cx, cy, outer, start);
          expect(Math.hypot(x - cx, y - cy)).toBeCloseTo(outer, 6);
        },
      ),
    );
  });
});

describe("chart-scale: pie, stack, decimation", () => {
  it("[UI-CHS-14] pieAngles sizes slices by their share, skips negatives and pads between slices", () => {
    const slices = pieAngles([1, 1, 2]);
    expect(slices.map((slice) => slice.fraction)).toEqual([0.25, 0.25, 0.5]);
    expect(slices[0]?.start).toBe(0);
    expect(slices[2]?.end).toBeCloseTo(Math.PI * 2, 9);
    expect(pieAngles([3, -5, 1]).map((slice) => slice.fraction)).toEqual([0.75, 0, 0.25]);
    expect(pieAngles([0, 0]).map((slice) => slice.fraction)).toEqual([0, 0]);
    expect(pieAngles([]).length).toBe(0);
    const half = pieAngles([1, 1], { start: -Math.PI / 2, end: Math.PI / 2 });
    expect(half[0]?.start).toBeCloseTo(-Math.PI / 2, 9);
    expect(half[1]?.end).toBeCloseTo(Math.PI / 2, 9);
    const padded = pieAngles([1, 1], { pad: 0.2 });
    expect((padded[0]?.end ?? 0) + 0.1).toBeLessThan(padded[1]?.start ?? 0);
  });

  it("[UI-CHS-15] property: slices are ordered, inside the arc, and their spans add up to it", () => {
    fc.assert(
      fc.property(
        fc.array(finite(-5, 100), { maxLength: 30 }),
        finite(-4, 4),
        finite(0.1, 6.3),
        finite(0, 0.5),
        (values, start, span, pad) => {
          const end = start + span;
          const slices = pieAngles(values, { start, end, pad });
          expect(slices).toHaveLength(values.length);
          let previous = start - 1e-9;
          let covered = 0;
          for (const slice of slices) {
            expect(slice.start).toBeGreaterThanOrEqual(previous - 1e-9);
            expect(slice.end).toBeGreaterThanOrEqual(slice.start - 1e-9);
            expect(slice.end).toBeLessThanOrEqual(end + 1e-9);
            previous = slice.end;
            covered += slice.end - slice.start;
          }
          const positives = values.filter((value) => value > 0);
          const total = slices.reduce((sum, slice) => sum + slice.fraction, 0);
          if (positives.length === 0) expect(total).toBe(0);
          else {
            expect(total).toBeCloseTo(1, 9);
            expect(covered).toBeLessThanOrEqual(span + 1e-9);
          }
        },
      ),
    );
  });

  it("[UI-CHS-16] stackColumns piles positives up and negatives down, per row", () => {
    const { lower, upper } = stackColumns([
      [1, 2],
      [3, -4],
      [5, 6],
    ]);
    expect(lower).toEqual([
      [0, 0],
      [1, 0],
      [4, 2],
    ]);
    expect(upper).toEqual([
      [1, 2],
      [4, -4],
      [9, 8],
    ]);
    expect(stackColumns([])).toEqual({ lower: [], upper: [] });
  });

  it("[UI-CHS-17] property: a stack segment is as tall as its value and segments of one row never overlap", () => {
    fc.assert(
      fc.property(
        fc.array(fc.array(finite(-50, 50), { minLength: 4, maxLength: 4 }), {
          minLength: 1,
          maxLength: 5,
        }),
        (columns) => {
          const { lower, upper } = stackColumns(columns);
          for (let row = 0; row < 4; row += 1) {
            const spans: Array<[number, number]> = [];
            columns.forEach((column, index) => {
              const value = column[row] as number;
              const low = (lower[index] as number[])[row] as number;
              const high = (upper[index] as number[])[row] as number;
              expect(high - low).toBeCloseTo(value, 9);
              if (Math.abs(value) > 1e-6) spans.push([Math.min(low, high), Math.max(low, high)]);
            });
            spans.sort((a, b) => a[0] - b[0]);
            for (let i = 1; i < spans.length; i += 1) {
              expect((spans[i] as [number, number])[0]).toBeGreaterThanOrEqual(
                (spans[i - 1] as [number, number])[1] - 1e-9,
              );
            }
          }
        },
      ),
    );
  });

  it("[UI-CHS-18] decimateIndices keeps every index of a small series and caps a long one, keeping its ends", () => {
    expect(decimateIndices([[1, 2, 3]], 5000)).toEqual([0, 1, 2]);
    expect(decimateIndices([], 10)).toEqual([]);
    const long = Array.from({ length: 100_000 }, (_, index) => Math.sin(index / 50) * 100);
    const kept = decimateIndices([long], 5000);
    expect(kept.length).toBeLessThanOrEqual(5000);
    expect(kept[0]).toBe(0);
    expect(kept[kept.length - 1]).toBe(99_999);
    const values = kept.map((index) => long[index] as number);
    expect(maxOf(values)).toBe(maxOf(long));
    expect(minOf(values)).toBe(minOf(long));
  });

  it("[UI-CHS-19] property: decimation is sorted, unique, bounded, and keeps the extremes of every series", () => {
    fc.assert(
      fc.property(
        fc.array(fc.array(finite(-1000, 1000), { minLength: 60, maxLength: 400 }), {
          minLength: 1,
          maxLength: 4,
        }),
        fc.integer({ min: 12, max: 80 }),
        (many, limit) => {
          const length = Math.min(...many.map((column) => column.length));
          const columns = many.map((column) => column.slice(0, length));
          const kept = decimateIndices(columns, limit);
          expect(kept.length).toBeLessThanOrEqual(Math.max(limit, 2 * columns.length + 2));
          expect(kept[0]).toBe(0);
          expect(kept[kept.length - 1]).toBe(length - 1);
          for (let i = 1; i < kept.length; i += 1) {
            expect(kept[i] as number).toBeGreaterThan(kept[i - 1] as number);
          }
          for (const column of columns) {
            const values = kept.map((index) => column[index] as number);
            expect(maxOf(values)).toBe(maxOf(column));
            expect(minOf(values)).toBe(minOf(column));
          }
        },
      ),
    );
  });
});

describe("chart-scale: css keys", () => {
  it("[UI-CHS-20] cssKey makes a series key safe for a custom property name", () => {
    expect(cssKey("sales")).toBe("sales");
    expect(cssKey("Chrome browser")).toBe("Chrome-browser");
    expect(cssKey("a.b;c}")).toBe("a-b-c-");
    expect(cssKey("")).toBe("series");
    fc.assert(
      fc.property(fc.string(), (key) => {
        expect(cssKey(key)).toMatch(/^[A-Za-z0-9_-]+$/);
      }),
    );
  });
});
