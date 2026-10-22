import type { Accessor } from "@shadow-js/core";
import {
  type Direction,
  DirectionProvider as DirectionPrimitive,
  useDirection as useDirectionPrimitive,
} from "@shadow-js/primitives";
import type { JSX, JsxChild } from "@shadow-js/web";

/**
 * Props of {@link DirectionProvider}: the direction and the subtree. `direction` is shadcn's name for `dir`; when both
 * are given, `dir` wins.
 * @since 1.0.0
 * @see {@link DirectionProvider}
 */
export interface DirectionProviderProps {
  /** The reading direction for every component below: `"ltr"` or `"rtl"`. @default none */
  readonly dir?: Direction | undefined;
  /** The same, under the name shadcn uses. @default none */
  readonly direction?: Direction | undefined;
  /** The subtree that reads the direction. @default none */
  readonly children?: JsxChild;
}

/**
 * Sets the reading direction for the components below it: the arrow keys of tabs, menus, sliders and carousels,
 * and the side popovers open on. It renders no element and writes no attribute, so also set `dir` on the document (`<html dir="rtl">`)
 * or on the container: the provider tells the components, and the `dir` attribute tells the browser, which lays out the text.
 * Without a provider each component reads the `dir` of the document.
 *
 * Keyboard and ARIA: none of its own. It changes which arrow key means "next" in right-to-left text.
 *
 * Compared with shadcn/ui: `dir` is the primitives' name and `direction` is accepted as shadcn's.
 *
 * @param props - The direction and the subtree.
 * @returns The subtree.
 * @example
 * ```tsx
 * import { DirectionProvider } from "@/components/ui/direction";
 * import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
 *
 * export function RightToLeftTabs() {
 *   return (
 *     <DirectionProvider dir="rtl">
 *       <Tabs defaultValue="one" dir="rtl">
 *         <TabsList>
 *           <TabsTrigger value="one">One</TabsTrigger>
 *         </TabsList>
 *       </Tabs>
 *     </DirectionProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link useDirection}
 */
function DirectionProvider(props: DirectionProviderProps): JSX.Element {
  return (
    <DirectionPrimitive dir={props.dir ?? props.direction ?? "ltr"}>
      {props.children}
    </DirectionPrimitive>
  );
}

/**
 * Reads the reading direction at this point of the tree: the nearest {@link DirectionProvider}, else the `dir` of the document, else
 * `"ltr"`. Call it while a component sets up, like any hook; it returns an accessor, so a change of direction updates what reads it.
 *
 * Keyboard and ARIA: none of its own.
 *
 * @param local - An accessor of a direction the caller was given, which wins over the provider.
 * @returns An accessor of `"ltr"` or `"rtl"`.
 * @example
 * ```tsx
 * import { useDirection } from "@/components/ui/direction";
 *
 * export function Hint() {
 *   const dir = useDirection();
 *   return <span>{dir() === "rtl" ? "Press the left arrow" : "Press the right arrow"}</span>;
 * }
 * ```
 * @since 1.0.0
 * @see {@link DirectionProvider}
 */
function useDirection(local?: () => Direction | undefined): Accessor<Direction> {
  return useDirectionPrimitive(local);
}

export { DirectionProvider, useDirection };
