import { type Accessor, splitProps } from "@shadow-js/core";
import {
  createPartContext,
  Label as LabelPrimitive,
  partId,
  useBaseId,
  usePartRegistration,
} from "@shadow-js/primitives";
import { type ComponentProps, For, type JSX, Show } from "@shadow-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** What a field shares with its label, description, error and control. @internal */
interface FieldContextValue {
  readonly controlId: () => string;
  readonly description: ReturnType<typeof usePartRegistration>;
  readonly error: ReturnType<typeof usePartRegistration>;
  readonly invalid: () => boolean;
  readonly disabled: () => boolean;
  readonly descriptionId: () => string;
  readonly errorId: () => string;
}

const fieldContext = createPartContext<FieldContextValue>("Field");

const fieldVariants = cva("group/field flex w-full gap-3 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col [&>*]:w-full",
      horizontal: "flex-row items-center [&>[data-slot=field-label]]:flex-auto",
      responsive: "flex-col sm:flex-row sm:items-center [&>[data-slot=field-label]]:sm:flex-auto",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

/**
 * Props of {@link Field}: the attributes of the rendered `div`, `orientation` (`"vertical"`,
 * `"horizontal"` or `"responsive"`), and the state of the entry.
 * @see {@link Field}
 * @since 1.0.0
 */
export type FieldProps = ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    /**
     * Marks the entry invalid: the label and the error take the destructive color, and the control
     * gets `aria-invalid` from {@link useField}.
     * @default false
     */
    readonly invalid?: boolean | undefined;
    /**
     * Disables the entry's label and description, and the control through {@link useField}.
     * @default false
     */
    readonly disabled?: boolean | undefined;
    /**
     * The id of the control. The label points at it. Generated when omitted.
     * @default generated
     */
    readonly controlId?: string | undefined;
  };

type Loose = { readonly class?: unknown; readonly [prop: string]: unknown };

/**
 * A form entry: the layout of a label, a control, a description and an error. The label points at the
 * control, and the control describes itself with the description and the error while they are shown.
 * That wiring is done by the control, which reads {@link useField}.
 *
 * Keyboard and ARIA: the field is a `div` with `role="group"` and no keys of its own. The label is a
 * `label` whose `for` is the control's id. The control gets its `id`, `aria-describedby` (the
 * description and the error, only while they are rendered), `aria-invalid` and `disabled` from
 * {@link useField}. The control is named by its label: the label's `for` is the control's id. The error
 * has `role="alert"`, so a screen reader announces it when it appears.
 *
 * shadcn/ui differences: the prop is `class`, not `className`, and every part has a `data-slot`. The control
 * gets its ids and state from {@link useField}, which returns values to set on the control.
 *
 * @param props The field props: see {@link FieldProps}.
 * @returns A `div` with `role="group"`.
 * @example
 * import { Field, FieldDescription, FieldLabel, useField } from "@/components/ui/field";
 * import { Input } from "@/components/ui/input";
 *
 * function EmailControl() {
 *   const field = useField();
 *   return (
 *     <Input
 *       id={field.id()}
 *       type="email"
 *       aria-describedby={field.describedBy()}
 *       aria-invalid={field.invalid() ? true : undefined}
 *       disabled={field.disabled()}
 *     />
 *   );
 * }
 *
 * export function EmailField() {
 *   return (
 *     <Field>
 *       <FieldLabel>Email</FieldLabel>
 *       <EmailControl />
 *       <FieldDescription>We never share it.</FieldDescription>
 *     </Field>
 *   );
 * }
 * @see {@link useField}
 * @see {@link FieldLabel}
 * @since 1.0.0
 */
function Field(props: FieldProps): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose & FieldProps, [
    "class",
    "orientation",
    "invalid",
    "disabled",
    "controlId",
  ]);
  const base = useBaseId(() => local.controlId as string | undefined);
  const description = usePartRegistration();
  const error = usePartRegistration();
  const context: FieldContextValue = {
    // The application's controlId is the control's id as given; the generated one derives from the base.
    controlId: () => (local.controlId as string | undefined) ?? partId(base(), "control"),
    description,
    error,
    invalid: () => local.invalid === true,
    disabled: () => local.disabled === true,
    descriptionId: () => partId(base(), "description"),
    errorId: () => partId(base(), "error"),
  };
  return (
    <fieldContext.Provider value={context}>
      <div
        role="group"
        data-slot="field"
        data-invalid={local.invalid === true ? "true" : undefined}
        data-disabled={local.disabled === true ? "true" : undefined}
        data-orientation={(local.orientation as string | undefined) ?? "vertical"}
        class={cn(
          fieldVariants({
            orientation: local.orientation as "vertical" | "horizontal" | "responsive" | undefined,
          }),
          local.class as string | undefined,
        )}
        {...rest}
      />
    </fieldContext.Provider>
  );
}

