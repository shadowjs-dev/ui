import {
  type Accessor,
  createContext,
  isServer,
  onMount,
  splitProps,
  untrack,
  useContext,
  useEffect,
} from "@shadow-js/core";
import {
  createToaster as createQueue,
  type SwipeDirection,
  type ToastItem,
  type ToastPatch,
  Toast as ToastPrimitive,
  type Toaster as ToastQueue,
  type ToastType,
  useDirection,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX, JsxChild } from "@shadow-js/web";
import { For, Show } from "@shadow-js/web";
import { buttonVariants } from "@/components/ui/button";
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  LoaderIcon,
  TriangleAlertIcon,
  XIcon,
} from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * The look of a toast: `default` has no icon, the others show their status icon.
 * @since 1.0.0
 * @see {@link ToastApi}
 */
export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "loading";

/**
 * Where the toasts appear. `left` and `right` are the inline start and end, so they swap in
 * right-to-left layouts.
 * @since 1.0.0
 * @see {@link ToasterProps}
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * A button inside a toast.
 * @since 1.0.0
 * @see {@link ExternalToast}
 */
export interface ToastAction {
  /** The text (or content) of the button. */
  readonly label: JsxChild;
  /**
   * What screen readers hear in place of the button when the toast is announced. Default: the
   * label when it is text.
   */
  readonly altText?: string | undefined;
  /** Called on click. Calling `event.preventDefault()` keeps the toast open. */
  readonly onClick?: ((event: MouseEvent) => void) | undefined;
  /** Native button attributes, including disabled state, names and classes. @default none */
  readonly buttonProps?: Omit<ComponentProps<"button">, "children" | "onClick"> | undefined;
}

/**
 * Button props accepted by object-style toast actions. Calling `preventDefault` keeps the toast
 * open. The action's text is used for announcements unless `altText` is supplied.
 * @see {@link ToastAddOptions}
 * @since 1.0.0
 */
export interface ToastActionProps extends Omit<ComponentProps<"button">, "children" | "onClick"> {
  /** Content of the action button. */
  readonly children: JsxChild;
  /** Text used when announcing the action. @default the textual children */
  readonly altText?: string | undefined;
  /** Runs before dismissal; may prevent it. @default none */
  readonly onClick?: ((event: MouseEvent) => void) | undefined;
}

/**
 * The toast handed to `onDismiss` and `onAutoClose`.
 * @since 1.0.0
 * @see {@link ExternalToast}
 */
export interface ToastSummary {
  /** The id of the toast (the one the toast call returned). */
  readonly id: string;
  /** The message the toast was raised with. */
  readonly title: JsxChild | undefined;
  /** The second line the toast was raised with, if any. */
  readonly description: JsxChild | undefined;
  /** The variant the toast was raised with. */
  readonly variant: ToastVariant;
}

/**
 * Options of the toast calls and their variants.
 * @since 1.0.0
 * @see {@link ToastApi}
 */
export interface ExternalToast {
  /** Use this id; calling again with the id of an open toast updates that toast. */
  readonly id?: string | number | undefined;
  /** Second line, below the message. */
  readonly description?: JsxChild | undefined;
  /**
   * Milliseconds before it closes itself; `Infinity` keeps it until it is dismissed. Default: the
   * `Toaster`'s `duration`, or `Infinity` for a `toast.loading` toast.
   */
  readonly duration?: number | undefined;
  /** A button that runs `onClick` and closes the toast. */
  readonly action?: ToastAction | undefined;
  /** Native action button props. `action` takes precedence when both are supplied. @default none */
  readonly actionProps?: ToastActionProps | undefined;
  /** A button that closes the toast, running `onClick` first. */
  readonly cancel?: ToastAction | undefined;
  /** Replaces the status icon. */
  readonly icon?: JsxChild | undefined;
  /** Show or hide the close button of this toast (default: the `Toaster`'s `closeButton`). */
  readonly closeButton?: boolean | undefined;
  /** Announce it assertively, interrupting the screen reader. */
  readonly important?: boolean | undefined;
  /** Classes added to this toast. */
  readonly class?: string | undefined;
  /** The user closed it (close button, swipe, Escape) or `toast.dismiss()` did. */
  readonly onDismiss?: ((toast: ToastSummary) => void) | undefined;
  /** The timer closed it. */
  readonly onAutoClose?: ((toast: ToastSummary) => void) | undefined;
}

