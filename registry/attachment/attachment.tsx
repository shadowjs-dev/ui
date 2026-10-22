import { splitProps } from "@shadow-js/core";
import { Polymorphic, type PolymorphicProps, type PolymorphicTarget } from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "@/components/ui/button";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * The class list of an attachment card for each `size` and `orientation`. Use it to style any element like an attachment.
 *
 * @example
 * ```tsx
 * import { attachmentVariants } from "@/components/ui/attachment";
 *
 * export const Chip = <a class={attachmentVariants({ size: "sm" })} href="/files/report.pdf">report.pdf</a>;
 * ```
 * @since 1.0.0
 * @see {@link Attachment}
 */
const attachmentVariants = cva(
  "group/attachment relative flex min-w-0 items-center rounded-lg border bg-card text-card-foreground transition-colors has-[[data-slot=attachment-trigger]:hover]:bg-accent/50 motion-reduce:transition-none data-[state=error]:border-destructive/50 data-[state=error]:bg-destructive/5",
  {
    variants: {
      size: {
        default: "gap-3 p-2.5 text-sm",
        sm: "gap-2.5 p-2 text-sm",
        xs: "gap-2 p-1.5 text-xs",
      },
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col items-stretch",
      },
    },
    defaultVariants: { size: "default", orientation: "horizontal" },
  },
);

/**
 * The states an attachment can be in: `idle`, `uploading`, `processing`, `error` or `done`.
 * @since 1.0.0
 * @see {@link Attachment}
 */
export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";

/**
 * Props of {@link Attachment}: the attributes of a `div` plus `state` (`"idle"`, `"uploading"`,
 * `"processing"`, `"error"` or `"done"`, the default), `size` (`"default"`, `"sm"` or `"xs"`) and
 * `orientation` (`"horizontal"`, the default, or `"vertical"`).
 * @since 1.0.0
 * @see {@link Attachment}
 */
export type AttachmentProps = ComponentProps<"div"> &
  VariantProps<typeof attachmentVariants> & { readonly state?: AttachmentState | undefined };

/**
 * A file or an image in a message, a composer or an upload list: its media, its name and details, its
 * upload state and its actions. `state` drives the look: `uploading` and `processing` shimmer the title, and
 * `error` colors the border. Put the media, the {@link AttachmentContent} and the {@link AttachmentActions} inside; add an
 * {@link AttachmentTrigger} to make the whole card open something while the actions stay pressable.
 *
 * Keyboard and ARIA: the card is a plain `div` with no role. Its trigger and actions are the focusable
 * controls. Give an icon-only action an `aria-label`, and the trigger one too ("Preview report.pdf"). Say why a
 * file failed in the description: do not rely on color alone for `error`.
 *
 * Compared with shadcn/ui: `as` replaces `render` on the trigger, `class` replaces `className`, and every part has a `data-slot`.
 *
 * @param props - The attachment props: `state`, `size`, `orientation` and the `div` attributes.
 * @returns The attachment.
 * @example
 * ```tsx
 * import {
 *   Attachment,
 *   AttachmentContent,
 *   AttachmentDescription,
 *   AttachmentMedia,
 *   AttachmentTitle,
 * } from "@/components/ui/attachment";
 * import { FileTextIcon } from "@/components/ui/icons";
 *
 * export function Report() {
 *   return (
 *     <Attachment>
 *       <AttachmentMedia>
 *         <FileTextIcon />
 *       </AttachmentMedia>
 *       <AttachmentContent>
 *         <AttachmentTitle>report.pdf</AttachmentTitle>
 *         <AttachmentDescription>PDF, 2.4 MB</AttachmentDescription>
 *       </AttachmentContent>
 *     </Attachment>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AttachmentMedia}
 * @see {@link AttachmentContent}
 * @see {@link AttachmentGroup}
 */
function Attachment(props: AttachmentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "state", "size", "orientation"]);
  return (
    <div
      data-slot="attachment"
      data-state={local.state ?? "done"}
      data-size={local.size ?? "default"}
      data-orientation={local.orientation ?? "horizontal"}
      class={cn(
        attachmentVariants({ size: local.size, orientation: local.orientation }),
        local.class,
      )}
      {...rest}
    />
  );
}