/**
 * The id and state of the control of the enclosing {@link Field}, as accessors. Read them in the
 * control's JSX so the attributes stay current. `describedBy` lists the description and the error only
 * while they are rendered. Call it inside a `Field`, in the component that renders the control.
 *
 * @returns The accessors: `id`, `describedBy`, `invalid` and `disabled`.
 * @throws Error when called outside a {@link Field}.
 * @example
 * import { Field, FieldLabel, useField } from "@/components/ui/field";
 * import { Input } from "@/components/ui/input";
 *
 * function Control() {
 *   const field = useField();
 *   return (
 *     <Input
 *       id={field.id()}
 *       aria-describedby={field.describedBy()}
 *       aria-invalid={field.invalid() ? true : undefined}
 *     />
 *   );
 * }
 *
 * export function NameField() {
 *   return (
 *     <Field>
 *       <FieldLabel>Name</FieldLabel>
 *       <Control />
 *     </Field>
 *   );
 * }
 * @see {@link Field}
 * @since 1.0.0
 */
function useField(): {
  readonly id: () => string;
  readonly describedBy: () => string | undefined;
  readonly invalid: () => boolean;
  readonly disabled: () => boolean;
} {
  const context = fieldContext.use("useField");
  return {
    id: () => context.controlId(),
    describedBy: () => {
      const ids = [
        context.description.present() ? context.descriptionId() : undefined,
        context.error.present() ? context.errorId() : undefined,
      ].filter((id): id is string => id !== undefined);
      return ids.length === 0 ? undefined : ids.join(" ");
    },
    invalid: () => context.invalid(),
    disabled: () => context.disabled(),
  };
}

/**
 * A group of related fields under a {@link FieldLegend}. It is a native `fieldset`, so the browser and
 * assistive technology treat its fields as one group.
 *
 * @param props The set props: the attributes of the rendered `fieldset` and `class`.
 * @returns The fieldset.
 * @example
 * import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
 * import { Input } from "@/components/ui/input";
 *
 * export function Address() {
 *   return (
 *     <FieldSet>
 *       <FieldLegend>Address</FieldLegend>
 *       <FieldGroup>
 *         <Field controlId="street">
 *           <FieldLabel>Street</FieldLabel>
 *           <Input id="street" />
 *         </Field>
 *       </FieldGroup>
 *     </FieldSet>
 *   );
 * }
 * @see {@link FieldLegend}
 * @see {@link FieldGroup}
 * @since 1.0.0
 */
function FieldSet(props: ComponentProps<"fieldset">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <fieldset
      data-slot="field-set"
      class={cn("flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3", local.class)}
      {...rest}
    />
  );
}

/**
 * The legend of a {@link FieldSet}, which names the set. `variant="label"` styles it like a small label,
 * and `variant="legend"` (the default) like a heading.
 *
 * @param props The legend props: the attributes of the rendered `legend`, and `variant`.
 * @returns The legend.
 * @example
 * import { FieldLegend, FieldSet } from "@/components/ui/field";
 *
 * export function Notifications() {
 *   return (
 *     <FieldSet>
 *       <FieldLegend variant="label">Notifications</FieldLegend>
 *     </FieldSet>
 *   );
 * }
 * @see {@link FieldSet}
 * @since 1.0.0
 */
function FieldLegend(
  props: ComponentProps<"legend"> & { readonly variant?: "legend" | "label" | undefined },
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as Loose & { readonly variant?: "legend" | "label" },
    ["class", "variant"],
  );
  return (
    <legend
      data-slot="field-legend"
      data-variant={(local.variant as string | undefined) ?? "legend"}
      class={cn(
        "mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        local.class as string | undefined,
      )}
      {...rest}
    />
  );
}

/**
 * A column of fields with space between them. It has no role.
 *
 * @param props The group props: the attributes of the rendered `div` and `class`.
 * @returns The group.
 * @example
 * import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
 * import { Input } from "@/components/ui/input";
 *
 * export function Contact() {
 *   return (
 *     <FieldGroup>
 *       <Field controlId="email">
 *         <FieldLabel>Email</FieldLabel>
 *         <Input id="email" type="email" />
 *       </Field>
 *     </FieldGroup>
 *   );
 * }
 * @see {@link Field}
 * @since 1.0.0
 */
function FieldGroup(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="field-group"
      class={cn("group/field-group @container/field-group flex w-full flex-col gap-7", local.class)}
      {...rest}
    />
  );
}