/**
 * Options of `toast.add`: the title, status type and the same options as the callable toast API.
 * @see {@link ToastApi}
 * @since 1.0.0
 */
export interface ToastAddOptions extends ExternalToast {
  /** The main message. @default none */
  readonly title?: JsxChild | undefined;
  /** Status icon and announcement urgency. @default "default" */
  readonly type?: ToastVariant | undefined;
}

/** What each toast carries through the queue. */
interface ToastData {
  readonly variant: ToastVariant;
  readonly action: ToastAction | undefined;
  readonly cancel: ToastAction | undefined;
  readonly icon: JsxChild | undefined;
  readonly closeButton: boolean | undefined;
  readonly class: string | undefined;
  readonly onDismiss: ((toast: ToastSummary) => void) | undefined;
  readonly onAutoClose: ((toast: ToastSummary) => void) | undefined;
}

type Queue = ToastQueue<ToastData>;

/**
 * Calls made on a store before a `Toaster` mounts on it wait, at most this many; the oldest are
 * dropped first.
 */
const MAX_PENDING = 16;

/**
 * What one state of a promise toast is: a string, or an object with the message and more.
 * @since 1.0.0
 * @see {@link ToastPromiseData}
 */
export type ToastPromiseContent =
  | string
  | number
  | (ExternalToast & {
      /** The text (or content) of the toast. */
      readonly message: JsxChild;
    });

/**
 * The messages of `toast.promise`.
 * @since 1.0.0
 * @see {@link ToastApi}
 */
export interface ToastPromiseData<T> {
  /** Shown while the promise is pending. */
  readonly loading: ToastPromiseContent;
  /** Shown when it resolves; may be computed from the value. */
  readonly success: ToastPromiseContent | ((value: T) => ToastPromiseContent);
  /** Shown when it rejects; may be computed from the reason. */
  readonly error: ToastPromiseContent | ((reason: unknown) => ToastPromiseContent);
  /** Second line shown in every state that does not bring its own. */
  readonly description?: JsxChild | undefined;
  /** Runs after the promise settled, whatever the outcome. */
  readonly finally?: (() => void) | undefined;
}

/**
 * What `toast.promise` returns.
 * @since 1.0.0
 * @see {@link ToastApi}
 */
export interface ToastPromiseResult<T> {
  /** The id of the toast that follows the promise. */
  readonly id: string;
  /** The promise that was passed in; a rejection reaches whoever awaits it. */
  unwrap(): Promise<T>;
}

/**
 * The toast API: call it to show a toast, or use its variants. It is the object {@link useToast}
 * returns and the `toast` of a {@link ToastStore}.
 *
 * `toast(message, options?)` shows a toast and returns its id. `toast.success`, `toast.error`,
 * `toast.warning`, `toast.info`, `toast.loading` (which stays until it is replaced or dismissed,
 * since its duration is infinite by default) and `toast.message` (the same as calling `toast`) set
 * the look. `toast.promise(promise, { loading, success, error })` shows a loading toast that becomes
 * a success or an error toast when the promise settles, and returns the `id` and `unwrap()`.
 * `toast.add({ title, type, actionProps })` offers the object-style API; `toast.close(id?)` aliases
 * `toast.dismiss(id?)`, closing one toast or all of them without an id. Calling a variant again with
 * the `id` of an open toast updates that toast.
 *
 * Calls wait until a `Toaster` on the store is mounted (see {@link createToaster}) and do nothing on
 * the server. Keyboard and ARIA: see {@link Toaster}.
 *
 * shadcn/ui differences: the API is the toast function itself, not a `{ toasts, toast, dismiss }`
 * object, and there is no global store: each `Toaster` shows the toasts of its own store.
 *
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { createToaster, useToast } from "@/components/ui/toast";
 *
 * // Module-level code has no component to call useToast() from: it uses a store of its own.
 * export const notifications = createToaster();
 *
 * export function saveDraft(): void {
 *   notifications.toast.success("Draft saved");
 * }
 *
 * // Inside a component, useToast() returns the toast API of the nearest Toaster.
 * export function SaveButton() {
 *   const toast = useToast();
 *   return (
 *     <Button
 *       onClick={() => {
 *         toast("Event created", { description: "Friday at 5:00 PM" });
 *         toast.promise(Promise.resolve("saved"), {
 *           loading: "Saving...",
 *           success: "Saved",
 *           error: "Could not save",
 *         });
 *       }}
 *     >
 *       Save
 *     </Button>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link useToast}
 * @see {@link createToaster}
 * @see {@link Toaster}
 */