const mediaVariants = cva(
  "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground group-data-[state=error]/attachment:text-destructive [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        icon: "size-10 group-data-[size=sm]/attachment:size-9 group-data-[size=xs]/attachment:size-7 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 group-data-[size=sm]/attachment:size-9 group-data-[size=xs]/attachment:size-7 group-data-[orientation=vertical]/attachment:aspect-video group-data-[orientation=vertical]/attachment:h-auto group-data-[orientation=vertical]/attachment:w-full [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: { variant: "icon" },
  },
);

/**
 * Props of {@link AttachmentMedia}: the attributes of a `div` plus `variant`, which is `"icon"` (the
 * default, an icon on a tile) or `"image"` (a preview picture that fills it).
 * @since 1.0.0
 * @see {@link AttachmentMedia}
 */
export type AttachmentMediaProps = ComponentProps<"div"> & VariantProps<typeof mediaVariants>;

/**
 * The media slot: an icon on a tile, or an `img` preview. In a vertical attachment an image fills the top
 * of the card. An image needs its own text alternative (`alt=""` when the title already says it).
 *
 * Keyboard and ARIA: a plain `div`, no role. An icon in it is decorative.
 *
 * @param props - The media props: `variant` and the `div` attributes.
 * @returns The media slot.
 * @example
 * ```tsx
 * import { Attachment, AttachmentMedia } from "@/components/ui/attachment";
 *
 * export function Photo() {
 *   return (
 *     <Attachment orientation="vertical">
 *       <AttachmentMedia variant="image">
 *         <img src="/photo.jpg" alt="" />
 *       </AttachmentMedia>
 *     </Attachment>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Attachment}
 */
