import { splitProps } from "@shadow-js/core";
import {
  type TabsContentProps,
  type TabsListProps,
  Tabs as TabsPrimitive,
  type TabsProps,
  type TabsTriggerProps,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A set of sections, one visible at a time, switched with tabs. Control the selected tab with
 * `value` and `onValueChange`, or start it with `defaultValue`. `orientation` (`"horizontal"` or
 * `"vertical"`), `dir` and `activationMode` are passed to the primitive.
 *
 * Keyboard and ARIA: the selected tab is the one tab stop of the list. Arrow keys move between
 * enabled tabs (Up and Down when vertical, Left and Right when horizontal, swapped in a
 * right-to-left layout), Home and End go to the first and last tabs, and the arrows wrap around.
 * With `activationMode="automatic"` (the default) moving focus selects the tab; with `"manual"` only
 * Enter, Space or a click selects it. A click always selects. The list is `role="tablist"` and each
 * tab is `role="tab"` with `aria-selected`. The panel is `role="tabpanel"`, named by its tab, and
 * focusable so its content can be reached. Name the list with a `TabsList` `aria-label`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props, see {@link TabsProps}.
 * @returns The root `div` with the list and the panels inside.
 * @example
 * ```tsx
 * import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 *
 * export function SettingsTabs() {
 *   return (
 *     <Tabs defaultValue="account">
 *       <TabsList aria-label="Settings">
 *         <TabsTrigger value="account">Account</TabsTrigger>
 *         <TabsTrigger value="password">Password</TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="account">Account settings</TabsContent>
 *       <TabsContent value="password">Password settings</TabsContent>
 *     </Tabs>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link TabsList}
 */
function Tabs(props: TabsProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TabsPrimitive
      data-slot="tabs"
      class={cn("group/tabs flex flex-col gap-2 data-[orientation=vertical]:flex-row", local.class)}
      {...rest}
    />
  );
}

/**
 * The own props of {@link TabsList}, on top of the primitive's list props.
 * @since 1.0.0
 * @see {@link TabsList}
 */
export interface TabsListOwnProps {
  /**
   * The look of the list. `"default"` is a muted pill; `"line"` is a transparent list whose selected tab
   * has an underline.
   * @default "default"
   */
  readonly variant?: "default" | "line" | undefined;
}

/**
 * The row (or column, when vertical) of tabs. It is a `role="tablist"` and owns the arrow-key
 * movement between its tabs. Name it with `aria-label` or `aria-labelledby`.
 *
 * Keyboard and ARIA: see {@link Tabs}. The list sets `aria-orientation="vertical"` only when the
 * tabs are stacked. Pass `loop={false}` to stop the arrows at the ends instead of wrapping.
 *
 * `variant` is `"default"` (a muted pill behind the tabs) or `"line"` (a transparent list, with an
 * underline under the selected tab). It is styled by the list and the trigger together, so the line
 * variant works through the triggers' own classes.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `loop`, `variant` and the attributes of the list `div`.
 * @returns The `div` with the tabs inside.
 * @default variant "default"
 * @example
 * ```tsx
 * import { TabsList, TabsTrigger } from "@/components/ui/tabs";
 *
 * export function Sections() {
 *   return (
 *     <TabsList aria-label="Sections">
 *       <TabsTrigger value="overview">Overview</TabsTrigger>
 *       <TabsTrigger value="activity">Activity</TabsTrigger>
 *     </TabsList>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TabsList(props: TabsListProps & TabsListOwnProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  const variant = (): "default" | "line" => local.variant ?? "default";
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant()}
      class={cn(
        "group/tabs-list inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col",
        variant() === "line" ? "gap-1 bg-transparent" : "bg-muted",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * One tab of a {@link Tabs}: the button that selects the panel with the same `value`. A disabled
 * tab cannot be selected and the arrow keys skip it.
 *
 * Keyboard and ARIA: a `button` with `role="tab"`, `aria-selected` (`"true"` or `"false"`),
 * `aria-controls` pointing at its panel, and `data-state` (`"active"` or `"inactive"`). It is in the
 * tab order only when selected. Enter and Space select it, and so does a click. Arrow keys and
 * Home and End are handled by the list (see {@link Tabs}).
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `value` (required), `disabled`, and the attributes of the `button`.
 * @returns The tab `button`.
 * @example
 * ```tsx
 * import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 *
 * export function Billing() {
 *   return (
 *     <Tabs defaultValue="plans">
 *       <TabsList aria-label="Billing">
 *         <TabsTrigger value="plans">Plans</TabsTrigger>
 *         <TabsTrigger value="invoices" disabled>
 *           Invoices
 *         </TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="plans">Choose a plan.</TabsContent>
 *     </Tabs>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TabsTrigger(props: TabsTriggerProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      class={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-end-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground forced-colors:disabled:opacity-100 forced-colors:data-[state=active]:bg-[Highlight] forced-colors:data-[state=active]:text-[HighlightText] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The panel of the tab with the same `value`. Only the selected panel is rendered; the others are
 * removed until they are selected again.
 *
 * Keyboard and ARIA: a `div` with `role="tabpanel"`, named by its tab (`aria-labelledby`), with
 * `tabindex="0"` so keyboard users can reach its content, and `data-state` (`"active"` or
 * `"inactive"`). The component adds no key handling.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `value` (required), `forceMount`, and the attributes of the `div`.
 * @returns The panel `div`.
 * @example
 * ```tsx
 * import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 *
 * export function Profile() {
 *   return (
 *     <Tabs defaultValue="general">
 *       <TabsList aria-label="Profile">
 *         <TabsTrigger value="general">General</TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="general">Name and email.</TabsContent>
 *     </Tabs>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TabsContent(props: TabsContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      class={cn("flex-1 outline-none", local.class)}
      {...rest}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
