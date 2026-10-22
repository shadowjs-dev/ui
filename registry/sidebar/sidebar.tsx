import { type Accessor, onMount, splitProps, untrack, useEffect, useSignal } from "@shadow-js/core";
import {
  callHandler,
  createPartContext,
  Polymorphic,
  type PolymorphicProps,
  type PolymorphicTarget,
  type SeparatorProps,
  type TooltipContentProps,
  useBaseId,
  useControllableState,
  useDirectionAround,
  useRefSignal,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { Show } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "@/components/ui/button";
import { PanelLeftIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUiStrings } from "@/lib/ui-strings";
import { type ClassValue, cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
/** The name of the cookie shadcn/ui keeps the state in. @internal */
const DEFAULT_COOKIE_NAME = "sidebar_state";
/** A week, in seconds: how long shadcn/ui keeps the cookie. @internal */
const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
/** A cookie name the browser accepts: an HTTP token. @internal */
const COOKIE_NAME = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/;

/** The props as the implementation sees them: the typed own props plus whatever the target takes. */
type Loose = {
  readonly as?: PolymorphicTarget;
  readonly class?: ClassValue;
  readonly [prop: string]: unknown;
};

/**
 * What {@link useSidebar} returns. Every state is an accessor.
 * @since 1.0.0
 * @see {@link useSidebar}
 */
export interface SidebarContextValue {
  /** `"expanded"` or `"collapsed"` (the desktop sidebar). */
  readonly state: Accessor<"expanded" | "collapsed">;
  /** Whether the desktop sidebar is open. */
  readonly open: Accessor<boolean>;
  /** Opens or closes the desktop sidebar. */
  readonly setOpen: (open: boolean) => void;
  /** Whether the mobile sheet is open. */
  readonly openMobile: Accessor<boolean>;
  /** Opens or closes the mobile sheet. */
  readonly setOpenMobile: (open: boolean) => void;
  /** Whether the sidebar renders as a sheet (narrow viewport, or the provider's `isMobile`). */
  readonly isMobile: Accessor<boolean>;
  /** Toggles the mobile sheet on mobile and the desktop sidebar otherwise. */
  readonly toggleSidebar: () => void;
  /** The reading direction around the sidebar: a `dir` attribute on or above the provider, else the document's. */
  readonly dir: Accessor<"ltr" | "rtl">;
}

const sidebarContext = createPartContext<SidebarContextValue>("SidebarProvider");

/** The edge the nearest `Sidebar` sits on, for parts that point away from it (tooltips). */
const sidebarSideContext = createPartContext<Accessor<"start" | "end">>("Sidebar");

/** Whether the nearest `Sidebar` is collapsed out of view, so its content is not reachable. @internal */
const sidebarHiddenContext = createPartContext<Accessor<boolean>>("Sidebar");

/**
 * The state and actions of the nearest {@link SidebarProvider}: the desktop open state, the mobile
 * sheet state, whether the layout is mobile, and a toggle. Use it from any part inside the provider.
 *
 * @returns The sidebar context: accessors for `state`, `open`, `openMobile` and `isMobile`, and the
 * setters and `toggleSidebar`.
 * @throws When called outside a {@link SidebarProvider}.
 * @example
 * ```tsx
 * import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
 *
 * function ToggleButton() {
 *   const sidebar = useSidebar();
 *   return (
 *     <button type="button" onClick={() => sidebar.toggleSidebar()}>
 *       {sidebar.state()}
 *     </button>
 *   );
 * }
 *
 * export function App() {
 *   return (
 *     <SidebarProvider>
 *       <ToggleButton />
 *     </SidebarProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarProvider}
 */
function useSidebar(): SidebarContextValue {
  return sidebarContext.use("useSidebar");
}

/** The stored open state, or `undefined` when nothing usable is stored or storage is blocked. */
function readStored(key: string): boolean | undefined {
  try {
    const value = localStorage.getItem(key);
    return value === "true" ? true : value === "false" ? false : undefined;
  } catch (error) {
    // Storage is blocked (private mode, sandboxed frame): the sidebar still works, unsaved.
    globalThis.reportError?.(error);
    return undefined;
  }
}

function writeStored(key: string, open: boolean): void {
  try {
    localStorage.setItem(key, String(open));
  } catch (error) {
    globalThis.reportError?.(error);
  }
}

/**
 * The name of the cookie `SidebarProvider` keeps the state in when you give it `cookieName="sidebar_state"`
 * (the name shadcn/ui uses), and the default name of {@link sidebarCookie} and {@link readSidebarCookie}.
 *
 * @example
 * import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";
 *
 * export const name: string = SIDEBAR_COOKIE_NAME; // "sidebar_state"
 * @see {@link sidebarCookie}
 * @since 1.0.0
 */
const SIDEBAR_COOKIE_NAME: string = DEFAULT_COOKIE_NAME;

/**
 * Options of {@link sidebarCookie}.
 * @see {@link sidebarCookie}
 * @since 1.0.0
 */
export interface SidebarCookieOptions {
  /**
   * The cookie name; letters, digits and the characters `!#$%&'*+.^_`|~-`.
   * @default "sidebar_state"
   */
  readonly name?: string | undefined;
  /**
   * How long the browser keeps the cookie, in seconds.
   * @default 604800 (a week)
   */
  readonly maxAge?: number | undefined;
  /**
   * The path the cookie is sent for; no spaces, semicolons or line breaks.
   * @default "/"
   */
  readonly path?: string | undefined;
  /**
   * Adds `Secure`, so the cookie is only sent over HTTPS.
   * @default false
   */
  readonly secure?: boolean | undefined;
}

/**
 * The text of the cookie that remembers whether the sidebar is open, to assign to `document.cookie` or to
 * send as a `Set-Cookie` header. It has `path`, `max-age` and `SameSite=Lax`, as shadcn/ui's cookie does,
 * and `Secure` on request. Read it back on the server with {@link readSidebarCookie} so the first page
 * already has the right state.
 *
 * @param open Whether the sidebar is open.
 * @param options The cookie name, age, path and `Secure`: see {@link SidebarCookieOptions}.
 * @returns The cookie text, such as `sidebar_state=true; path=/; max-age=604800; SameSite=Lax`.
 * @throws TypeError when the name, the path or the age is not valid in a cookie.
 * @example
 * import { sidebarCookie } from "@/components/ui/sidebar";
 *
 * export const header = sidebarCookie(false, { secure: true });
 * // "sidebar_state=false; path=/; max-age=604800; SameSite=Lax; Secure"
 * @see {@link readSidebarCookie}
 * @since 1.0.0
 */
function sidebarCookie(open: boolean, options: SidebarCookieOptions = {}): string {
  const name = options.name ?? DEFAULT_COOKIE_NAME;
  const path = options.path ?? "/";
  const maxAge = options.maxAge ?? DEFAULT_COOKIE_MAX_AGE;
  if (!COOKIE_NAME.test(name)) throw new TypeError(`"${name}" is not a valid cookie name`);
  if (!/^[^\s;]+$/.test(path)) throw new TypeError(`"${path}" is not a valid cookie path`);
  if (!Number.isInteger(maxAge) || maxAge < 0) {
    throw new TypeError(`${maxAge} is not a valid cookie age`);
  }
  const secure = options.secure === true ? "; Secure" : "";
  return `${name}=${open}; path=${path}; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * Reads the open state from a `Cookie` header or from `document.cookie`. Use it where the page is first
 * rendered, to start the sidebar in the state the visitor left it in, so there is no jump after load.
 *
 * @param cookies The cookie text: the `Cookie` request header, or `document.cookie`.
 * @param name The cookie name (default `"sidebar_state"`).
 * @returns `true` or `false`, or `undefined` when the cookie is missing or holds something else.
 * @example
 * import { readSidebarCookie } from "@/components/ui/sidebar";
 *
 * export function initialOpen(cookieHeader: string | null): boolean {
 *   return readSidebarCookie(cookieHeader) ?? true;
 * }
 * @see {@link sidebarCookie}
 * @since 1.0.0
 */
function readSidebarCookie(
  cookies: string | null | undefined,
  name: string = DEFAULT_COOKIE_NAME,
): boolean | undefined {
  if (cookies === null || cookies === undefined) return undefined;
  for (const part of cookies.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    const value = part.slice(separator + 1).trim();
    return value === "true" ? true : value === "false" ? false : undefined;
  }
  return undefined;
}

/** The open state in the page's cookies, or `undefined`. A blocked cookie jar is reported, not thrown. @internal */
function readCookieState(name: string): boolean | undefined {
  try {
    return readSidebarCookie(document.cookie, name);
  } catch (error) {
    globalThis.reportError?.(error);
    return undefined;
  }
}

function writeCookieState(name: string, open: boolean, maxAge: number | undefined): void {
  try {
    // biome-ignore lint/suspicious/noDocumentCookie: the synchronous cookie jar is the one every browser has and the one a Set-Cookie header matches; the async Cookie Store API is not available everywhere
    document.cookie = sidebarCookie(open, {
      name,
      maxAge,
      secure: globalThis.location?.protocol === "https:",
    });
  } catch (error) {
    globalThis.reportError?.(error);
  }
}

/**
 * Props of {@link SidebarProvider}: the attributes of a `div` plus the sidebar state.
 * @since 1.0.0
 * @see {@link SidebarProvider}
 */
export type SidebarProviderProps = ComponentProps<"div"> & {
  /**
   * Initial open state of the desktop sidebar when uncontrolled.
   * @default true
   */
  readonly defaultOpen?: boolean | undefined;
  /** Controlled open state of the desktop sidebar. */
  readonly open?: boolean | undefined;
  /** Called when the desktop sidebar opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * The `localStorage` key under which an uncontrolled sidebar remembers its open state. The stored
   * value is read after the first render, so the server markup and hydration are not affected.
   */
  readonly storageKey?: string | undefined;
  /**
   * The name of a cookie that remembers the open state of an uncontrolled sidebar (shadcn/ui uses
   * `"sidebar_state"`). A server can read it with {@link readSidebarCookie} and pass the result as
   * `defaultOpen`, so the first page is already right. The cookie is written only when you ask for it. The
   * stored value is also read after the first render.
   * @default none (no cookie)
   */
  readonly cookieName?: string | undefined;
  /**
   * How long the browser keeps the cookie, in seconds.
   * @default 604800 (a week)
   */
  readonly cookieMaxAge?: number | undefined;
  /** Forces the mobile (sheet) or the desktop layout instead of following the viewport width. */
  readonly isMobile?: boolean | undefined;
  /**
   * The letter that toggles the sidebar together with Ctrl or Cmd. Pass `false` to turn the
   * shortcut off.
   * @default "b"
   */
  readonly keyboardShortcut?: string | false | undefined;
};

/**
 * The state provider of the sidebar. It holds the open state, sets the width variables and toggles
 * the sidebar with Ctrl+B (or Cmd+B). Wrap the sidebar and the page content in it. It also provides
 * the tooltip delay that the collapsed menu buttons use.
 *
 * Keyboard and ARIA: Ctrl+B or Cmd+B toggles the sidebar, on a mobile layout it toggles the sheet. The
 * shortcut is handled on the window and prevents the browser's own Ctrl+B. It also works while a text
 * field has focus. The provider renders a `div` with no role.
 *
 * shadcn/ui differences: shadcn/ui always keeps the state in the `sidebar_state` cookie. Here it is
 * opt-in: `cookieName` keeps it in a cookie (with {@link sidebarCookie} and {@link readSidebarCookie} for a
 * server), `storageKey` in `localStorage`. `keyboardShortcut` chooses the letter, or turns it off. `class`
 * replaces `className`.
 *
 * @param props - The props, see {@link SidebarProviderProps}.
 * @returns The provider `div` with the children inside.
 * @example
 * ```tsx
 * import {
 *   Sidebar,
 *   SidebarContent,
 *   SidebarInset,
 *   SidebarProvider,
 *   SidebarTrigger,
 * } from "@/components/ui/sidebar";
 *
 * export function AppShell() {
 *   return (
 *     <SidebarProvider>
 *       <Sidebar>
 *         <SidebarContent>Navigation</SidebarContent>
 *       </Sidebar>
 *       <SidebarInset>
 *         <header>
 *           <SidebarTrigger />
 *         </header>
 *       </SidebarInset>
 *     </SidebarProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link useSidebar}
 */
function SidebarProvider(props: SidebarProviderProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "defaultOpen",
    "open",
    "onOpenChange",
    "storageKey",
    "cookieName",
    "cookieMaxAge",
    "isMobile",
    "keyboardShortcut",
    "class",
    "style",
    "children",
  ]);
  const detected = useIsMobile();
  const isMobile = (): boolean => local.isMobile ?? detected();
  // The wrapper is where a dir attribute is looked for; it is known once the provider has mounted.
  const [wrapperElement, setWrapperElement] = useRefSignal<HTMLElement>();
  let wrapperNode: HTMLElement | undefined;
  const dir = useDirectionAround(undefined, wrapperElement);
  const [openMobile, setOpenMobile] = useSignal(false);
  const [open, setOpenState] = useControllableState<boolean>({
    value: () => local.open,
    defaultValue: () => local.defaultOpen !== false,
    onChange: () => (next) => {
      local.onOpenChange?.(next);
      const key = local.storageKey;
      if (key !== undefined) writeStored(key, next);
      const cookie = local.cookieName;
      if (cookie !== undefined) writeCookieState(cookie, next, local.cookieMaxAge);
    },
    name: "Sidebar open",
  });
  const setOpen = (next: boolean): void => setOpenState(next);
  const toggleSidebar = (): void => {
    if (untrack(isMobile)) setOpenMobile((current) => !current);
    else setOpen(!untrack(open));
  };

  onMount(() => {
    setWrapperElement(wrapperNode);
    if (local.open === undefined) {
      const cookie = local.cookieName;
      const fromCookie = cookie === undefined ? undefined : readCookieState(cookie);
      const key = local.storageKey;
      const stored = fromCookie ?? (key === undefined ? undefined : readStored(key));
      if (stored !== undefined) setOpen(stored);
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      const shortcut = local.keyboardShortcut ?? SIDEBAR_KEYBOARD_SHORTCUT;
      if (shortcut === false) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === shortcut.toLowerCase()) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const context: SidebarContextValue = {
    state: () => (open() ? "expanded" : "collapsed"),
    open,
    setOpen,
    openMobile,
    setOpenMobile: (next) => {
      setOpenMobile(next);
    },
    isMobile,
    toggleSidebar,
    dir,
  };
  const widths = `--sidebar-width:${SIDEBAR_WIDTH};--sidebar-width-icon:${SIDEBAR_WIDTH_ICON}`;
  return (
    <sidebarContext.Provider value={context}>
      <TooltipProvider delayDuration={0}>
        <div
          ref={(node: HTMLElement) => {
            wrapperNode = node;
          }}
          data-slot="sidebar-wrapper"
          style={
            typeof local.style === "string"
              ? `${widths};${local.style}`
              : {
                  "--sidebar-width": SIDEBAR_WIDTH,
                  "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                  ...local.style,
                }
          }
          class={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            local.class,
          )}
          {...rest}
        >
          {local.children}
        </div>
      </TooltipProvider>
    </sidebarContext.Provider>
  );
}

/**
 * Props of {@link Sidebar}: the attributes of a `div` plus where it sits and how it collapses.
 * @since 1.0.0
 * @see {@link Sidebar}
 */
export type SidebarProps = ComponentProps<"div"> & {
  /**
   * The edge the sidebar sits on. `"start"` and `"end"` are inline edges: start is the left in
   * left-to-right text and the right in right-to-left text. `"left"` and `"right"` (shadcn/ui's names)
   * are physical edges: the sidebar stays on that side of the screen, so in right-to-left text `"left"`
   * means the end edge. Prefer `"start"` and `"end"` for a layout that should mirror.
   * @default "start"
   */
  readonly side?: "start" | "end" | "left" | "right" | undefined;
  /**
   * `"sidebar"` is the flat panel, `"floating"` a rounded panel with a border, and `"inset"` a panel
   * next to an inset page (see {@link SidebarInset}).
   * @default "sidebar"
   */
  readonly variant?: "sidebar" | "floating" | "inset" | undefined;
  /**
   * `"offcanvas"` slides the sidebar out of view, `"icon"` shrinks it to an icon rail, and `"none"`
   * keeps it open.
   * @default "offcanvas"
   */
  readonly collapsible?: "offcanvas" | "icon" | "none" | undefined;
  /**
   * The element that holds the sidebar. Pass `"div"` when the sidebar sits inside another landmark,
   * since a landmark may not nest in one. `aria-label` (default "Sidebar") or `aria-labelledby` names
   * the landmark.
   * @default "aside"
   */
  readonly as?: "aside" | "nav" | "section" | "div" | undefined;
};

/**
 * The accessible name of the sidebar's element: the caller's `aria-labelledby` takes precedence,
 * else the caller's `aria-label`, else the default name ("Sidebar") for a landmark. A plain `div` gets no default name,
 * since ARIA does not allow a name on a generic element.
 */
function landmarkLabel(
  element: string,
  label: string | null | undefined,
  labelledBy: string | null | undefined,
  fallback: string,
): string | undefined {
  if (labelledBy !== undefined && labelledBy !== null) return undefined;
  if (typeof label === "string") return label;
  return element === "div" ? undefined : fallback;
}

/**
 * The sidebar panel. On a wide viewport it is a fixed panel that can collapse; on a narrow one it
 * opens as a sheet from the same side (toggled by {@link SidebarTrigger}). Put the header, the
 * content and the footer inside it. Its root carries `data-state`, `data-collapsible`,
 * `data-variant` and `data-side`, which style the parts inside.
 *
 * Keyboard and ARIA: the root is an `aside` landmark named "Sidebar" by default. Pass `aria-label`
 * or `aria-labelledby` to name it, and `as` to change the element. Keyboard users toggle the
 * sidebar with Ctrl+B or Cmd+B (see {@link SidebarProvider}) or with the {@link SidebarTrigger}. On
 * a mobile layout the sheet's title is a visually hidden "Sidebar" and Escape closes the sheet. With
 * `collapsible="none"` the panel cannot collapse; an `offcanvas` panel that is collapsed slides out
 * of view.
 *
 * shadcn/ui differences: the root is an `aside` landmark, where shadcn/ui renders a plain `div`.
 * `as` picks that element, and `class` replaces `className`.
 *
 * @param props - The props, see {@link SidebarProps}.
 * @returns The sidebar: a panel on wide viewports, or a sheet on narrow ones.
 * @example
 * ```tsx
 * import {
 *   Sidebar,
 *   SidebarContent,
 *   SidebarFooter,
 *   SidebarHeader,
 *   SidebarProvider,
 *   SidebarRail,
 * } from "@/components/ui/sidebar";
 *
 * export function Workspace() {
 *   return (
 *     <SidebarProvider>
 *       <Sidebar collapsible="icon" aria-label="Workspace">
 *         <SidebarHeader>Acme</SidebarHeader>
 *         <SidebarContent>Projects</SidebarContent>
 *         <SidebarFooter>Account</SidebarFooter>
 *         <SidebarRail />
 *       </Sidebar>
 *     </SidebarProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarProvider}
 */
function Sidebar(props: SidebarProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "side",
    "variant",
    "collapsible",
    "class",
    "children",
    "as",
    "aria-label",
    "aria-labelledby",
  ]);
  const sidebar = useSidebar();
  const t = useUiStrings();
  // A physical edge becomes the inline edge that is there in the current reading direction.
  const side = (): "start" | "end" => {
    const wanted = local.side ?? "start";
    if (wanted === "start" || wanted === "end") return wanted;
    const leftIsStart = sidebar.dir() === "ltr";
    return (wanted === "left") === leftIsStart ? "start" : "end";
  };
  const variant = (): "sidebar" | "floating" | "inset" => local.variant ?? "sidebar";
  const collapsible = (): "offcanvas" | "icon" | "none" => local.collapsible ?? "offcanvas";
  const spaced = (): boolean => variant() === "floating" || variant() === "inset";
  // Off-canvas and collapsed, the panel is out of view: its content must not stay reachable.
  const hidden = (): boolean =>
    !sidebar.isMobile() && sidebar.state() === "collapsed" && collapsible() === "offcanvas";
  return (
    <sidebarSideContext.Provider value={side}>
      <sidebarHiddenContext.Provider value={hidden}>
        <Show
          when={collapsible() === "none"}
          fallback={
            <Show
              when={sidebar.isMobile()}
              fallback={
                <Polymorphic
                  as={local.as ?? "aside"}
                  aria-label={landmarkLabel(
                    local.as ?? "aside",
                    local["aria-label"],
                    local["aria-labelledby"],
                    t("sidebar.title", "Sidebar"),
                  )}
                  aria-labelledby={local["aria-labelledby"]}
                  class="group peer hidden text-sidebar-foreground md:block"
                  data-state={sidebar.state()}
                  data-collapsible={sidebar.state() === "collapsed" ? collapsible() : ""}
                  data-variant={variant()}
                  data-side={side()}
                  data-slot="sidebar"
                >
                  <div
                    data-slot="sidebar-gap"
                    class={cn(
                      "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 motion-reduce:transition-none",
                      spaced()
                        ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
                    )}
                  />
                  <div
                    data-slot="sidebar-container"
                    class={cn(
                      "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear motion-reduce:transition-none md:flex",
                      side() === "start"
                        ? "start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]"
                        : "end-0 group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)]",
                      spaced()
                        ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=end]:border-s group-data-[side=start]:border-e",
                      local.class,
                    )}
                    {...rest}
                  >
                    <div
                      data-sidebar="sidebar"
                      data-slot="sidebar-inner"
                      class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
                    >
                      {local.children}
                    </div>
                  </div>
                </Polymorphic>
              }
            >
              <Sheet open={sidebar.openMobile()} onOpenChange={sidebar.setOpenMobile}>
                <SheetContent
                  data-sidebar="sidebar"
                  data-slot="sidebar"
                  data-mobile="true"
                  side={side()}
                  showCloseButton={false}
                  class="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground"
                  style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}
                >
                  <SheetHeader class="sr-only">
                    <SheetTitle>{t("sidebar.title", "Sidebar")}</SheetTitle>
                    <SheetDescription>
                      {t("sidebar.mobileDescription", "Displays the mobile sidebar.")}
                    </SheetDescription>
                  </SheetHeader>
                  <Polymorphic
                    as={local.as ?? "aside"}
                    aria-label={landmarkLabel(
                      local.as ?? "aside",
                      local["aria-label"],
                      local["aria-labelledby"],
                      t("sidebar.title", "Sidebar"),
                    )}
                    aria-labelledby={local["aria-labelledby"]}
                    class="flex h-full w-full flex-col"
                  >
                    {local.children}
                  </Polymorphic>
                </SheetContent>
              </Sheet>
            </Show>
          }
        >
          <Polymorphic
            as={local.as ?? "aside"}
            aria-label={landmarkLabel(
              local.as ?? "aside",
              local["aria-label"],
              local["aria-labelledby"],
              t("sidebar.title", "Sidebar"),
            )}
            aria-labelledby={local["aria-labelledby"]}
            data-slot="sidebar"
            class={cn(
              "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
              local.class,
            )}
            {...rest}
          >
            {local.children}
          </Polymorphic>
        </Show>
      </sidebarHiddenContext.Provider>
    </sidebarSideContext.Provider>
  );
}