export interface ToastApi {
  /** Shows a toast with the default look and returns its id. */
  (message: JsxChild, options?: ExternalToast): string;
  /** Shows or updates an object-style toast and returns its id. */
  add(options: ToastAddOptions): string;
  /** Closes a toast by id, or all toasts when omitted. Same behavior as `dismiss`. */
  close(id?: string | number): void;
  /** The same as calling the toast function. */
  message(message: JsxChild, options?: ExternalToast): string;
  /** Shows a toast with a status icon for success. */
  success(message: JsxChild, options?: ExternalToast): string;
  /** Shows a toast with a status icon for an error. Errors are announced assertively. */
  error(message: JsxChild, options?: ExternalToast): string;
  /** Shows a toast with a status icon for a warning. Warnings are announced assertively. */
  warning(message: JsxChild, options?: ExternalToast): string;
  /** Shows a toast with a status icon for information. */
  info(message: JsxChild, options?: ExternalToast): string;
  /** Shows a spinning toast that stays until it is replaced or dismissed. */
  loading(message: JsxChild, options?: ExternalToast): string;
  /**
   * Shows a loading toast that becomes a success or an error toast when `promise` settles. A
   * rejection still reaches whoever awaits `unwrap()`.
   */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    data: ToastPromiseData<T>,
    options?: ExternalToast,
  ): ToastPromiseResult<T>;
  /** Closes the toast with this id, or every toast without an id. */
  dismiss(id?: string | number): void;
}

/**
 * A toast store: the {@link ToastApi} it serves, and the queue it feeds. Each store has its own
 * pending calls and id counter, so stores do not see each other. Made by {@link createToaster}; a
 * {@link Toaster} shows the store it is given with `store`, or one it makes itself.
 * @since 1.0.0
 * @see {@link createToaster}
 */
export interface ToastStore {
  /** The toast API of this store. Calls on it wait until a `Toaster` on the store mounts. */
  readonly toast: ToastApi;
  /**
   * Connects a mounted `Toaster`'s queue to this store, runs the calls that waited for one, and
   * returns the function that disconnects it on unmount. Calls made while no queue is connected
   * wait, at most 16 of them.
   *
   * Used by {@link Toaster}; applications do not call it.
   *
   * @internal
   * @param queue The queue a `Toaster` renders.
   * @returns The function that disconnects `queue` again.
   */
  attach(queue: Queue): () => void;
}

/** Errors and warnings interrupt the screen reader; everything else waits for a pause. */
function announcement(variant: ToastVariant, important: boolean | undefined): ToastType {
  return important === true || variant === "error" || variant === "warning"
    ? "foreground"
    : "background";
}

function dataOf(variant: ToastVariant, options: ExternalToast): ToastData {
  const props = options.actionProps;
  const action = (): ToastAction | undefined => {
    if (options.action !== undefined || props === undefined) return options.action;
    const [own, rest] = splitProps(props, ["children", "onClick", "altText"]);
    return { label: own.children, onClick: own.onClick, altText: own.altText, buttonProps: rest };
  };
  return {
    variant,
    action: action(),
    cancel: options.cancel,
    icon: options.icon,
    closeButton: options.closeButton,
    class: options.class,
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
  };
}

