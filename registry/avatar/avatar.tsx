import {
  type Accessor,
  createContext,
  onCleanup,
  splitProps,
  untrack,
  useContext,
  useEffect,
  useSignal,
} from "@shadow-js/core";
import { mergeElementProps } from "@shadow-js/primitives";
import { type ComponentProps, type JSX, Show } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * Where the image of an avatar is: `idle` (no image rendered yet), `loading`, `loaded` or `error`
 * (the image failed or has no `src`).
 * @since 1.0.0
 * @see {@link AvatarImage}
 */
export type AvatarLoadingStatus = "idle" | "loading" | "loaded" | "error";

/** What the image tells the root so the fallback knows when to show. */
interface AvatarContextValue {
  readonly status: Accessor<AvatarLoadingStatus>;
  readonly setStatus: (status: AvatarLoadingStatus) => void;
}

const avatarContext = createContext<AvatarContextValue>(undefined, { name: "Avatar" });

/**
 * Props of {@link Avatar}, including the shared size of its image, fallback and badge.
 * @example
 * import type { AvatarProps } from "@/components/ui/avatar";
 * const props: AvatarProps = { size: "sm" };
 * @since 1.0.0
 */
export type AvatarProps = ComponentProps<"span"> & {
  /** The avatar diameter: default 2rem, sm 1.5rem, lg 2.5rem. @default "default" */
  readonly size?: "default" | "sm" | "lg" | undefined;
};

/**
 * A user's picture with a fallback. Put an {@link AvatarImage} and an {@link AvatarFallback}
 * inside; the fallback shows until the image has loaded, and for good when the image fails or has
 * no `src`.
 *
 * Keyboard and ARIA: the avatar is not interactive, so it has no keys and no role. The picture's
 * accessible name is the `alt` of the {@link AvatarImage}. Give it the person's name. When the name
 * is already written next to the avatar, pass `alt=""` to hide the picture from assistive
 * technology.
 *
 * Compared with shadcn/ui: `class` replaces `className`, and `delayMs` and `onLoadingStatusChange`
 * are ShadowJS props.
 *
 * @param props - The root props: `children` and the `span` attributes.
 * @returns The avatar root element.
 * @example
 * ```tsx
 * import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 *
 * export function UserAvatar() {
 *   return (
 *     <Avatar>
 *       <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
 *       <AvatarFallback>CN</AvatarFallback>
 *     </Avatar>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AvatarImage}
 * @see {@link AvatarFallback}
 */