/**
 * The button that toggles the sidebar, or its mobile sheet on a narrow viewport. It renders a
 * ghost icon {@link Button} with a visually hidden "Toggle Sidebar" name.
 *
 * Keyboard and ARIA: Enter and Space toggle it (it is a button). Its name is "Toggle Sidebar" (the UI
 * string `sidebar.toggle`), and `aria-expanded` says whether the sidebar (the mobile sheet on a narrow
 * viewport) is open.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the `Button` props, `onClick` (called before the toggle), and `class`.
 * @returns The button.
 * @example
 * ```tsx
 * import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
 *
 * export function Header() {
 *   return (
 *     <SidebarProvider>
 *       <header>
 *         <SidebarTrigger />
 *       </header>
 *     </SidebarProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarProvider}
 */
function SidebarTrigger(props: ButtonProps<"button">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "onClick"]);
  const sidebar = useSidebar();
  const t = useUiStrings();
  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      aria-expanded={sidebar.isMobile() ? sidebar.openMobile() : sidebar.open()}
      class={cn("size-7", local.class)}
      onClick={(event: MouseEvent) => {
        callHandler(local.onClick, event);
        sidebar.toggleSidebar();
      }}
      {...rest}
    >
      <PanelLeftIcon class="rtl:rotate-180" />
      <span class="sr-only">{t("sidebar.toggle", "Toggle Sidebar")}</span>
    </Button>
  );
}

