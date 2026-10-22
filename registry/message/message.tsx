import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The class list of a message row for each `align`. Use it to lay out any element like a message.
 *
 * @example
 * ```tsx
 * import { messageVariants } from "@/components/ui/message";
 *
 * export const Row = <div class={messageVariants({ align: "end" })}>Hello</div>;
 * ```
 * @since 1.0.0
 * @see {@link Message}
 */
const messageVariants = cva("group/message flex w-full min-w-0 items-end gap-2", {
  variants: {
    align: {
      start: "flex-row justify-start",
      end: "flex-row-reverse justify-start",
    },
  },
  defaultVariants: { align: "start" },
});

/**
 * Props of {@link Message}: the attributes of a `div` plus `align`, which is `"start"` (the default, for
 * the other side of the conversation) or `"end"` (for the reader's own messages).
 * @since 1.0.0
 * @see {@link Message}
 */
export type MessageProps = ComponentProps<"div"> & VariantProps<typeof messageVariants>;

/**
 * One row of a conversation. It lays out the avatar, the header, the message surface (a `Bubble`, a
 * paragraph, a card) and the footer, and aligns them to the sender's side. The surface itself is a
 * separate component, so a message can hold a bubble, rendered markdown or a tool call. Use
 * {@link MessageGroup} to stack consecutive messages from one sender. For the scrolling container
 * around the conversation, use `MessageScroller`.
 *
 * Keyboard and ARIA: a message is presentational and adds no role or keys; what it shows depends on
 * the content inside. For an in-progress message, use a `Marker` with `role="status"` so assistive technology announces the update.
 *
 * Compared with shadcn/ui: `class` replaces `className`, and every part has a `data-slot`.
 *
 * @param props - The message props: `align`, `children` and the `div` attributes.
 * @returns The message row.
 * @example
 * ```tsx
 * import { Bubble, BubbleContent } from "@/components/ui/bubble";
 * import { Message, MessageContent } from "@/components/ui/message";
 *
 * export function Greeting() {
 *   return (
 *     <Message>
 *       <MessageContent>
 *         <Bubble variant="muted">
 *           <BubbleContent>How can I help you today?</BubbleContent>
 *         </Bubble>
 *       </MessageContent>
 *     </Message>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link MessageContent}
 * @see {@link MessageAvatar}
 * @see {@link MessageGroup}
 */
function Message(props: MessageProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "align"]);
  return (
    <div
      data-slot="message"
      data-align={local.align ?? "start"}
      class={cn(messageVariants({ align: local.align }), local.class)}
      {...rest}
    />
  );
}

/**
 * Stacks consecutive messages from one sender. Give the earlier messages an empty {@link MessageAvatar} so
 * they stay aligned with the avatar on the last one.
 *
 * Keyboard and ARIA: a plain `div` with no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The group.
 * @example
 * ```tsx
 * import { Message, MessageContent, MessageGroup } from "@/components/ui/message";
 *
 * export function Burst() {
 *   return (
 *     <MessageGroup>
 *       <Message>
 *         <MessageContent>One</MessageContent>
 *       </Message>
 *       <Message>
 *         <MessageContent>Two</MessageContent>
 *       </Message>
 *     </MessageGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Message}
 */
function MessageGroup(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="message-group"
      class={cn("flex w-full flex-col gap-1", local.class)}
      {...rest}
    />
  );
}

/**
 * The avatar slot beside the message, anchored to the bottom of the row. When the message has a
 * {@link MessageFooter} the avatar sits level with the message surface, not with the footer. Render it empty
 * (no children) to keep the space on earlier messages of a group.
 *
 * Keyboard and ARIA: a plain `div`; the avatar inside carries its own name.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The avatar slot.
 * @example
 * ```tsx
 * import { Avatar, AvatarFallback } from "@/components/ui/avatar";
 * import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
 *
 * export function WithAvatar() {
 *   return (
 *     <Message>
 *       <MessageAvatar>
 *         <Avatar>
 *           <AvatarFallback>AL</AvatarFallback>
 *         </Avatar>
 *       </MessageAvatar>
 *       <MessageContent>Hello</MessageContent>
 *     </Message>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Message}
 */
function MessageAvatar(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="message-avatar"
      class={cn(
        "flex size-8 shrink-0 items-end justify-center group-has-data-[slot=message-footer]/message:mb-7",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Holds the header, the message surface and the footer in a column. It is as wide as its content, up to the
 * width of the row, and follows the message's side.
 *
 * Keyboard and ARIA: a plain `div` with no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The content column.
 * @example
 * ```tsx
 * import { MessageContent, MessageHeader } from "@/components/ui/message";
 *
 * export function Named() {
 *   return (
 *     <MessageContent>
 *       <MessageHeader>Ada</MessageHeader>
 *       <p>Hello</p>
 *     </MessageContent>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Message}
 */
function MessageContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="message-content"
      class={cn(
        "flex min-w-0 max-w-full flex-1 flex-col gap-1 group-data-[align=end]/message:items-end",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Content above the message surface, such as the sender's name. It is always aligned to the start,
 * whatever the message's `align`.
 *
 * Keyboard and ARIA: a plain `div` with no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The header.
 * @example
 * ```tsx
 * import { MessageHeader } from "@/components/ui/message";
 *
 * export const Sender = <MessageHeader>Ada Lovelace</MessageHeader>;
 * ```
 * @since 1.0.0
 * @see {@link MessageContent}
 */
function MessageHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="message-header"
      class={cn("self-start px-1 text-xs text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/**
 * Content below the message surface: delivery status, a time, or actions such as copy and retry. It follows the
 * message's side, so the actions of a message with `align="end"` sit at the end. Give each icon-only button an `aria-label`.
 *
 * Keyboard and ARIA: a plain `div` with no role and no keys; the buttons inside keep theirs.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The footer.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { CopyIcon } from "@/components/ui/icons";
 * import { MessageFooter } from "@/components/ui/message";
 *
 * export const Actions = (
 *   <MessageFooter>
 *     <Button variant="ghost" size="icon-sm" aria-label="Copy">
 *       <CopyIcon />
 *     </Button>
 *   </MessageFooter>
 * );
 * ```
 * @since 1.0.0
 * @see {@link MessageContent}
 */
function MessageFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="message-footer"
      class={cn(
        "flex items-center gap-1 text-xs text-muted-foreground group-data-[align=end]/message:justify-end",
        local.class,
      )}
      {...rest}
    />
  );
}

export {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
  messageVariants,
};
