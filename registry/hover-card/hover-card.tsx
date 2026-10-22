import { splitProps } from "@shadow-js/core";
import {
  type HoverCardContentProps,
  HoverCard as HoverCardPrimitive,
  type HoverCardProps as HoverCardRootProps,
  type HoverCardTriggerProps,
  type PolymorphicTarget,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * Props of {@link HoverCard}: the primitive's root props, and `delay`, the shadcn name for `openDelay`.
 * @see {@link HoverCard}
 * @since 1.0.0
 */
export type HoverCardProps = HoverCardRootProps & {
  /**
   * The shadcn name for `openDelay`: how long the pointer (or focus) rests on the trigger before the card
   * opens, in ms. The delays live on the root, so `delay` is a root prop, not a trigger prop. When both are
   * given, `openDelay` wins.
   * @default 700
   * @see {@link HoverCardProps}
   */
  readonly delay?: number | undefined;
};

/**
 * A preview card that opens when the pointer rests on a link, or when keyboard focus reaches it. Use it
 * for supplementary detail about a link, such as a profile preview. The card is for sighted pointer users
 * and is not an interactive dialog: it is not announced, it never traps focus, and touch devices never
 * open it. Whatever it shows must also be reachable by following the link.
 *
 * The pointer opens the card after `openDelay` (700 ms by default, `delay` is its shadcn name) and closes it
 * after `closeDelay` (300 ms by default), so the pointer can cross the gap into the card. It is controlled with `open` and
 * `onOpenChange`, or uncontrolled with `defaultOpen`.
 *
 * Keyboard and ARIA: focus on the trigger opens the card and leaving the trigger closes it, after the
 * delays. Tab from an open trigger enters the card, Shift+Tab from its first control returns to the
 * trigger, and Escape closes the card and returns focus to the trigger. No ARIA role is set, and the
 * trigger is a link in the tab order. Name the link by its text.
 *
 * shadcn/ui differences: `as` replaces `asChild` on {@link HoverCardTrigger}, and the prop is `class`,
 * not `className`. Every part has a `data-slot`.
 *
 * @param props The card props: see {@link HoverCardProps}.
 * @returns The card. It renders no element of its own.
 * @example
 * import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
 *
 * export function AuthorPreview() {
 *   return (
 *     <HoverCard>
 *       <HoverCardTrigger href="https://shadow-js.dev">@shadow-js</HoverCardTrigger>
 *       <HoverCardContent>The fine-grained UI framework.</HoverCardContent>
 *     </HoverCard>
 *   );
 * }
 * @see {@link HoverCardTrigger}
 * @see {@link HoverCardContent}
 * @since 1.0.0
 */
function HoverCard(props: HoverCardProps): JSX.Element {
  const [local, rest] = splitProps(props, ["delay"]);
  return <HoverCardPrimitive {...rest} openDelay={rest.openDelay ?? local.delay} />;
}

/**
 * The link the card previews. It renders an `a`, so give it an `href`; `as` renders another element. The
 * mouse or a pen opens the card after the open delay, and keyboard focus does the same. Touch never opens
 * it, not even through the focus a tap can cause.
 *
 * @param props The trigger props: the attributes of the rendered element, and `as`.
 * @returns The trigger link.
 * @throws Error when rendered outside a {@link HoverCard}.
 * @example
 * import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
 *
 * export function AdaLink() {
 *   return (
 *     <HoverCard>
 *       <HoverCardTrigger href="/ada" class="underline">
 *         Ada Lovelace
 *       </HoverCardTrigger>
 *       <HoverCardContent>Ada Lovelace wrote the first program.</HoverCardContent>
 *     </HoverCard>
 *   );
 * }
 * @see {@link HoverCard}
 * @since 1.0.0
 */
function HoverCardTrigger<T extends PolymorphicTarget = "a">(
  props: HoverCardTriggerProps<T>,
): JSX.Element {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

/**
 * The card. It is rendered in `document.body` and placed against the trigger, centered below it by
 * default with a 4 px gap (`side="bottom"`, `align="center"` and `sideOffset={4}`, all of which you can
 * change). Keyboard and ARIA: see {@link HoverCard}; the card has no keys or role of its own. The
 * pointer can move from the trigger onto the card without closing it. Escape and a press outside close
 * it. The card does not take focus, and focus leaving the card closes it.
 *
 * @param props The card props: `side` (`"bottom"` by default, or `"top"`, `"left"` or `"right"`), `align`,
 * `sideOffset`, `class`, and the attributes of the rendered `div`.
 * @returns The card, rendered in a portal while it is open.
 * @throws Error when rendered outside a {@link HoverCard}.
 * @example
 * import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
 *
 * export function Profile() {
 *   return (
 *     <HoverCard>
 *       <HoverCardTrigger href="/ada">@ada</HoverCardTrigger>
 *       <HoverCardContent class="w-80">
 *         <p>Ada Lovelace, 1815 to 1852.</p>
 *       </HoverCardContent>
 *     </HoverCard>
 *   );
 * }
 * @see {@link HoverCardTrigger}
 * @since 1.0.0
 */
function HoverCardContent(props: HoverCardContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "side", "align", "sideOffset"]);
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        side={local.side ?? "bottom"}
        align={local.align ?? "center"}
        sideOffset={local.sideOffset ?? 4}
        class={cn(
          "z-50 w-64 origin-(--primitives-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          local.class,
        )}
        {...rest}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