function patchOf(
  variant: ToastVariant,
  content: ToastPromiseContent,
  fallbackDescription: JsxChild | undefined,
): ToastPatch<ToastData> {
  const own: ExternalToast & { readonly message?: JsxChild } =
    typeof content === "object" ? content : {};
  const message = typeof content === "object" ? content.message : content;
  return {
    title: message,
    description: own.description ?? fallbackDescription,
    type: announcement(variant, own.important),
    data: dataOf(variant, own),
    duration: own.duration,
  };
}

/**
 * Makes a toast store: a {@link ToastApi} and the queue it feeds, with its own pending calls and
 * id counter. A `Toaster` shows the toasts of the store it is given with `store`, or of one it makes
 * itself. Calls on a store wait until a `Toaster` on that store mounts (at most 16, the oldest
 * dropped first), and when that `Toaster` unmounts the store waits again. Ids count per store, so
 * the first toast of every new store is `toast-1`.
 *
 * Use a store for module-level code, which has no component to call {@link useToast} from: create
 * it once, render a `Toaster` with `store={...}`, and call `store.toast` from anywhere. Inside a
 * component, use {@link useToast}. Calls do nothing on the server, and a store made at module level
 * is shared by everything that imports it, so keep one per request where a server renders it.
 *
 * Keyboard and ARIA: see {@link Toaster}.
 *
 * @returns The store: its `toast` and the internal `attach`.
 * @example
 * ```tsx
 * import { createToaster, Toaster } from "@/components/ui/toast";
 *
 * export const notifications = createToaster();
 *
 * export function saveDraft(): void {
 *   notifications.toast.success("Draft saved");
 * }
 *
 * export function App() {
 *   return <Toaster store={notifications} richColors />;
 * }
 * ```
 * @since 1.0.0
 * @see {@link useToast}
 * @see {@link Toaster}
 */
function createToaster(): ToastStore {
  let attached: Queue | undefined;
  const pending: ((queue: Queue) => void)[] = [];
  let counter = 0;

  function attach(queue: Queue): () => void {
    attached = queue;
    for (const run of pending.splice(0)) run(queue);
    return () => {
      if (attached === queue) attached = undefined;
    };
  }

  function dispatch(run: (queue: Queue) => void): void {
    if (isServer || typeof document === "undefined") return;
    if (attached !== undefined) {
      run(attached);
      return;
    }
    if (pending.length >= MAX_PENDING) pending.shift();
    pending.push(run);
  }

  function nextId(): string {
    counter += 1;
    return `toast-${counter}`;
  }

  function show(variant: ToastVariant, message: JsxChild, options: ExternalToast = {}): string {
    const id = options.id === undefined ? nextId() : String(options.id);
    dispatch((queue) => {
      queue.add({
        id,
        title: message,
        description: options.description,
        type: announcement(variant, options.important),
        duration:
          options.duration ?? (variant === "loading" ? Number.POSITIVE_INFINITY : undefined),
        data: dataOf(variant, options),
      });
    });
    return id;
  }

  function track<T>(
    source: Promise<T> | (() => Promise<T>),
    data: ToastPromiseData<T>,
    options: ExternalToast = {},
  ): ToastPromiseResult<T> {
    const result = typeof source === "function" ? source() : source;
    const id = options.id === undefined ? nextId() : String(options.id);
    const description = data.description;
    const finish = (): void => data.finally?.();
    dispatch((queue) => {
      queue.promise(
        result,
        {
          loading: patchOf("loading", data.loading, description),
          success: (value) =>
            patchOf(
              "success",
              typeof data.success === "function" ? data.success(value) : data.success,
              description,
            ),
          error: (reason) =>
            patchOf(
              "error",
              typeof data.error === "function" ? data.error(reason) : data.error,
              description,
            ),
        },
        { id, duration: options.duration },
      );
    });
    if (attached === undefined && !isServer) {
      // Nobody is watching yet, so a rejection would be reported as unhandled before a `Toaster`
      // mounts and attaches its own handler. `unwrap()` still hands the rejection to the caller.
      result.then(undefined, () => undefined);
    }
    result.then(finish, finish);
    return { id, unwrap: () => result };
  }

  const dismiss = (id?: string | number): void => {
    dispatch((queue) => queue.dismiss(id === undefined ? undefined : String(id)));
  };
  const toast: ToastApi = Object.assign(
    (message: JsxChild, options?: ExternalToast) => show("default", message, options),
    {
      add: (options: ToastAddOptions) => show(options.type ?? "default", options.title, options),
      close: dismiss,
      message: (message: JsxChild, options?: ExternalToast) => show("default", message, options),
      success: (message: JsxChild, options?: ExternalToast) => show("success", message, options),
      error: (message: JsxChild, options?: ExternalToast) => show("error", message, options),
      warning: (message: JsxChild, options?: ExternalToast) => show("warning", message, options),
      info: (message: JsxChild, options?: ExternalToast) => show("info", message, options),
      loading: (message: JsxChild, options?: ExternalToast) => show("loading", message, options),
      promise: track,
      dismiss,
    },
  );

  return { toast, attach };
}

