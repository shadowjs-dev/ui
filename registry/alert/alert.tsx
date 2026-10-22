import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The class list of an alert for each `variant`. Use it to style another element like an alert.
 *
 * @example
 * ```tsx
 * import { alertVariants } from "@/components/ui/alert";
 *
 * export function AlertBox() {
 *   return <section class={alertVariants({ variant: "destructive" })}>Payment failed.</section>;
 * }
 * ```
 * @since 1.0.0
 * @see {@link Alert}
 */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border bg-card px-4 py-3 text-sm text-card-foreground has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "text-destructive *:data-[slot=alert-description]:text-destructive [&>svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Props of {@link Alert}: the attributes of a `div` plus `variant`. The `variant` is `"default"`
 * (the default) or `"destructive"`, which colors the text red. The rest are the element's
 * attributes; `class` is merged with the variant classes.
 * @since 1.0.0
 * @see {@link Alert}
 */
export type AlertProps = ComponentProps<"div"> & VariantProps<typeof alertVariants>;

/**
 * A callout that draws attention to a message. It has `role="alert"`, which screen readers
 * announce when it appears, so render it only for messages that deserve an interruption. Put an
 * optional icon first, then {@link AlertTitle} and {@link AlertDescription}.
 *
 * Keyboard and ARIA: the alert is not interactive, so it has no keys. It has `role="alert"` and no
 * accessible name, because its text is the message. Place the message text in the alert itself
 * (the title and description), not in an attribute.
 *
 * Compared with shadcn/ui: `class` replaces `className`, and every part carries `data-slot`.
 *
 * @param props - The alert props: `variant` (`"default"` or `"destructive"`), `children`, and the
 * `div` attributes.
 * @returns The alert element.
 * @example
 * ```tsx
 * import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
 * import { TriangleAlertIcon } from "@/components/ui/icons";
 *
 * export function SessionWarning() {
 *   return (
 *     <Alert variant="destructive">
 *       <TriangleAlertIcon />
 *       <AlertTitle>Error</AlertTitle>
 *       <AlertDescription>Your session has expired.</AlertDescription>
 *     </Alert>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link AlertTitle}
 * @see {@link AlertDescription}
 * @see {@link AlertProps}
 */
function Alert(props: AlertProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "variant", "children"]);
  return (
    <div
      data-slot="alert"
      role="alert"
      class={cn(alertVariants({ variant: local.variant }), local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * The title of an alert: a short, medium-weight line in the second column, next to the icon.
 *
 * @param props - The title props: `children` and the `div` attributes.
 * @returns The title element.
 * @example
 * ```tsx
 * import { Alert, AlertTitle } from "@/components/ui/alert";
 *
 * export function Heads() {
 *   return (
 *     <Alert>
 *       <AlertTitle>Heads up!</AlertTitle>
 *     </Alert>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Alert}
 */
function AlertTitle(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="alert-title"
      class={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * The body text of an alert, placed under the title in the second column. Paragraphs inside it
 * get relaxed line height.
 *
 * @param props - The description props: `children` and the `div` attributes.
 * @returns The description element.
 * @example
 * ```tsx
 * import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
 *
 * export function Tip() {
 *   return (
 *     <Alert>
 *       <AlertTitle>Tip</AlertTitle>
 *       <AlertDescription>You can add components to your app.</AlertDescription>
 *     </Alert>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Alert}
 */
function AlertDescription(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="alert-description"
      class={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * A slot in the top-end corner of an alert, for a short action such as a button or a link. It is
 * positioned over the alert, so keep its title short enough to leave room for it.
 *
 * Keyboard and ARIA: it adds no role and no keys; the action inside it is the focusable control.
 *
 * @param props - The action props: `children` and the `div` attributes.
 * @returns The action element.
 * @example
 * ```tsx
 * import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
 *
 * export function Update() {
 *   return (
 *     <Alert>
 *       <AlertTitle>Update available</AlertTitle>
 *       <AlertDescription>Restart to apply it.</AlertDescription>
 *       <AlertAction>
 *         <button type="button">Restart</button>
 *       </AlertAction>
 *     </Alert>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Alert}
 */
function AlertAction(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div data-slot="alert-action" class={cn("absolute end-2 top-2", local.class)} {...rest}>
      {local.children}
    </div>
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