/**
 * A thin strip along the sidebar's inner edge that toggles the sidebar when it is clicked. Place it
 * inside a {@link Sidebar}.
 *
 * Keyboard and ARIA: the rail is pointer only. It is not in the tab order (`tabindex="-1"`); keyboard
 * users toggle the sidebar with {@link SidebarTrigger} or Ctrl+B. It is named "Toggle Sidebar".
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `button`, and `class`.
 * @returns The rail button.
 * @example
 * ```tsx
 * import { Sidebar, SidebarContent, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";
 *
 * export function Edge() {
 *   return (
 *     <SidebarProvider>
 *       <Sidebar>
 *         <SidebarContent>Navigation</SidebarContent>
 *         <SidebarRail />
 *       </Sidebar>
 *     </SidebarProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Sidebar}
 */
function SidebarRail(props: ComponentProps<"button">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  const sidebar = useSidebar();
  const t = useUiStrings();
  return (
    <button
      type="button"
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label={t("sidebar.toggle", "Toggle Sidebar")}
      tabindex={-1}
      onClick={sidebar.toggleSidebar}
      title={t("sidebar.toggle", "Toggle Sidebar")}
      class={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=end]:start-0 group-data-[side=start]:-end-4 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] hover:after:bg-sidebar-border motion-reduce:transition-none sm:flex rtl:translate-x-1/2",
        "in-data-[side=end]:cursor-e-resize in-data-[side=start]:cursor-w-resize rtl:in-data-[side=end]:cursor-w-resize rtl:in-data-[side=start]:cursor-e-resize",
        "[[data-side=end][data-state=collapsed]_&]:cursor-w-resize [[data-side=start][data-state=collapsed]_&]:cursor-e-resize rtl:[[data-side=end][data-state=collapsed]_&]:cursor-e-resize rtl:[[data-side=start][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:start-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=end][data-collapsible=offcanvas]_&]:-start-2 [[data-side=start][data-collapsible=offcanvas]_&]:-end-2",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Props of {@link SidebarInset}: the attributes of a `main` plus the element it renders as.
 * @since 1.0.0
 * @see {@link SidebarInset}
 */
export type SidebarInsetProps = ComponentProps<"main"> & {
  /**
   * The element of the page content. Pass `"div"` when the inset sits inside another `main` landmark,
   * since a page may have one main landmark.
   * @default "main"
   */
  readonly as?: "main" | "div" | undefined;
};

/**
 * The page content next to the sidebar. It is the page's `main` landmark by default. With
 * `variant="inset"` on the sidebar it becomes a rounded card.
 *
 * Keyboard and ARIA: no keys of its own. It is a `main` landmark unless `as` changes it.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `as` and the attributes of the element.
 * @returns The inset element with the page inside.
 * @example
 * ```tsx
 * import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
 *
 * export function Page() {
 *   return (
 *     <SidebarProvider>
 *       <Sidebar />
 *       <SidebarInset>
 *         <header>Dashboard</header>
 *       </SidebarInset>
 *     </SidebarProvider>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarProvider}
 */
function SidebarInset(props: SidebarInsetProps): JSX.Element {
  const [local, rest] = splitProps(props, ["as", "class", "children"]);
  return (
    <Polymorphic
      as={local.as ?? "main"}
      data-slot="sidebar-inset"
      class={cn(
        "relative flex w-full flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </Polymorphic>
  );
}

/**
 * A text field styled for the sidebar, typically a search box. It is the kit's {@link Input} with
 * the sidebar's height and background.
 *
 * Keyboard and ARIA: a native `input`; it takes the usual text keys. Name it with a label
 * (`id` on the input, `htmlFor` on the label) or with `aria-label`, since a placeholder is not a name.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `input`, and `class`.
 * @returns The input element.
 * @example
 * ```tsx
 * import { SidebarInput } from "@/components/ui/sidebar";
 *
 * export function SidebarSearch() {
 *   return <SidebarInput type="search" aria-label="Search the docs" placeholder="Search the docs..." />;
 * }
 * ```
 * @since 1.0.0
 */
function SidebarInput(props: ComponentProps<"input">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      class={cn("h-8 w-full bg-background shadow-none", local.class)}
      {...rest}
    />
  );
}

/**
 * The top of the sidebar, for a logo or a workspace switcher. It stays at the top while the content
 * scrolls.
 *
 * Keyboard and ARIA: no keys and no role of its own; a `div`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `div`, and `class`.
 * @returns The header `div`.
 * @example
 * ```tsx
 * import { SidebarHeader } from "@/components/ui/sidebar";
 *
 * export function Brand() {
 *   return <SidebarHeader>Acme workspace</SidebarHeader>;
 * }
 * ```
 * @since 1.0.0
 */
function SidebarHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  const hidden = sidebarHiddenContext.useOptional();
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      inert={hidden?.() ? true : undefined}
      class={cn("flex flex-col gap-2 p-2", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * The bottom of the sidebar, for an account menu or other secondary actions.
 *
 * Keyboard and ARIA: no keys and no role of its own; a `div`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `div`, and `class`.
 * @returns The footer `div`.
 * @example
 * ```tsx
 * import { SidebarFooter } from "@/components/ui/sidebar";
 *
 * export function Account() {
 *   return <SidebarFooter>Signed in as Ada</SidebarFooter>;
 * }
 * ```
 * @since 1.0.0
 */
function SidebarFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  const hidden = sidebarHiddenContext.useOptional();
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      inert={hidden?.() ? true : undefined}
      class={cn("flex flex-col gap-2 p-2", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * A line between sidebar sections. It is the {@link Separator} of the kit, styled for the sidebar.
 *
 * Keyboard and ARIA: no keys. It is a separator with `role="none"` unless `decorative={false}` is
 * passed.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `orientation`, `decorative`, the attributes of the element, and `class`.
 * @returns The separator element.
 * @example
 * ```tsx
 * import { SidebarContent, SidebarSeparator } from "@/components/ui/sidebar";
 *
 * export function Sections() {
 *   return (
 *     <SidebarContent>
 *       <span>Projects</span>
 *       <SidebarSeparator />
 *       <span>Teams</span>
 *     </SidebarContent>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SidebarSeparator(props: SeparatorProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      class={cn("mx-2 w-auto bg-sidebar-border", local.class)}
      {...rest}
    />
  );
}

/**
 * The scrollable middle of the sidebar, holding the groups. It scrolls on its own, so the header and
 * footer stay in place.
 *
 * Keyboard and ARIA: no keys and no role of its own. Focusable items inside it are reached with Tab.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `div`, and `class`.
 * @returns The content `div`.
 * @example
 * ```tsx
 * import { SidebarContent, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
 *
 * export function Navigation() {
 *   return (
 *     <SidebarContent>
 *       <SidebarGroup>
 *         <SidebarGroupLabel>Application</SidebarGroupLabel>
 *       </SidebarGroup>
 *     </SidebarContent>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SidebarContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  const hidden = sidebarHiddenContext.useOptional();
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      inert={hidden?.() ? true : undefined}
      class={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * A section of the sidebar: a label, an optional action, and the content (usually a
 * {@link SidebarMenu}).
 *
 * Keyboard and ARIA: no keys and no role of its own; a `div`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `div`, and `class`.
 * @returns The group `div`.
 * @example
 * ```tsx
 * import {
 *   SidebarGroup,
 *   SidebarGroupContent,
 *   SidebarGroupLabel,
 *   SidebarMenu,
 * } from "@/components/ui/sidebar";
 *
 * export function ProjectsGroup() {
 *   return (
 *     <SidebarGroup>
 *       <SidebarGroupLabel>Projects</SidebarGroupLabel>
 *       <SidebarGroupContent>
 *         <SidebarMenu />
 *       </SidebarGroupContent>
 *     </SidebarGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarGroupLabel}
 */
function SidebarGroup(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      class={cn("relative flex w-full min-w-0 flex-col p-2", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * Props of {@link SidebarGroupLabel}.
 * @since 1.0.0
 * @see {@link SidebarGroupLabel}
 */
export type SidebarGroupLabelProps<T extends PolymorphicTarget = "div"> = PolymorphicProps<
  "div",
  object,
  T
>;

/**
 * The heading of a group. It fades out while the sidebar is collapsed to icons.
 *
 * Keyboard and ARIA: no keys, and it is a `div` with no role. It can be focused (`focus-visible`
 * styles apply) when you pass `tabindex`, but it is not a heading unless you render one with `as`.
 *
 * shadcn/ui differences: `class` replaces `className`, and `as` replaces `asChild`.
 *
 * @param props - The props: `as` (default `div`), and the attributes of the element.
 * @returns The label element.
 * @example
 * ```tsx
 * import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
 *
 * export function Application() {
 *   return (
 *     <SidebarGroup>
 *       <SidebarGroupLabel as="h2">Application</SidebarGroupLabel>
 *     </SidebarGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SidebarGroupLabel<T extends PolymorphicTarget = "div">(
  props: SidebarGroupLabelProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class"]);
  return (
    <Polymorphic
      as={local.as ?? "div"}
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      class={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-none transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 motion-reduce:transition-none [&>svg]:size-4 [&>svg]:shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * Props of {@link SidebarGroupAction}.
 * @since 1.0.0
 * @see {@link SidebarGroupAction}
 */
export type SidebarGroupActionProps<T extends PolymorphicTarget = "button"> = PolymorphicProps<
  "button",
  object,
  T
>;

/**
 * A small button in the corner of a group, for example to add an item. It is hidden while the
 * sidebar shows icons only.
 *
 * Keyboard and ARIA: a `button` (Enter and Space press it). Name it with its text or `aria-label`.
 * A `title` alone is not a reliable name, so pass `aria-label` for an icon-only action.
 *
 * shadcn/ui differences: `class` replaces `className`, and `as` replaces `asChild`.
 *
 * @param props - The props: `as` (default `button`), and the attributes of the element.
 * @returns The action button.
 * @example
 * ```tsx
 * import { ChevronRightIcon } from "@/components/ui/icons";
 * import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel } from "@/components/ui/sidebar";
 *
 * export function AddProject() {
 *   return (
 *     <SidebarGroup>
 *       <SidebarGroupLabel>Projects</SidebarGroupLabel>
 *       <SidebarGroupAction aria-label="Open projects">
 *         <ChevronRightIcon />
 *       </SidebarGroupAction>
 *     </SidebarGroup>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SidebarGroupAction<T extends PolymorphicTarget = "button">(
  props: SidebarGroupActionProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, ["as", "class"]);
  return (
    <Polymorphic
      as={local.as ?? "button"}
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      class={cn(
        "absolute end-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-none transition-transform group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 motion-reduce:transition-none after:absolute after:-inset-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * The content of a group, usually a {@link SidebarMenu}. It sets the text size of the group.
 *
 * Keyboard and ARIA: no keys and no role of its own; a `div`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `div`, and `class`.
 * @returns The content `div`.
 * @example
 * ```tsx
 * import { SidebarGroupContent, SidebarMenu } from "@/components/ui/sidebar";
 *
 * export function Menu() {
 *   return (
 *     <SidebarGroupContent>
 *       <SidebarMenu />
 *     </SidebarGroupContent>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SidebarGroupContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      class={cn("w-full text-sm", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * A list of menu items: a `ul` whose children are {@link SidebarMenuItem}s.
 *
 * Keyboard and ARIA: no keys of its own; the items are reached with Tab. The list has the `list`
 * role, and each item is a `listitem`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `ul`, and `class`.
 * @returns The list element.
 * @example
 * ```tsx
 * import {
 *   SidebarMenu,
 *   SidebarMenuButton,
 *   SidebarMenuItem,
 * } from "@/components/ui/sidebar";
 *
 * export function MainMenu() {
 *   return (
 *     <SidebarMenu>
 *       <SidebarMenuItem>
 *         <SidebarMenuButton>Home</SidebarMenuButton>
 *       </SidebarMenuItem>
 *     </SidebarMenu>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SidebarMenu(props: ComponentProps<"ul">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      class={cn("flex w-full min-w-0 flex-col gap-1", local.class)}
      {...rest}
    >
      {local.children}
    </ul>
  );
}

/**
 * One entry of a menu. It holds the {@link SidebarMenuButton} and its optional action, badge and
 * sub menu.
 *
 * Keyboard and ARIA: no keys and no role of its own; a `li` (a list item).
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `li`, and `class`.
 * @returns The list item.
 * @example
 * ```tsx
 * import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
 *
 * export function Entry() {
 *   return (
 *     <SidebarMenu>
 *       <SidebarMenuItem>
 *         <SidebarMenuButton>Home</SidebarMenuButton>
 *       </SidebarMenuItem>
 *     </SidebarMenu>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarMenuButton}
 */
function SidebarMenuItem(props: ComponentProps<"li">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      class={cn("group/menu-item relative", local.class)}
      {...rest}
    >
      {local.children}
    </li>
  );
}

/**
 * The class list of a sidebar menu button, built from `variant` and `size`. Use it to style a link
 * or another element like a menu button.
 *
 * @param props - Optional `variant` (`"default"` or `"outline"`) and `size` (`"default"`, `"sm"` or
 * `"lg"`), and an optional `class` to add.
 * @returns The class string.
 * @example
 * ```tsx
 * import { sidebarMenuButtonVariants } from "@/components/ui/sidebar";
 *
 * export function OutlineLink() {
 *   return (
 *     <a href="/home" class={sidebarMenuButtonVariants({ variant: "outline", size: "lg" })}>
 *       Home
 *     </a>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarMenuButton}
 */
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm ring-sidebar-ring outline-none transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground motion-reduce:transition-none forced-colors:data-[active=true]:bg-[Highlight] forced-colors:data-[active=true]:text-[HighlightText] [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Own props of {@link SidebarMenuButton}.
 * @since 1.0.0
 * @see {@link SidebarMenuButton}
 */
export interface SidebarMenuButtonExtraProps
  extends VariantProps<typeof sidebarMenuButtonVariants> {
  /**
   * Marks the current page. The button gets `data-active="true"` and is highlighted.
   * @default false
   */
  readonly isActive?: boolean | undefined;
  /**
   * A tooltip shown beside the button while the sidebar is collapsed to icons: a string, or the
   * props of `TooltipContent` (`children`, `side`...). It names the entry in that state.
   * @default none (no tooltip)
   */
  readonly tooltip?: string | TooltipContentProps | undefined;
}

/**
 * Props of {@link SidebarMenuButton}: `isActive`, `tooltip`, `variant` and `size`, and the attributes
 * of the rendered element. `as` renders another element, such as a link.
 * @since 1.0.0
 * @see {@link SidebarMenuButton}
 */
export type SidebarMenuButtonProps<T extends PolymorphicTarget = "button"> = PolymorphicProps<
  "button",
  SidebarMenuButtonExtraProps,
  T
>;

/**
 * A menu entry. It renders a `button`, or another element with `as` (for example an `a` for a
 * link). While the sidebar is collapsed to icons, the `tooltip` shows beside the entry on hover or
 * focus, and names it.
 *
 * Keyboard and ARIA: a native button (or the element `as` renders) that takes focus and activates
 * with Enter and Space. `isActive` sets `data-active="true"`; the page's current link should also
 * get `aria-current="page"` from you. The tooltip is shown on hover and keyboard focus only while
 * the sidebar is collapsed, and it is a tooltip, so it does not replace an accessible name: give an
 * icon-only entry a text label or `aria-label`.
 *
 * shadcn/ui differences: `as` replaces `asChild`, and `class` replaces `className`.
 *
 * @param props - The props, see {@link SidebarMenuButtonProps}.
 * @returns The menu button, or a tooltip wrapping it while `tooltip` is set.
 * @example
 * ```tsx
 * import { InfoIcon } from "@/components/ui/icons";
 * import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
 *
 * export function DashboardLink() {
 *   return (
 *     <SidebarMenu>
 *       <SidebarMenuItem>
 *         <SidebarMenuButton isActive tooltip="Dashboard" as="a" href="/">
 *           <InfoIcon />
 *           <span>Dashboard</span>
 *         </SidebarMenuButton>
 *       </SidebarMenuItem>
 *     </SidebarMenu>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarMenuItem}
 */
function SidebarMenuButton<T extends PolymorphicTarget = "button">(
  props: SidebarMenuButtonProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & SidebarMenuButtonExtraProps, [
    "as",
    "isActive",
    "variant",
    "size",
    "tooltip",
    "class",
  ]);
  const sidebar = useSidebar();
  const side = sidebarSideContext.useOptional();
  const direction = sidebar.dir;
  const [hovered, setHovered] = useSignal(false);
  const collapsed = (): boolean => sidebar.state() === "collapsed" && !sidebar.isMobile();
  // The tooltip is forced shut while the sidebar is expanded, so the primitive never reports that
  // it closed; forget the hover then, or it would pop up again at the next collapse.
  useEffect(() => {
    if (!collapsed()) setHovered(false);
  });
  // The tooltip points into the page: away from the edge the sidebar sits on.
  const tooltipSide = (): "left" | "right" =>
    ((side?.() ?? "start") === "start") === (direction() === "ltr") ? "right" : "left";
  const tooltip = (): TooltipContentProps =>
    typeof local.tooltip === "string"
      ? { children: local.tooltip }
      : (local.tooltip ?? { children: "" });
  return (
    <Show
      when={local.tooltip !== undefined}
      fallback={
        <Polymorphic
          as={local.as ?? "button"}
          data-slot="sidebar-menu-button"
          data-sidebar="menu-button"
          data-size={local.size ?? "default"}
          data-active={local.isActive === true ? "true" : "false"}
          class={cn(
            sidebarMenuButtonVariants({ variant: local.variant, size: local.size }),
            local.class,
          )}
          {...rest}
        />
      }
    >
      <Tooltip open={hovered() && collapsed()} onOpenChange={setHovered}>
        <TooltipTrigger
          as={local.as ?? "button"}
          data-slot="sidebar-menu-button"
          data-sidebar="menu-button"
          data-size={local.size ?? "default"}
          data-active={local.isActive === true ? "true" : "false"}
          class={cn(
            sidebarMenuButtonVariants({ variant: local.variant, size: local.size }),
            local.class,
          )}
          {...rest}
        />
        <TooltipContent side={tooltipSide()} align="center" {...tooltip()} />
      </Tooltip>
    </Show>
  );
}

/**
 * Props of {@link SidebarMenuAction}.
 * @since 1.0.0
 * @see {@link SidebarMenuAction}
 */
export type SidebarMenuActionProps<T extends PolymorphicTarget = "button"> = PolymorphicProps<
  "button",
  {
    /** Only show it while the item is hovered or focused (desktop). */
    readonly showOnHover?: boolean | undefined;
  },
  T
>;

/**
 * A secondary button at the end of a menu item, such as an options menu. It is hidden while the
 * sidebar is collapsed to icons.
 *
 * Keyboard and ARIA: a `button` (Enter and Space press it). It has no name of its own, so give it an
 * `aria-label` when it shows only an icon. With `showOnHover` it is hidden on desktop until the item
 * is hovered or focused, but it stays in the tab order.
 *
 * shadcn/ui differences: `as` replaces `asChild`, and `class` replaces `className`.
 *
 * @param props - The props: `showOnHover`, `as`, and the attributes of the element.
 * @returns The action element.
 * @example
 * ```tsx
 * import { EllipsisIcon } from "@/components/ui/icons";
 * import {
 *   SidebarMenu,
 *   SidebarMenuAction,
 *   SidebarMenuButton,
 *   SidebarMenuItem,
 * } from "@/components/ui/sidebar";
 *
 * export function ProjectRow() {
 *   return (
 *     <SidebarMenu>
 *       <SidebarMenuItem>
 *         <SidebarMenuButton>Website</SidebarMenuButton>
 *         <SidebarMenuAction showOnHover aria-label="Project options">
 *           <EllipsisIcon />
 *         </SidebarMenuAction>
 *       </SidebarMenuItem>
 *     </SidebarMenu>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarMenuButton}
 */
function SidebarMenuAction<T extends PolymorphicTarget = "button">(
  props: SidebarMenuActionProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & { showOnHover?: boolean }, [
    "as",
    "class",
    "showOnHover",
  ]);
  return (
    <Polymorphic
      as={local.as ?? "button"}
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      class={cn(
        "absolute end-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-none transition-transform peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 motion-reduce:transition-none after:absolute after:-inset-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.showOnHover === true &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground data-[state=open]:opacity-100 md:opacity-0",
        local.class,
      )}
      {...rest}
    />
  );
}

/**
 * A number or short text at the end of a menu item. It is hidden while the sidebar shows icons only,
 * and it ignores the pointer.
 *
 * Keyboard and ARIA: no keys and no role of its own. The badge's text is read as part of the item.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `div`, and `class`.
 * @returns The badge `div`.
 * @example
 * ```tsx
 * import { SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
 *
 * export function InboxEntry() {
 *   return (
 *     <SidebarMenu>
 *       <SidebarMenuItem>
 *         <SidebarMenuButton>Inbox</SidebarMenuButton>
 *         <SidebarMenuBadge>24</SidebarMenuBadge>
 *       </SidebarMenuItem>
 *     </SidebarMenu>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SidebarMenuBadge(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      class={cn(
        "pointer-events-none absolute end-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 group-data-[collapsible=icon]:hidden",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * A placeholder row shown while a menu loads. Its text bar is 50% to 90% of the row wide, and the
 * width is the same on the server and in the browser for the same placeholder.
 *
 * Keyboard and ARIA: no keys. The placeholders are decorative (`aria-hidden`, from the
 * {@link Skeleton}); mark the menu with `aria-busy="true"` while it loads.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: `showIcon` (adds an icon placeholder), and the attributes of the `div`.
 * @returns The placeholder `div`.
 * @example
 * ```tsx
 * import { SidebarMenu, SidebarMenuSkeleton } from "@/components/ui/sidebar";
 *
 * export function LoadingMenu() {
 *   return (
 *     <SidebarMenu aria-busy="true">
 *       <SidebarMenuSkeleton showIcon />
 *       <SidebarMenuSkeleton />
 *     </SidebarMenu>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Skeleton}
 */
function SidebarMenuSkeleton(
  props: ComponentProps<"div"> & { readonly showIcon?: boolean | undefined },
): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "showIcon"]);
  const id = useBaseId();
  // A hash of the id: random widths would differ between the server and the client.
  const width = (): string => {
    let hash = 0;
    for (const character of id()) hash = (hash * 31 + character.charCodeAt(0)) % 41;
    return `${50 + hash}%`;
  };
  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      class={cn("flex h-8 items-center gap-2 rounded-md px-2", local.class)}
      {...rest}
    >
      <Show when={local.showIcon === true}>
        <Skeleton class="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />
      </Show>
      <Skeleton
        class="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={{ "--skeleton-width": width() }}
      />
    </div>
  );
}

/**
 * A nested list under a menu item, drawn with a line along its start edge. It is hidden while the
 * sidebar shows icons only.
 *
 * Keyboard and ARIA: no keys of its own. It is a `ul`, and its entries are reached with Tab.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `ul`, and `class`.
 * @returns The sub menu list.
 * @example
 * ```tsx
 * import {
 *   SidebarMenuSub,
 *   SidebarMenuSubButton,
 *   SidebarMenuSubItem,
 * } from "@/components/ui/sidebar";
 *
 * export function TeamLinks() {
 *   return (
 *     <SidebarMenuSub>
 *       <SidebarMenuSubItem>
 *         <SidebarMenuSubButton as="a" href="/team">
 *           Team
 *         </SidebarMenuSubButton>
 *       </SidebarMenuSubItem>
 *     </SidebarMenuSub>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function SidebarMenuSub(props: ComponentProps<"ul">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      class={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden rtl:-translate-x-px",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </ul>
  );
}

/**
 * One entry of a {@link SidebarMenuSub}, holding a {@link SidebarMenuSubButton}.
 *
 * Keyboard and ARIA: no keys and no role of its own; a `li`.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `li`, and `class`.
 * @returns The list item.
 * @example
 * ```tsx
 * import { SidebarMenuSub, SidebarMenuSubItem } from "@/components/ui/sidebar";
 *
 * export function Nested() {
 *   return (
 *     <SidebarMenuSub>
 *       <SidebarMenuSubItem>Team</SidebarMenuSubItem>
 *     </SidebarMenuSub>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarMenuSubButton}
 */
function SidebarMenuSubItem(props: ComponentProps<"li">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      class={cn("group/menu-sub-item relative", local.class)}
      {...rest}
    >
      {local.children}
    </li>
  );
}

/**
 * Props of {@link SidebarMenuSubButton}.
 * @since 1.0.0
 * @see {@link SidebarMenuSubButton}
 */
export type SidebarMenuSubButtonProps<T extends PolymorphicTarget = "a"> = PolymorphicProps<
  "a",
  {
    /**
     * The text size of the entry: `"md"` or `"sm"`.
     * @default "md"
     */
    readonly size?: "sm" | "md" | undefined;
    /**
     * Marks the current page. The entry gets `data-active="true"` and is highlighted.
     * @default false
     */
    readonly isActive?: boolean | undefined;
  },
  T
>;

/**
 * A link in a sub menu. It renders an `a`; `as` renders a router link or a `button` instead.
 *
 * Keyboard and ARIA: a link that takes focus and follows with Enter. `isActive` sets
 * `data-active="true"`; give the current page `aria-current="page"` yourself.
 *
 * shadcn/ui differences: `as` replaces `asChild`, and `class` replaces `className`.
 *
 * @param props - The props, see {@link SidebarMenuSubButtonProps}.
 * @returns The link element.
 * @example
 * ```tsx
 * import { SidebarMenuSubButton } from "@/components/ui/sidebar";
 *
 * export function TeamLink() {
 *   return (
 *     <SidebarMenuSubButton as="a" href="/team" isActive aria-current="page">
 *       Team
 *     </SidebarMenuSubButton>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link SidebarMenuSub}
 */
function SidebarMenuSubButton<T extends PolymorphicTarget = "a">(
  props: SidebarMenuSubButtonProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as Loose & { size?: "sm" | "md"; isActive?: boolean },
    ["as", "size", "isActive", "class"],
  );
  return (
    <Polymorphic
      as={local.as ?? "a"}
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={local.size ?? "md"}
      data-active={local.isActive === true ? "true" : "false"}
      class={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-none group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground rtl:translate-x-px forced-colors:data-[active=true]:bg-[Highlight] forced-colors:data-[active=true]:text-[HighlightText] [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.size === "sm" ? "text-xs" : "text-sm",
        local.class,
      )}
      {...rest}
    />
  );
}

export {
  readSidebarCookie,
  SIDEBAR_COOKIE_NAME,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  sidebarCookie,
  sidebarMenuButtonVariants,
  useSidebar,
};