/** Provides the store of the nearest `Toaster` to the components under it. */
const toasterContext = createContext<ToastStore>(undefined, { name: "Toaster" });

/**
 * The toast API of the nearest {@link Toaster}. Call it while a component runs, then use the
 * returned object in its handlers and effects, where the toasts are raised.
 *
 * Keyboard and ARIA: this hook has none of its own. The toasts are announced by the `Toaster`, see
 * {@link Toaster}.
 *
 * shadcn/ui differences: `useToast()` returns the toast function and its variants (`toast.success`,
 * `toast.promise`...), not a `{ toasts, toast, dismiss }` object, and it reads the `Toaster` above
 * the component rather than a global store.
 *
 * @returns The {@link ToastApi} of the nearest `Toaster`'s store.
 * @throws Error `[ui] useToast() must be used inside <Toaster>.` when no `Toaster` is above the
 * component, since there is no list to show its toasts in.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { useToast } from "@/components/ui/toast";
 *
 * export function SaveButton() {
 *   const toast = useToast();
 *   return (
 *     <Button onClick={() => toast.success("Saved", { description: "Your changes are live." })}>
 *       Save
 *     </Button>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Toaster}
 * @see {@link createToaster}
 */
function useToast(): ToastApi {
  let store: ToastStore;
  try {
    store = useContext(toasterContext);
  } catch (error) {
    throw new Error("[ui] useToast() must be used inside <Toaster>.", { cause: error });
  }
  return store.toast;
}

const POSITIONS: Record<ToastPosition, string> = {
  "top-left": "start-0 top-0",
  "top-center": "start-1/2 top-0 -translate-x-1/2 rtl:translate-x-1/2",
  "top-right": "end-0 top-0",
  "bottom-left": "start-0 bottom-0 flex-col-reverse",
  "bottom-center": "start-1/2 bottom-0 -translate-x-1/2 flex-col-reverse rtl:translate-x-1/2",
  "bottom-right": "end-0 bottom-0 flex-col-reverse",
};

/** Slide a little from (and back toward) the screen edge the toasts sit on. */
const EDGE_MOTION = {
  top: "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
  bottom: "data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2",
} as const;

const RICH_COLORS: Record<ToastVariant, string> = {
  default: "",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
  loading: "",
};

/**
 * Props of {@link Toaster}: the attributes of the toast list plus the options below.
 * @since 1.0.0
 * @see {@link Toaster}
 */
