import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  type TooltipContentProps,
  Tooltip as TooltipPrimitive,
  type TooltipProps,
  type TooltipProviderProps,
  type TooltipTriggerProps,
  tooltipGroupContext,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * Shares the open delays between the tooltips inside it. `delayDuration` is how long the pointer
 * must rest on a trigger before its tooltip opens, and it defaults to `0` here. `skipDelayDuration`
 * is the window after one tooltip closes during which the next one opens without a delay. Renders
 * no element; put one near the root of the application.
 *
 * @param props - The props: `delayDuration`, `skipDelayDuration`, and the other provider props.
 * @returns The provider, wrapping its children.
 * @example
 * ```tsx
 * import { TooltipProvider } from "@/components/ui/tooltip";
 *
 * export function App() {
 *   return (
 *     <TooltipProvider delayDuration={400}>
 *       <p>Hover a control to see its tooltip.</p>
 *     </TooltipProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Tooltip}
 */
function TooltipProvider(props: TooltipProviderProps): JSX.Element {
  return <TooltipPrimitive.Provider {...props} delayDuration={props.delayDuration ?? 0} />;
}

/**
 * A short label that appears when its trigger is hovered or focused. Put a {@link TooltipTrigger}
 * and a {@link TooltipContent} inside it. Control it with `open` and `onOpenChange`, or start it
 * with `defaultOpen`. Inside a {@link TooltipProvider} it uses the provider's delays. On its own it
 * opens without a delay.
 *
 * Keyboard and ARIA: keyboard focus on the trigger opens the tooltip at once, and blurring the
 * trigger closes it. Escape closes it too. A mouse that rests on the trigger opens it after the
 * delay, and touch never opens it. The trigger is a `button` with `aria-describedby` pointing at the
 * content while it is open, and the content is a `role="tooltip"`. A tooltip describes its trigger
 * and does not name it, so give an icon-only trigger an `aria-label`.
 *
 * shadcn/ui differences: `as` replaces `asChild` on the trigger, and `class` replaces `className`.
 *
 * @param props - The props, see {@link TooltipProps}.
 * @returns The tooltip, with its trigger and content inside.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 *
 * export function SaveHint() {
 *   return (
 *     <Tooltip>
 *       <TooltipTrigger as={Button} variant="outline">
 *         Save
 *       </TooltipTrigger>
 *       <TooltipContent>Save the document</TooltipContent>
 *     </Tooltip>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link TooltipProvider}
 */
function Tooltip(props: TooltipProps): JSX.Element {
  // A tooltip with a provider above it keeps that provider's delay and skip window.
  const grouped = tooltipGroupContext.useOptional() !== undefined;
  return grouped ? (
    <TooltipPrimitive {...props} />
  ) : (
    <TooltipProvider>
      <TooltipPrimitive {...props} />
    </TooltipProvider>
  );
}

/**
 * The element the tooltip describes, and its anchor. It renders a `button`; `as` renders another
 * element instead, such as a shadcn/ui `Button`.
 *
 * Keyboard and ARIA: it takes focus, which opens the tooltip; blurring, pressing, clicking or
 * pressing Escape closes it. While the tooltip is open it has `aria-describedby` pointing at the
 * content, and its `data-state` is `"closed"`, `"delayed-open"` or `"instant-open"`.
 *
 * shadcn/ui differences: `as` replaces `asChild`, and `class` replaces `className`.
 *
 * @param props - The props: `as` and the attributes of the trigger element.
 * @returns The trigger element.
 * @example
 * ```tsx
 * import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 *
 * export function BoldHint() {
 *   return (
 *     <Tooltip>
 *       <TooltipTrigger aria-label="Bold">B</TooltipTrigger>
 *       <TooltipContent>Bold</TooltipContent>
 *     </Tooltip>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TooltipTrigger<T extends PolymorphicTarget = "button">(
  props: TooltipTriggerProps<T>,
): JSX.Element {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * The tooltip bubble with its arrow. It is rendered in `document.body` and placed above the trigger
 * by default; `side` and `sideOffset` change that. Assistive technology reads a visually hidden copy
 * of the content with `role="tooltip"`, so the visible content may hold markup and styling.
 *
 * Keyboard and ARIA: the content takes no focus and has no keys of its own; Escape closes the
 * tooltip (see {@link Tooltip}). The trigger's `aria-describedby` points at the hidden copy.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `side`, `sideOffset`, `ariaLabel`, and the attributes of the bubble.
 * @returns The bubble, rendered in a portal.
 * @example
 * ```tsx
 * import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 *
 * export function AddHint() {
 *   return (
 *     <Tooltip>
 *       <TooltipTrigger aria-label="Add">+</TooltipTrigger>
 *       <TooltipContent side="bottom">Add to library</TooltipContent>
 *     </Tooltip>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Tooltip}
 */
function TooltipContent(props: TooltipContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "sideOffset", "children"]);
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={local.sideOffset ?? 0}
        class={cn(
          "z-50 w-fit origin-(--primitives-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 forced-colors:border",
          local.class,
        )}
        {...rest}
      >
        {local.children}
        <TooltipPrimitive.Arrow class="fill-foreground" width={10} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
