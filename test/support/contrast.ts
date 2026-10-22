/**
 * WCAG 2 contrast helpers for the theme tests: the `oklch()` values of styles/themes/*.css as sRGB,
 * relative luminance, alpha compositing and the ratio. Node only; no DOM.
 */

/** AA for normal text (WCAG 2.2 1.4.3). */
export const AA_NORMAL = 4.5;

/** A gamma-encoded sRGB color, each channel in 0..1. */
export type Rgb = readonly [number, number, number];
export type Mode = "light" | "dark";

/** The value of a required lookup; throws with `what` when it is missing. */
export function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`missing ${what}`);
  return value;
}

/** Capture group `index` of a match that must exist: throws with `what` when it does not. */
export function group(match: RegExpExecArray | null, index: number, what: string): string {
  return must(must(match, what)[index], what);
}

/** The `--name: value` pairs of one CSS block (`:root` or `.dark`). */
export function block(css: string, selector: string): Map<string, string> {
  const open = css.indexOf(`${selector} {`);
  if (open === -1) return new Map();
  const body = css.slice(open, css.indexOf("}", open));
  const vars = new Map<string, string>();
  for (const match of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    vars.set(must(match[1], "variable name"), must(match[2], "variable value").trim());
  }
  return vars;
}

/** The tokens of one mode: the light block, overridden by the dark block in dark mode. */
export function tokensOf(css: string, mode: Mode): Map<string, string> {
  const light = block(css, ":root");
  return mode === "light" ? light : new Map([...light, ...block(css, ".dark")]);
}

/** `oklch(L C H)` as gamma-encoded sRGB, out-of-gamut channels clipped. */
export function oklchToSrgb(value: string): Rgb {
  const parts = must(
    /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value),
    `oklch ${value}`,
  );
  const L = Number(parts[1]);
  const C = Number(parts[2]);
  const hue = (Number(parts[3]) * Math.PI) / 180;
  const a = C * Math.cos(hue);
  const b = C * Math.sin(hue);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clip = (c: number) => Math.min(1, Math.max(0, c));
  const encode = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  const r = encode(clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s));
  const g = encode(clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s));
  const bl = encode(clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s));
  return [r, g, bl];
}

/** Relative luminance (WCAG 2 definition) of a gamma-encoded sRGB color. */
export function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** A color of alpha `alpha` painted over an opaque background, composited in sRGB. */
export function over(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  const mix = (i: 0 | 1 | 2) => alpha * fg[i] + (1 - alpha) * bg[i];
  return [mix(0), mix(1), mix(2)];
}

/** The WCAG contrast ratio of two colors, from 1 to 21. */
export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** The sRGB color of a token of the given block. */
export function colorOf(tokens: Map<string, string>, name: string): Rgb {
  return oklchToSrgb(must(tokens.get(name), `token --${name}`));
}