export type ToasterProps = Omit<ComponentProps<"ol">, "dir"> & {
  /**
   * Where the toasts appear. `left` and `right` are the inline start and end.
   * @default "bottom-right"
   */
  readonly position?: ToastPosition | undefined;
  /**
   * Tints success, error, warning and info toasts.
   * @default false
   */
  readonly richColors?: boolean | undefined;
  /**
   * Shows a close button on every toast (a toast can set its own).
   * @default false
   */
  readonly closeButton?: boolean | undefined;
  /**
   * Milliseconds before a toast closes itself. A toast can set its own `duration`.
   * @default 4000
   */
  readonly duration?: number | undefined;
  /**
   * How many toasts are shown at once. The rest wait their turn, oldest first. Read when the
   * toaster mounts.
   * @default 3
   */
  readonly visibleToasts?: number | undefined;
  /**
   * Keeps the older toasts at full size. When `false`, they are shrunk until the list is hovered or
   * focused.
   * @default false
   */
  readonly expand?: boolean | undefined;
  /**
   * `"dark"` forces the dark tokens on the toasts. `"light"` and `"system"` follow the page.
   */
  readonly theme?: "light" | "dark" | "system" | undefined;
  /**
   * The keys that move focus into the list, as `KeyboardEvent.code` values or modifier names
   * (`"altKey"`, `"ctrlKey"`, `"shiftKey"`, `"metaKey"`). All of them must be down.
   * @default ["altKey", "KeyT"]
   */
  readonly hotkey?: readonly string[] | undefined;
  /**
   * The accessible name of the list. The hotkey is appended to it.
   * @default "Notifications"
   */
  readonly label?: string | undefined;
  /**
   * The reading direction of the list. Left and right swap in `"rtl"`. Without it, a
   * `DirectionProvider` above the toaster, else the document's direction, is used. The toaster is an
   * app-level list in a portal, so a `dir` on a wrapper around it is not read: set this prop, or put
   * `dir` on the document.
   */
  readonly dir?: "ltr" | "rtl" | undefined;
  /**
   * Options applied to every toast. Its `class` is added to each toast.
   */
  readonly toastOptions?: { readonly class?: string | undefined } | undefined;
  /**
   * The store whose toasts this toaster shows, from {@link createToaster}. Read when the toaster
   * mounts. Without one, the toaster makes a store of its own, which its children reach with
   * {@link useToast}.
   */
  readonly store?: ToastStore | undefined;
};

/**
 * The list that shows the toasts of a store. Mount one `Toaster` near the root of the application;
 * the components under it raise toasts with {@link useToast}. Each toast has a message, an optional
 * description, a status icon for its variant, and optional action and cancel buttons. A toast closes
 * itself after `duration` (4 seconds by default), and the countdown pauses while the list is hovered
 * or focused. The list sits in the bottom-right corner by default. A toast can be swiped away toward
 * the nearest screen edge.
 *
 * The children render inside the toaster, before the list, and they can call {@link useToast}. A
 * toaster without a `store` makes one of its own, so separate toasters do not share toasts or ids. A
 * `store` from {@link createToaster} lets module-level code raise toasts on this toaster.
 *
 * Keyboard and ARIA: the list is a `role="region"` named by `label` (default "Notifications"), with
 * the hotkey appended. Press the hotkey (Alt+T by default; set `hotkey` to change it) to move focus
 * into the list, then Tab walks through the toasts. Escape closes the focused toast, which counts as
 * a dismissal. Each close button is named "Close toast", and an action button is announced by its
 * `altText` (its label when the label is text). The text of a toast is read once when it appears.
 * Errors and warnings are announced assertively, and the other variants politely. A toast raised with
 * `important` is announced assertively too.
 *
 * shadcn/ui differences: there is no global store and no `toast` import. Raise toasts with
 * {@link useToast} in components, or with the `toast` of a {@link createToaster} store in module code.
 *
 * @param props - The props, see {@link ToasterProps}.
 * @returns The children, then the list of toasts in a region.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { Toaster, useToast } from "@/components/ui/toast";
 *
 * function SaveButton() {
 *   const toast = useToast();
 *   return <Button onClick={() => toast.success("Saved")}>Save</Button>;
 * }
 *
 * export function App() {
 *   return (
 *     <Toaster richColors closeButton position="top-center">
 *       <SaveButton />
 *     </Toaster>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link useToast}
 * @see {@link createToaster}
 */