/**
 * The text column of a horizontal field: the title, label and description that sit beside the control.
 * It has no role.
 *
 * @param props The content props: the attributes of the rendered `div` and `class`.
 * @returns The text column.
 * @example
 * import { Field, FieldContent, FieldDescription, FieldTitle } from "@/components/ui/field";
 * import { Switch } from "@/components/ui/switch";
 *
 * export function Digest() {
 *   return (
 *     <Field orientation="horizontal">
 *       <FieldContent>
 *         <FieldTitle>Weekly digest</FieldTitle>
 *         <FieldDescription>One email a week.</FieldDescription>
 *       </FieldContent>
 *       <Switch aria-label="Weekly digest" />
 *     </Field>
 *   );
 * }
 * @see {@link Field}
 * @since 1.0.0
 */
function FieldContent(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="field-content"
      class={cn("flex flex-1 flex-col gap-1.5 leading-snug", local.class)}
      {...rest}
    />
  );
}

/**
 * The label of the field's control. It points at the control (its `for` is set from the field, so it
 * overrides a `htmlFor` you pass), and it reads as disabled and invalid with the field.
 *
 * @param props The label props: the attributes of the rendered `label` and `class`.
 * @returns The label.
 * @throws Error when rendered outside a {@link Field}.
 * @example
 * import { Field, FieldLabel } from "@/components/ui/field";
 * import { Input } from "@/components/ui/input";
 *
 * export function NameField() {
 *   return (
 *     <Field controlId="name">
 *       <FieldLabel>Name</FieldLabel>
 *       <Input id="name" />
 *     </Field>
 *   );
 * }
 * @see {@link Field}
 * @see {@link useField}
 * @since 1.0.0
 */
function FieldLabel(props: ComponentProps<"label">): JSX.Element {
  const context = fieldContext.use("FieldLabel");
  const [local, rest] = splitProps(props as unknown as Loose, ["class"]);
  return (
    <LabelPrimitive
      data-slot="field-label"
      class={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none group-data-[disabled=true]/field:opacity-50 peer-disabled:opacity-50 group-data-[invalid=true]/field:text-destructive has-[>[data-slot=field]]:w-full",
        local.class as string | undefined,
      )}
      {...rest}
      htmlFor={context.controlId()}
    />
  );
}

/**
 * The title of a horizontal field: a medium-weight line of text for the whole entry. It is a `div`, so
 * it names nothing by itself; use a {@link FieldLabel} for the control's name.
 *
 * @param props The title props: the attributes of the rendered `div` and `class`.
 * @returns The title.
 * @example
 * import { FieldContent, FieldTitle } from "@/components/ui/field";
 *
 * export const Billing = (
 *   <FieldContent>
 *     <FieldTitle>Billing</FieldTitle>
 *   </FieldContent>
 * );
 * @see {@link FieldContent}
 * @since 1.0.0
 */
function FieldTitle(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="field-title"
      class={cn("flex w-fit items-center gap-2 text-sm leading-snug font-medium", local.class)}
      {...rest}
    />
  );
}

/**
 * A helper text for the control. It has an id, and the control's `aria-describedby` (from
 * {@link useField}) names it while it is rendered, so a screen reader reads it with the control.
 *
 * @param props The description props: the attributes of the rendered `p` and `class`.
 * @returns The paragraph.
 * @throws Error when rendered outside a {@link Field}.
 * @example
 * import { Field, FieldDescription, FieldLabel, useField } from "@/components/ui/field";
 * import { Input } from "@/components/ui/input";
 *
 * function PasswordControl() {
 *   const field = useField();
 *   return <Input id={field.id()} type="password" aria-describedby={field.describedBy()} />;
 * }
 *
 * export function PasswordField() {
 *   return (
 *     <Field>
 *       <FieldLabel>Password</FieldLabel>
 *       <PasswordControl />
 *       <FieldDescription>Use at least 8 characters.</FieldDescription>
 *     </Field>
 *   );
 * }
 * @see {@link useField}
 * @since 1.0.0
 */
function FieldDescription(props: ComponentProps<"p">): JSX.Element {
  const context = fieldContext.use("FieldDescription");
  const [local, rest] = splitProps(props, ["class"]);
  context.description.register();
  return (
    <p
      data-slot="field-description"
      id={context.descriptionId()}
      class={cn(
        "text-sm leading-normal font-normal text-muted-foreground group-has-[>input]/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        local.class,
      )}
      {...rest}
    />
  );
}

/** One error of a validator: any object with a `message`, such as a Standard Schema issue. */
type FieldErrorEntry = { readonly message?: string | undefined } | undefined;

