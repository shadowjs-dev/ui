import { splitProps } from "@shadow-js/core";
import {
  type MessageScrollerButtonProps,
  type MessageScrollerContentProps,
  type MessageScrollerItemProps,
  MessageScroller as MessageScrollerPrimitive,
  type MessageScrollerProviderProps,
  type MessageScrollerRootProps,
  type MessageScrollerViewportProps,
  type PolymorphicTarget,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * The state of a conversation's scroller. It renders no element: put the {@link MessageScroller} frame, the viewport, the content and the rows inside it.
 * Its props are the behavior: `autoScroll` follows the newest text while the reader stays at the bottom, `defaultScrollPosition` says where a saved
 * thread opens (`"start"`, `"end"` or `"last-anchor"`), `scrollPreviousItemPeek` is how much of the row before a new turn stays visible, and
 * `scrollMargin` and `scrollEdgeThreshold` tune the placement and the edges.
 *
 * Keyboard and ARIA: none of its own. See {@link MessageScrollerViewport}.
 *
 * @param props - The behavior props and the subtree.
 * @returns The subtree.
 * @example
 * ```tsx
 * import {
 *   MessageScroller,
 *   MessageScrollerButton,
 *   MessageScrollerContent,
 *   MessageScrollerItem,
 *   MessageScrollerProvider,
 *   MessageScrollerViewport,
 * } from "@/components/ui/message-scroller";
 *
 * export function Thread() {
 *   return (
 *     <MessageScrollerProvider autoScroll>
 *       <MessageScroller class="h-96">
 *         <MessageScrollerViewport>
 *           <MessageScrollerContent>
 *             <MessageScrollerItem messageId="1" scrollAnchor>
 *               Hello
 *             </MessageScrollerItem>
 *           </MessageScrollerContent>
 *         </MessageScrollerViewport>
 *         <MessageScrollerButton />
 *       </MessageScroller>
 *     </MessageScrollerProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link MessageScroller}
 */
function MessageScrollerProvider(props: MessageScrollerProviderProps): JSX.Element {
  return <MessageScrollerPrimitive.Provider {...props} />;
}

/**
 * The frame around the viewport and the button. It fills its parent, so put it in something with a height. The button is placed against it.
 *
 * Keyboard and ARIA: a plain `div`; none of its own. It carries `data-scrollable`, `data-autoscrolling` and `data-pending-scroll`.
 *
 * @param props - The frame props.
 * @returns The frame.
 * @example
 * ```tsx
 * import { MessageScroller, MessageScrollerProvider } from "@/components/ui/message-scroller";
 *
 * export const Frame = (
 *   <MessageScrollerProvider>
 *     <MessageScroller class="h-96" />
 *   </MessageScrollerProvider>
 * );
 * ```
 * @since 1.0.0
 * @see {@link MessageScrollerProvider}
 */
function MessageScroller<T extends PolymorphicTarget = "div">(
  props: MessageScrollerRootProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <MessageScrollerPrimitive.Root
      data-slot="message-scroller"
      class={cn("relative flex h-full min-h-0 w-full flex-col overflow-hidden", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * The scrollable region. It is a labeled landmark ("Messages") and a tab stop, so a keyboard user can scroll the thread with the arrow and page keys. It is hidden
 * with `visibility` while the opening position is being applied, so a saved thread never visibly jumps. `preserveScrollOnPrepend` (on by default) keeps the row the
 * reader is looking at still when older rows load above it.
 *
 * Keyboard and ARIA: `role="region"` named by the kit's string `messageScroller.label` (override with `aria-label`), `tabindex="0"`; the browser's own scroll keys.
 *
 * @param props - The viewport props.
 * @returns The viewport.
 * @example
 * ```tsx
 * import { MessageScrollerViewport } from "@/components/ui/message-scroller";
 *
 * export const Viewport = <MessageScrollerViewport aria-label="Conversation with Ada" />;
 * ```
 * @since 1.0.0
 * @see {@link MessageScrollerContent}
 */
function MessageScrollerViewport<T extends PolymorphicTarget = "div">(
  props: MessageScrollerViewportProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  const t = useUiStrings();
  return (
    <MessageScrollerPrimitive.Viewport
      data-slot="message-scroller-viewport"
      aria-label={t("messageScroller.label", "Messages")}
      class={cn(
        "size-full min-h-0 overflow-y-auto overscroll-contain outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 data-[pending-scroll]:invisible focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...(rest as object)}
    />
  );
}

/**
 * The list of rows, a polite `log`: each row that is added is announced once. Pass `aria-busy` while a reply streams so the announcement waits until the message is complete. A
 * column with a gap by default.
 *
 * Keyboard and ARIA: `role="log"` and `aria-relevant="additions"`; no keys. The spacer at its end is `aria-hidden`.
 *
 * @param props - The content props.
 * @returns The content.
 * @example
 * ```tsx
 * import { MessageScrollerContent } from "@/components/ui/message-scroller";
 *
 * export const Content = <MessageScrollerContent aria-busy={true} />;
 * ```
 * @since 1.0.0
 * @see {@link MessageScrollerItem}
 */
function MessageScrollerContent<T extends PolymorphicTarget = "div">(
  props: MessageScrollerContentProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <MessageScrollerPrimitive.Content
      data-slot="message-scroller-content"
      class={cn("flex min-h-full flex-col gap-4 p-4", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * One row of the thread. Give it a stable `messageId`, and `scrollAnchor` on the reader's own turn so a new question settles near the top. A row
 * far from the window is not painted (`content-visibility: auto`) and keeps the size it last had, so a long thread stays cheap.
 *
 * Keyboard and ARIA: a plain `div`; none of its own.
 *
 * @param props - The row props: `messageId`, `scrollAnchor` and the `div` attributes.
 * @returns The row.
 * @example
 * ```tsx
 * import { MessageScrollerItem } from "@/components/ui/message-scroller";
 *
 * export const Row = (
 *   <MessageScrollerItem messageId="42" scrollAnchor>
 *     How do I add a dialog?
 *   </MessageScrollerItem>
 * );
 * ```
 * @since 1.0.0
 * @see {@link MessageScrollerContent}
 */
function MessageScrollerItem<T extends PolymorphicTarget = "div">(
  props: MessageScrollerItemProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      class={cn("[contain-intrinsic-size:auto_5rem] [content-visibility:auto]", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * A round button that scrolls to the end of the thread (or to the start with `direction="start"`). It fades out and leaves the tab order while there is nothing to
 * scroll toward, and it sits at the bottom center of the frame. With no children it shows an arrow and no text; its name is the kit's string
 * `messageScroller.toEnd` ("Scroll to latest") or `messageScroller.toStart`.
 *
 * Keyboard and ARIA: a native button (Enter and Space). Inactive, it is `inert` and `tabindex="-1"`.
 *
 * @param props - The button props: `direction`, `behavior` and the button attributes.
 * @returns The button.
 * @example
 * ```tsx
 * import { MessageScrollerButton } from "@/components/ui/message-scroller";
 *
 * export const Jump = <MessageScrollerButton />;
 * ```
 * @since 1.0.0
 * @see {@link MessageScrollerProvider}
 */
function MessageScrollerButton<T extends PolymorphicTarget = "button">(
  props: MessageScrollerButtonProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as {
      readonly class?: string;
      readonly children?: JSX.Element;
      readonly direction?: "start" | "end";
    },
    ["class", "children", "direction"],
  );
  const t = useUiStrings();
  const start = (): boolean => local.direction === "start";
  return (
    <MessageScrollerPrimitive.Button
      data-slot="message-scroller-button"
      direction={local.direction}
      aria-label={
        start()
          ? t("messageScroller.toStart", "Scroll to start")
          : t("messageScroller.toEnd", "Scroll to latest")
      }
      class={cn(
        "absolute start-1/2 z-10 inline-flex size-8 -translate-x-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-md outline-none transition-opacity hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 rtl:translate-x-1/2 motion-reduce:transition-none data-[active=false]:pointer-events-none data-[active=false]:opacity-0 [&_svg]:size-4 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        start() ? "top-3" : "bottom-3",
        local.class,
      )}
      {...(rest as object)}
    >
      {local.children ?? (
        <ArrowRightIcon aria-hidden="true" class={start() ? "-rotate-90" : "rotate-90"} />
      )}
    </MessageScrollerPrimitive.Button>
  );
}

export {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
};