function Avatar(props: AvatarProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children", "size"]);
  const [status, setStatus] = useSignal<AvatarLoadingStatus>("idle");
  return (
    <avatarContext.Provider value={{ status, setStatus: (next) => setStatus(next) }}>
      <span
        data-slot="avatar"
        data-size={local.size ?? "default"}
        class={cn(
          "group/avatar relative flex shrink-0 rounded-full",
          local.size === "sm" ? "size-6" : local.size === "lg" ? "size-10" : "size-8",
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </span>
    </avatarContext.Provider>
  );
}

/**
 * Own props of {@link AvatarImage}.
 * @since 1.0.0
 * @see {@link AvatarImage}
 */
export interface AvatarImageExtraProps {
  /**
   * Called whenever the loading status changes (client only).
   * @default none
   */
  readonly onLoadingStatusChange?: ((status: AvatarLoadingStatus) => void) | undefined;
}

/**
 * Props of {@link AvatarImage}: the attributes of an `img` plus `onLoadingStatusChange`.
 * @since 1.0.0
 * @see {@link AvatarImage}
 */
export type AvatarImageProps = ComponentProps<"img"> & AvatarImageExtraProps;

/** The outcome of loading one `src`. */
interface Outcome {
  readonly src: string;
  readonly loaded: boolean;
}

/**
 * The image of an avatar. It is in the markup from the start, so the browser loads it and the
 * server renders it, but it stays hidden until it has loaded. An image that finished loading before
 * the page hydrated counts as loaded. Give it an `alt` with the person's name.
 *
 * Keyboard and ARIA: the image has the `img` role. Its accessible name is the `alt` text, and it
 * has no keys of its own. The `onLoad`, `onError` and `ref` you pass still run.
 *
 * @param props - The image props: `src`, `alt`, `onLoadingStatusChange`, and the `img` attributes.
 * @returns The image element.
 * @example
 * ```tsx
 * import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 *
 * export function Me() {
 *   return (
 *     <Avatar>
 *       <AvatarImage src="/me.png" alt="Ada Lovelace" />
 *       <AvatarFallback>AL</AvatarFallback>
 *     </Avatar>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AvatarFallback}
 */
function AvatarImage(props: AvatarImageProps): JSX.Element {
  const root = useContext(avatarContext);
  const [local, rest] = splitProps(props, ["class", "src", "onLoadingStatusChange"]);
  const [outcome, setOutcome] = useSignal<Outcome | undefined>(undefined);
  const status = (): AvatarLoadingStatus => {
    const src = local.src;
    if (typeof src !== "string" || src === "") return "error";
    const result = outcome();
    if (result === undefined || result.src !== src) return "loading";
    return result.loaded ? "loaded" : "error";
  };
  useEffect(() => {
    const next = status();
    root.setStatus(next);
    untrack(() => local.onLoadingStatusChange?.(next));
  });
  onCleanup(() => root.setStatus("idle"));
  const settle = (loaded: boolean): void => {
    const src = untrack(() => local.src);
    if (typeof src === "string" && src !== "") setOutcome(() => ({ src, loaded }));
  };
  // The caller's `onLoad`, `onError` and `ref` run too: the handlers are composed, not replaced.
  const merged = mergeElementProps(
    {
      onLoad: () => settle(true),
      onError: () => settle(false),
      ref: (node: HTMLImageElement) => {
        // Cached images, and images that loaded before hydration, fire their `load` event too
        // early to be heard. A broken one keeps the fallback anyway: it stays hidden.
        if (node.complete && node.naturalWidth > 0) settle(true);
      },
    },
    rest,
  );
  return (
    <img
      data-slot="avatar-image"
      src={local.src}
      hidden={status() !== "loaded"}
      class={cn("aspect-square size-full rounded-full", local.class)}
      {...merged}
    />
  );
}

/**
 * Own props of {@link AvatarFallback}.
 * @since 1.0.0
 * @see {@link AvatarFallback}
 */
export interface AvatarFallbackExtraProps {
  /**
   * Wait this many milliseconds before showing the fallback, so a fast image does not flash it.
   * With a delay the fallback is not part of the server markup.
   * @default none (the fallback shows at once)
   */
  readonly delayMs?: number | undefined;
}

/**
 * Props of {@link AvatarFallback}: the attributes of a `span` plus `delayMs`.
 * @since 1.0.0
 * @see {@link AvatarFallback}
 */
export type AvatarFallbackProps = ComponentProps<"span"> & AvatarFallbackExtraProps;

/**
 * What shows while the image loads or when it fails: initials or an icon. It is hidden once the
 * image has loaded. With `delayMs` it shows only after that many milliseconds, so a fast image never
 * flashes it.
 *
 * Keyboard and ARIA: the fallback is a plain `span` with no role and no keys. It adds no ARIA
 * attributes, so put text in it (initials) that reads well on its own.
 *
 * @param props - The fallback props: `delayMs`, `children`, and the `span` attributes.
 * @returns The fallback element, or nothing while the image is showing.
 * @example
 * ```tsx
 * import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 *
 * export function Initials() {
 *   return (
 *     <Avatar>
 *       <AvatarImage src="/me.png" alt="Ada Lovelace" />
 *       <AvatarFallback delayMs={600}>AL</AvatarFallback>
 *     </Avatar>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AvatarImage}
 */
function AvatarFallback(props: AvatarFallbackProps): JSX.Element {
  const root = useContext(avatarContext);
  const [local, rest] = splitProps(props, ["class", "delayMs", "children"]);
  const [elapsed, setElapsed] = useSignal(false);
  useEffect(() => {
    const delay = local.delayMs;
    if (delay === undefined) return;
    const timer = setTimeout(() => setElapsed(true), delay);
    onCleanup(() => clearTimeout(timer));
  });
  const visible = (): boolean =>
    root.status() !== "loaded" && (local.delayMs === undefined || elapsed());
  return (
    <Show when={visible()}>
      <span
        data-slot="avatar-fallback"
        class={cn(
          "flex size-full items-center justify-center rounded-full bg-muted forced-colors:border",
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </span>
    </Show>
  );
}

/**
 * Props of {@link AvatarBadge}.
 * @example
 * import type { AvatarBadgeProps } from "@/components/ui/avatar";
 * const props: AvatarBadgeProps = { "aria-label": "Available" };
 * @since 1.0.0
 */
export type AvatarBadgeProps = ComponentProps<"span">;

/**
 * A status badge on the avatar's logical bottom end, sized with its parent avatar.
 * Give meaningful status an accessible label; decorative content may use `aria-hidden`.
 * @param props Span attributes and badge content.
 * @returns The badge span. It has no keyboard interaction.
 * @example
 * import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
 * <Avatar><AvatarFallback>AL</AvatarFallback><AvatarBadge aria-label="Available" /></Avatar>
 * @see Avatar
 * @since 1.0.0
 */
function AvatarBadge(props: AvatarBadgeProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      data-slot="avatar-badge"
      role={
        props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined
          ? "img"
          : undefined
      }
      class={cn(
        "absolute end-0 bottom-0 flex size-2.5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background group-data-[size=sm]/avatar:size-2 group-data-[size=lg]/avatar:size-3 forced-colors:border",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </span>
  );
}

/**
 * Props of {@link AvatarGroup}.
 * @example
 * import type { AvatarGroupProps } from "@/components/ui/avatar";
 * const props: AvatarGroupProps = { "aria-label": "Reviewers", dir: "rtl" };
 * @since 1.0.0
 */
export type AvatarGroupProps = ComponentProps<"div">;

/**
 * Groups overlapping avatars in reading order using the logical start edge in LTR and RTL.
 * @param props Div attributes, optional accessible name and avatar children.
 * @returns The div with the group role. It has no keyboard interaction.
 * @example
 * import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
 * <AvatarGroup><Avatar><AvatarFallback>AL</AvatarFallback></Avatar><AvatarGroupCount>+3</AvatarGroupCount></AvatarGroup>
 * @see AvatarGroupCount
 * @since 1.0.0
 */
function AvatarGroup(props: AvatarGroupProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="avatar-group"
      role="group"
      class={cn(
        "group/avatar-group flex items-center [&>*+*]:-ms-2 [&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-background",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * Props of {@link AvatarGroupCount}.
 * @example
 * import type { AvatarGroupCountProps } from "@/components/ui/avatar";
 * const props: AvatarGroupCountProps = { "aria-label": "Three more reviewers" };
 * @since 1.0.0
 */
export type AvatarGroupCountProps = ComponentProps<"span">;

/**
 * Displays the number of additional people in an avatar group; content can use localized digits.
 * @param props Span attributes and count content. Use `aria-label` to explain the count.
 * @returns The count span, sized with the group's avatars. It has no keyboard interaction.
 * @example
 * import { AvatarGroupCount } from "@/components/ui/avatar";
 * <AvatarGroupCount aria-label="Three more reviewers">+3</AvatarGroupCount>
 * @see AvatarGroup
 * @since 1.0.0
 */
function AvatarGroupCount(props: AvatarGroupCountProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      data-slot="avatar-group-count"
      role={
        props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined
          ? "img"
          : undefined
      }
      class={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-[[data-size=sm]]/avatar-group:size-6 group-has-[[data-size=sm]]/avatar-group:text-xs group-has-[[data-size=lg]]/avatar-group:size-10 forced-colors:border",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </span>
  );
}

export { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage };
