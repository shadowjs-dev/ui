import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Anything a ShadowJS `class` attribute accepts: strings, numbers, nested (readonly) arrays and
 * `{ name: condition }` objects. Falsy values are skipped.
 * @since 1.0.0
 */
export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | readonly ClassValue[]
  | { readonly [name: string]: unknown };

/**
 * Joins class names (strings, arrays, `{ name: condition }` objects) and resolves Tailwind
 * conflicts, so the last utility wins: `cn("px-2", props.class)` lets the caller override `px-2`.
 *
 * @param inputs - Any mix of class values; falsy values are skipped.
 * @returns One class string with conflicting Tailwind utilities removed.
 * @example
 * ```ts
 * import { cn } from "@/lib/utils";
 *
 * const active = true;
 * export const classes = cn("px-2 py-1", active && "bg-primary", "px-4");
 * // "py-1 bg-primary px-4"
 * ```
 * @since 1.0.0
 * @see {@link ClassValue}
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...(inputs as Parameters<typeof clsx>)));
}