/**
 * Props of {@link FieldError}: the attributes of the rendered `div`, `class`, the `children` (the
 * message, which wins when given), and `errors`, the messages of a validator.
 * @see {@link FieldError}
 * @since 1.0.0
 */
export type FieldErrorProps = ComponentProps<"div"> & {
  /**
   * The errors of a validator. Each entry with a `message` is shown once: one message is text, several
   * are a list. An empty list hides the error. Ignored when `children` is given.
   * @default undefined
   */
  readonly errors?: ReadonlyArray<FieldErrorEntry> | undefined;
};

/**
 * The error of a field. It has `role="alert"`, so it is announced when it appears, and the control's
 * `aria-describedby` (from {@link useField}) names it while it has content. Without children and
 * without messages it is hidden, and the control does not describe itself with it.
 *
 * Keyboard and ARIA: no keys of its own. The `alert` role makes a screen reader announce the message
 * when it appears. With several messages, they are a `ul` of `li` items, so each one is read on its own.
 *
 * @param props The error props: see {@link FieldErrorProps}.
 * @returns The error message, hidden while it has no content.
 * @throws Error when rendered outside a {@link Field}.
 * @example
 * import { Field, FieldError, FieldLabel, useField } from "@/components/ui/field";
 * import { Input } from "@/components/ui/input";
 *
 * function EmailControl() {
 *   const field = useField();
 *   return <Input id={field.id()} aria-describedby={field.describedBy()} aria-invalid={field.invalid() ? true : undefined} />;
 * }
 *
 * export function EmailError() {
 *   return (
 *     <Field invalid>
 *       <FieldLabel>Email</FieldLabel>
 *       <EmailControl />
 *       <FieldError>Enter a valid email.</FieldError>
 *     </Field>
 *   );
 * }
 * @example
 * // The messages of a validator: one line each, once each.
 * <FieldError errors={[{ message: "Too short." }, { message: "No digits." }]} />
 * @see {@link useField}
 * @see {@link FieldErrorProps}
 * @since 1.0.0
 */
function FieldError(props: FieldErrorProps): JSX.Element {
  const context = fieldContext.use("FieldError");
  const [local, rest] = splitProps(props as unknown as Loose & FieldErrorProps, [
    "class",
    "children",
    "errors",
  ]);
  const hasChildren = (): boolean =>
    local.children !== undefined && local.children !== null && local.children !== false;
  // The distinct messages of `errors`, in order. A repeated message is shown once.
  const messages = (): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const entry of (local.errors as ReadonlyArray<FieldErrorEntry> | undefined) ?? []) {
      const message = entry?.message;
      if (message === undefined || message === "" || seen.has(message)) continue;
      seen.add(message);
      out.push(message);
    }
    return out;
  };
  // An error with no content is not an error: it is hidden, and the control does not describe
  // itself with it. The registration sits in a branch, so it follows the content as it appears
  // and clears, not only the content the error had at mount.
  const hasContent = (): boolean => hasChildren() || messages().length > 0;
  return (
    <div
      role="alert"
      data-slot="field-error"
      id={context.errorId()}
      hidden={hasContent() ? undefined : true}
      class={cn("text-sm font-normal text-destructive", local.class as string | undefined)}
      {...rest}
    >
      <Show when={hasContent()}>
        {() => {
          context.error.register();
          return null;
        }}
      </Show>
      <Show
        when={hasChildren()}
        fallback={
          <Show when={messages().length > 1} fallback={messages()[0]}>
            <ul class="ms-4 flex list-disc flex-col gap-1">
              <For each={messages()} key={(message: string) => message}>
                {(message: Accessor<string>) => <li>{message()}</li>}
              </For>
            </ul>
          </Show>
        }
      >
        {local.children}
      </Show>
    </div>
  );
}

/**
 * A divider between parts of a field group, with optional text in its middle, such as "or". It is
 * decorative and has no role.
 *
 * @param props The separator props: the attributes of the rendered `div`, and `children` (the text).
 * @returns The separator.
 * @example
 * import { FieldGroup, FieldSeparator } from "@/components/ui/field";
 *
 * export function Divider() {
 *   return (
 *     <FieldGroup>
 *       <FieldSeparator>or</FieldSeparator>
 *     </FieldGroup>
 *   );
 * }
 * @see {@link FieldGroup}
 * @since 1.0.0
 */
function FieldSeparator(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      data-slot="field-separator"
      class={cn("relative -my-2 h-5 text-sm", local.class)}
      {...rest}
    >
      <div class="absolute inset-0 top-1/2 border-t" />
      {local.children !== undefined && (
        <span class="relative mx-auto block w-fit bg-background px-2 text-muted-foreground">
          {local.children}
        </span>
      )}
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  useField,
};