function Toaster(props: ToasterProps): JSX.Element {
  const t = useUiStrings();
  const [local, rest] = splitProps(props, [
    "class",
    "position",
    "richColors",
    "closeButton",
    "duration",
    "visibleToasts",
    "expand",
    "theme",
    "hotkey",
    "label",
    "dir",
    "toastOptions",
    "store",
    "children",
  ]);
  // The store and the queue are read once, when the toaster mounts: a toaster keeps what it mounted with.
  const store: ToastStore = untrack(() => local.store) ?? createToaster();
  const queue: Queue = createQueue<ToastData>({
    limit: untrack(() => local.visibleToasts) ?? 3,
    order: "newest-first",
  });
  onMount(() => store.attach(queue));
  const direction = useDirection(() => local.dir);
  const position = (): ToastPosition => local.position ?? "bottom-right";
  const swipeDirection = (): SwipeDirection => {
    const place = position();
    if (place.endsWith("center")) return place.startsWith("top") ? "up" : "down";
    // `left` and `right` name the inline start and end: in right-to-left text the start is on the right.
    return place.endsWith("left") === (direction() === "ltr") ? "left" : "right";
  };
  return (
    <toasterContext.Provider value={store}>
      {local.children}
      <ToastPrimitive.Provider
        label={local.label ?? t("toast.notifications", "Notifications")}
        duration={local.duration ?? 4000}
        swipeDirection={swipeDirection()}
      >
        <ToastPrimitive.Viewport
          data-slot="toaster"
          data-position={position()}
          data-expanded={local.expand === true ? "true" : "false"}
          dir={direction()}
          hotkey={local.hotkey ?? ["altKey", "KeyT"]}
          class={cn(
            "group/toaster pointer-events-none fixed z-[100] flex max-h-screen w-full max-w-[392px] flex-col gap-2 p-4",
            POSITIONS[position()],
            local.theme === "dark" && "dark",
            local.class,
          )}
          {...rest}
        >
          <For each={queue.toasts()} key={(item: ToastItem<ToastData>) => item.id}>
            {(item: Accessor<ToastItem<ToastData>>) => (
              <ToastView
                item={item}
                queue={queue}
                position={position}
                richColors={() => local.richColors === true}
                closeButton={() => local.closeButton === true}
                class={() => local.toastOptions?.class}
              />
            )}
          </For>
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Provider>
    </toasterContext.Provider>
  );
}

const NO_DATA: ToastData = {
  variant: "default",
  action: undefined,
  cancel: undefined,
  icon: undefined,
  closeButton: undefined,
  class: undefined,
  onDismiss: undefined,
  onAutoClose: undefined,
};

interface ToastViewProps {
  readonly item: Accessor<ToastItem<ToastData>>;
  readonly queue: Queue;
  readonly position: Accessor<ToastPosition>;
  readonly richColors: Accessor<boolean>;
  readonly closeButton: Accessor<boolean>;
  readonly class: Accessor<string | undefined>;
}

