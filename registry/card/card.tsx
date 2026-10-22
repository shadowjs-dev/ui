import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * Props of {@link Card}: the `div` attributes, and `size` (`"default"` or `"sm"`).
 * @since 1.0.0
 * @see {@link Card}
 */
export type CardProps = ComponentProps<"div"> & {
  /** `"sm"` tightens the gap, the vertical padding and the side padding of the parts. */
  readonly size?: "default" | "sm" | undefined;
};

/**
 * A surface that groups related content, with a border, rounded corners and a shadow. Compose it
 * from {@link CardHeader} (with {@link CardTitle}, {@link CardDescription} and an optional
 * {@link CardAction}), {@link CardContent} and {@link CardFooter}.
 *
 * Keyboard and ARIA: the card is a plain `div` with no role and no keys. When it is a region of its
 * own, give it `role="region"` and an `aria-labelledby` that points at the {@link CardTitle}.
 *
 * Compared with shadcn/ui: `class` replaces `className`, and every part carries a `data-slot`.
 *
 * @param props - The card props: `size` (`"default"` or `"sm"`, which tightens the gap and padding),
 * `children`, `class`, and the `div` attributes.
 * @returns The card element.
 * @example
 * ```tsx
 * import {
 *   Card,
 *   CardContent,
 *   CardDescription,
 *   CardHeader,
 *   CardTitle,
 * } from "@/components/ui/card";
 *
 * export function Notifications() {
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Notifications</CardTitle>
 *         <CardDescription>You have 3 unread messages.</CardDescription>
 *       </CardHeader>
 *       <CardContent>Your latest messages appear here.</CardContent>
 *     </Card>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CardHeader}
 * @see {@link CardContent}
 * @see {@link CardFooter}
 */
function Card(props: CardProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children", "size"]);
  return (
    <div
      data-slot="card"
      data-size={local.size ?? "default"}
      class={cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm [--card-padding-x:1.5rem] data-[size=sm]:gap-4 data-[size=sm]:py-4 data-[size=sm]:[--card-padding-x:1rem]",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * The top of a card: the title and description, with an optional {@link CardAction} in the
 * corner. When a card action is inside, the title takes the first column and the action the second.
 *
 * @param props - The header props: `children`, `class`, and the `div` attributes.
 * @returns The header element.
 * @example
 * ```tsx
 * import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
 * import { Button } from "@/components/ui/button";
 *
 * export function ProjectHeader() {
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Create project</CardTitle>
 *         <CardAction>
 *           <Button size="sm">Edit</Button>
 *         </CardAction>
 *       </CardHeader>
 *     </Card>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Card}
 * @see {@link CardTitle}
 */
function CardHeader(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="card-header"
      class={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-[var(--card-padding-x,1.5rem)] has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * The title of a card: a semibold line. It renders a `div`, so it has no heading role. Pass
 * `role="heading"` and `aria-level` when the title should be a heading in the page outline.
 *
 * @param props - The title props: `children`, `class`, and the `div` attributes.
 * @returns The title element.
 * @example
 * ```tsx
 * import { Card, CardHeader, CardTitle } from "@/components/ui/card";
 *
 * export function Titled() {
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle role="heading" aria-level={2}>
 *           Create project
 *         </CardTitle>
 *       </CardHeader>
 *     </Card>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CardHeader}
 * @see {@link CardDescription}
 */
function CardTitle(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div data-slot="card-title" class={cn("leading-none font-semibold", local.class)} {...rest}>
      {local.children}
    </div>
  );
}

/**
 * The muted description under the title. It renders a `div` with the muted text color.
 *
 * @param props - The description props: `children`, `class`, and the `div` attributes.
 * @returns The description element.
 * @example
 * ```tsx
 * import {
 *   Card,
 *   CardDescription,
 *   CardHeader,
 *   CardTitle,
 * } from "@/components/ui/card";
 *
 * export function DeployCard() {
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Deploy</CardTitle>
 *         <CardDescription>Deploy your new project in one click.</CardDescription>
 *       </CardHeader>
 *     </Card>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CardHeader}
 * @see {@link CardTitle}
 */
function CardDescription(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="card-description"
      class={cn("text-sm text-muted-foreground", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * An action, such as a button or a menu, placed at the end of the header beside the title. The
 * {@link CardHeader} makes room for it when it is present.
 *
 * @param props - The action props: `children`, `class`, and the `div` attributes.
 * @returns The action element.
 * @example
 * ```tsx
 * import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
 * import { Button } from "@/components/ui/button";
 *
 * export function EditableCard() {
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Profile</CardTitle>
 *         <CardAction>
 *           <Button size="sm" variant="outline">Edit</Button>
 *         </CardAction>
 *       </CardHeader>
 *     </Card>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CardHeader}
 */
function CardAction(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="card-action"
      class={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * The main content of a card, with horizontal padding.
 *
 * @param props - The content props: `children`, `class`, and the `div` attributes.
 * @returns The content element.
 * @example
 * ```tsx
 * import { Card, CardContent } from "@/components/ui/card";
 *
 * export function Body() {
 *   return (
 *     <Card>
 *       <CardContent>
 *         <p>Your latest messages appear here.</p>
 *       </CardContent>
 *     </Card>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Card}
 * @see {@link CardFooter}
 */
function CardContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="card-content"
      class={cn("px-[var(--card-padding-x,1.5rem)]", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}

/**
 * The bottom of a card, usually one or more buttons in a row. It is a flex row, centered
 * vertically.
 *
 * @param props - The footer props: `children`, `class`, and the `div` attributes.
 * @returns The footer element.
 * @example
 * ```tsx
 * import { Button } from "@/components/ui/button";
 * import { Card, CardContent, CardFooter } from "@/components/ui/card";
 *
 * export function SaveCard() {
 *   return (
 *     <Card>
 *       <CardContent>Unsaved changes.</CardContent>
 *       <CardFooter>
 *         <Button>Save</Button>
 *       </CardFooter>
 *     </Card>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Card}
 * @see {@link CardContent}
 */
function CardFooter(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="card-footer"
      class={cn(
        "flex items-center px-[var(--card-padding-x,1.5rem)] [.border-t]:pt-6",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