function AttachmentMedia(props: AttachmentMediaProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  return (
    <div
      data-slot="attachment-media"
      data-variant={local.variant ?? "icon"}
      class={cn(mediaVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

/**
 * Wraps the title and the description. It takes the space between the media and the actions and truncates its text.
 *
 * Keyboard and ARIA: a plain `div`; no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The content slot.
 * @example
 * ```tsx
 * import { AttachmentContent, AttachmentTitle } from "@/components/ui/attachment";
 *
 * export const Name = (
 *   <AttachmentContent>
 *     <AttachmentTitle>report.pdf</AttachmentTitle>
 *   </AttachmentContent>
 * );
 * ```
 * @since 1.0.0
 * @see {@link Attachment}
 */
function AttachmentContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="attachment-content"
      class={cn("flex min-w-0 flex-1 flex-col gap-0.5", local.class)}
      {...rest}
    />
  );
}

/**
 * The name of the attachment. It truncates, and it shimmers while the attachment is `uploading` or `processing`.
 *
 * Keyboard and ARIA: a plain `div`; no role and no keys. While it shimmers its text stays real text, so a screen reader reads it.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The title.
 * @example
 * ```tsx
 * import { AttachmentTitle } from "@/components/ui/attachment";
 *
 * export const Title = <AttachmentTitle>report.pdf</AttachmentTitle>;
 * ```
 * @since 1.0.0
 * @see {@link Attachment}
 */
function AttachmentTitle(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="attachment-title"
      class={cn(
        "truncate font-medium group-data-[state=error]/attachment:text-destructive group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Secondary details: the type and size of a file, or the upload status ("Uploading, 40%"). For an
 * `error` state, say what went wrong here.
 *
 * Keyboard and ARIA: a plain `div`; no role and no keys. For an upload that a screen reader user should follow,
 * put the status in a `role="status"` element.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The description.
 * @example
 * ```tsx
 * import { AttachmentDescription } from "@/components/ui/attachment";
 *
 * export const Details = <AttachmentDescription>PDF, 2.4 MB</AttachmentDescription>;
 * ```
 * @since 1.0.0
 * @see {@link Attachment}
 */
function AttachmentDescription(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="attachment-description"
      class={cn(
        "truncate text-xs text-muted-foreground group-data-[state=error]/attachment:text-destructive",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Holds the actions, at the end of the attachment. It sits above the {@link AttachmentTrigger}, so the actions stay pressable.
 *
 * Keyboard and ARIA: a plain `div`; the actions inside are the focus stops.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The actions container.
 * @example
 * ```tsx
 * import { AttachmentAction, AttachmentActions } from "@/components/ui/attachment";
 * import { XIcon } from "@/components/ui/icons";
 *
 * export const Remove = (
 *   <AttachmentActions>
 *     <AttachmentAction aria-label="Remove report.pdf">
 *       <XIcon />
 *     </AttachmentAction>
 *   </AttachmentActions>
 * );
 * ```
 * @since 1.0.0
 * @see {@link AttachmentAction}
 */
function AttachmentActions(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="attachment-actions"
      class={cn("relative z-10 ms-auto flex shrink-0 items-center gap-1", local.class)}
      {...rest}
    />
  );
}

/**
 * Props of {@link AttachmentAction}: every prop of {@link Button}. The `size` is `"icon-xs"` unless given
 * and the `variant` is `"ghost"`.
 * @since 1.0.0
 * @see {@link AttachmentAction}
 */
export type AttachmentActionProps<T extends PolymorphicTarget = "button"> = ButtonProps<T>;

/**
 * An action on an attachment: a {@link Button}, small and quiet by default. An icon-only action needs an `aria-label` that names the file ("Remove report.pdf").
 *
 * Keyboard and ARIA: a native button; Enter and Space press it.
 *
 * @param props - The button props.
 * @returns The action button.
 * @example
 * ```tsx
 * import { AttachmentAction } from "@/components/ui/attachment";
 * import { XIcon } from "@/components/ui/icons";
 *
 * export const Remove = (
 *   <AttachmentAction aria-label="Remove report.pdf">
 *     <XIcon />
 *   </AttachmentAction>
 * );
 * ```
 * @since 1.0.0
 * @see {@link Button}
 */
function AttachmentAction<T extends PolymorphicTarget = "button">(
  props: AttachmentActionProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as {
      readonly class?: ClassValue;
      readonly size?: string;
      readonly variant?: string;
      readonly [prop: string]: unknown;
    },
    ["class", "size", "variant"],
  );
  return (
    <Button
      data-slot="attachment-action"
      variant={(local.variant as ButtonProps["variant"]) ?? "ghost"}
      size={(local.size as ButtonProps["size"]) ?? "icon-xs"}
      class={cn(local.class)}
      {...(rest as object)}
    />
  );
}

/** The props as the implementation sees them. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * Props of {@link AttachmentTrigger}: every attribute of the chosen element. The `as` prop picks the element (a `button` by default; use `"a"` for a link).
 * @since 1.0.0
 * @see {@link AttachmentTrigger}
 */
export type AttachmentTriggerProps<T extends PolymorphicTarget = "button"> = PolymorphicProps<
  "button",
  object,
  T
>;

/**
 * A full-card overlay that activates the attachment: a link to the file, or the trigger of a dialog that previews it. It sits behind the
 * {@link AttachmentActions}, so both the card and the actions can be focused and pressed. It needs an `aria-label` that names the file.
 *
 * Keyboard and ARIA: a native `button` by default (Enter and Space), or a link with `as="a"` (Enter). It is a tab stop before the actions.
 *
 * @param props - The trigger props: `as` and the attributes of the element.
 * @returns The trigger.
 * @example
 * ```tsx
 * import { Attachment, AttachmentTrigger } from "@/components/ui/attachment";
 *
 * export const Open = (
 *   <Attachment>
 *     <AttachmentTrigger as="a" href="/report.pdf" aria-label="Open report.pdf" />
 *   </Attachment>
 * );
 * ```
 * @since 1.0.0
 * @see {@link Attachment}
 */
function AttachmentTrigger<T extends PolymorphicTarget = "button">(
  props: AttachmentTriggerProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class"]);
  return (
    <Polymorphic
      as={local.as ?? "button"}
      data-slot="attachment-trigger"
      {...(local.as === undefined || local.as === "button" ? { type: "button" } : {})}
      class={cn(
        "absolute inset-0 z-0 rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Lays out attachments in a horizontal row that scrolls and snaps, with a fade at the edges that have more.
 * A group of attachments that are not interactive can still be scrolled by keyboard: give it
 * `tabindex="0"`, `role="group"` and an `aria-label`.
 *
 * Keyboard and ARIA: a plain `div`; the scrolling is native.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The group.
 * @example
 * ```tsx
 * import { Attachment, AttachmentGroup } from "@/components/ui/attachment";
 *
 * export const Files = (
 *   <AttachmentGroup role="group" aria-label="Attachments" tabindex="0">
 *     <Attachment class="w-56 shrink-0 snap-start" />
 *     <Attachment class="w-56 shrink-0 snap-start" />
 *   </AttachmentGroup>
 * );
 * ```
 * @since 1.0.0
 * @see {@link Attachment}
 */
function AttachmentGroup(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="attachment-group"
      class={cn(
        "scroll-fade-x flex w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-1 outline-none [scrollbar-width:thin] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    />
  );
}

export {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
  attachmentVariants,
};