/** One toast of the list: the primitive's element with the look, icon, buttons and callbacks. */
function ToastView(props: ToastViewProps): JSX.Element {
  const t = useUiStrings();
  const data = (): ToastData => props.item().data ?? NO_DATA;
  const summary = (): ToastSummary => ({
    id: props.item().id,
    title: props.item().title,
    description: props.item().description,
    variant: data().variant,
  });
  // Who closes the toast decides which callback runs: the handlers below name the intent just
  // before the primitive closes it, anything else is the timer.
  let intent: "user" | "silent" | undefined;
  let settled = false;
  const settle = (how: "auto" | "user" | "silent"): void => {
    if (settled) return;
    settled = true;
    const current = summary();
    if (how === "auto") data().onAutoClose?.(current);
    else if (how === "user") data().onDismiss?.(current);
  };
  // `toast.dismiss()` closes the toast from outside, without the primitive asking.
  useEffect(() => {
    if (!props.item().open) untrack(() => settle("user"));
  });
  const edge = (): "top" | "bottom" => (props.position().startsWith("top") ? "top" : "bottom");
  const showClose = (): boolean => data().closeButton ?? props.closeButton();
  return (
    <ToastPrimitive
      data-slot="toast"
      data-variant={data().variant}
      open={props.item().open}
      duration={props.item().duration}
      type={props.item().type}
      onOpenChange={(open: boolean) => {
        if (open) return;
        settle(intent ?? "auto");
        props.queue.dismiss(props.item().id);
      }}
      onEscapeKeyDown={() => {
        intent = "user";
      }}
      onSwipeEnd={() => {
        intent = "user";
      }}
      onExitComplete={() => props.queue.remove(props.item().id)}
      class={cn(
        "group/toast pointer-events-auto relative flex w-full items-center gap-3 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg transition-[scale,opacity] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none forced-colors:border-[CanvasText] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform data-[swipe=end]:translate-x-(--primitives-toast-swipe-end-x) data-[swipe=end]:translate-y-(--primitives-toast-swipe-end-y) data-[swipe=move]:translate-x-(--primitives-toast-swipe-move-x) data-[swipe=move]:translate-y-(--primitives-toast-swipe-move-y) data-[swipe=move]:transition-none",
        "group-data-[expanded=false]/toaster:not-first:scale-[0.97] group-data-[expanded=false]/toaster:not-first:opacity-80 group-focus-within/toaster:scale-100 group-focus-within/toaster:opacity-100 group-hover/toaster:scale-100 group-hover/toaster:opacity-100",
        EDGE_MOTION[edge()],
        props.richColors() && RICH_COLORS[data().variant],
        props.class(),
        data().class,
      )}
    >
      <Show when={data().icon !== undefined || data().variant !== "default"}>
        <div data-slot="toast-icon" class="flex shrink-0 items-center [&_svg]:size-4">
          <Show when={data().icon === undefined} fallback={data().icon}>
            <VariantIcon variant={data().variant} />
          </Show>
        </div>
      </Show>
      <div data-slot="toast-content" class="grid flex-1 gap-0.5">
        <ToastPrimitive.Title data-slot="toast-title" class="leading-snug font-medium">
          {props.item().title}
        </ToastPrimitive.Title>
        <Show when={props.item().description !== undefined}>
          <ToastPrimitive.Description
            data-slot="toast-description"
            class={cn(
              "leading-snug",
              props.richColors() && data().variant !== "default"
                ? "opacity-80"
                : "text-muted-foreground",
            )}
          >
            {props.item().description}
          </ToastPrimitive.Description>
        </Show>
      </div>
      <Show when={data().action}>
        {(action) => (
          <ToastPrimitive.Action
            data-slot="toast-action"
            altText={
              action().altText ??
              (typeof action().label === "string"
                ? String(action().label)
                : t("toast.action", "Action"))
            }
            {...action().buttonProps}
            class={cn(buttonVariants({ size: "sm" }), action().buttonProps?.class)}
            onClick={(event: MouseEvent) => {
              intent = "silent";
              action().onClick?.(event);
              if (event.defaultPrevented) intent = undefined;
            }}
          >
            {action().label}
          </ToastPrimitive.Action>
        )}
      </Show>
      <Show when={data().cancel}>
        {(cancel) => (
          <ToastPrimitive.Close
            data-slot="toast-cancel"
            class={buttonVariants({ variant: "secondary", size: "sm" })}
            onClick={(event: MouseEvent) => {
              intent = "silent";
              cancel().onClick?.(event);
              if (event.defaultPrevented) intent = undefined;
            }}
          >
            {cancel().label}
          </ToastPrimitive.Close>
        )}
      </Show>
      <Show when={showClose()}>
        <ToastPrimitive.Close
          data-slot="toast-close"
          aria-label={t("toast.close", "Close toast")}
          class="absolute -start-2 -top-2 flex size-5 items-center justify-center rounded-full border bg-popover text-popover-foreground opacity-0 shadow-xs transition-opacity group-focus-within/toast:opacity-100 group-hover/toast:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none forced-colors:opacity-100 [&_svg]:size-3 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent"
          onClick={() => {
            intent = "user";
          }}
        >
          <XIcon />
        </ToastPrimitive.Close>
      </Show>
    </ToastPrimitive>
  );
}

/** The status icon of a variant. */
function VariantIcon(props: { readonly variant: ToastVariant }): JSX.Element {
  return (
    <>
      <Show when={props.variant === "success"}>
        <CircleCheckIcon />
      </Show>
      <Show when={props.variant === "error"}>
        <CircleXIcon />
      </Show>
      <Show when={props.variant === "warning"}>
        <TriangleAlertIcon />
      </Show>
      <Show when={props.variant === "info"}>
        <InfoIcon />
      </Show>
      <Show when={props.variant === "loading"}>
        <LoaderIcon class="animate-spin motion-reduce:animate-none" />
      </Show>
    </>
  );
}

export { createToaster, Toaster, useToast };
