import {
  type Accessor,
  onMount,
  splitProps,
  untrack,
  useEffect,
  useMemo,
  useSignal,
} from "@shadow-js/core";
import {
  createPartContext,
  mergeElementProps,
  type PartContext,
  type PartRegistration,
  Polymorphic,
  type PolymorphicProps,
  type PolymorphicTarget,
  partId,
  useBaseId,
  usePartRegistration,
  useRefSignal,
} from "@shadow-js/primitives";
import { type ComponentProps, For, type JSX, Show } from "@shadow-js/web";
import { Label, type LabelProps } from "@/components/ui/label";
import { useUiStrings } from "@/lib/ui-strings";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * A value or an accessor of it. Form libraries hand out either; the form components read both the
 * same way.
 * @since 1.0.0
 * @see {@link FormFieldState}
 */
export type FormFieldSource<T> = T | (() => T);

/**
 * What a field can report as its error: one message, a list (the first is shown), or nothing.
 * @since 1.0.0
 * @see {@link FormFieldState}
 */
export type FormFieldError = string | readonly string[] | null | undefined | false;

/**
 * The state of one field, as any form library or a hand-written object can supply it. Every member
 * is optional: a field without `error` never shows one, without `touched` its error shows as soon
 * as it exists. `value`, `error`, `touched` and `submitted` may each be an accessor (a signal
 * getter) or a plain value; read inside the components, so accessors stay reactive.
 *
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import type { FormFieldState } from "@/components/ui/form";
 *
 * export function useEmailField() {
 *   const [email, setEmail] = useSignal("");
 *   const field: FormFieldState<string> = {
 *     value: email,
 *     error: () => (email().includes("@") ? undefined : "Enter a valid email"),
 *     onInput: (event) => setEmail((event.target as HTMLInputElement).value),
 *   };
 *   return field;
 * }
 * @see {@link FormField}
 * @since 1.0.0
 */
export interface FormFieldState<TValue = unknown> {
  /**
   * The current value of the field.
   * @default none
   */
  readonly value?: FormFieldSource<TValue> | undefined;
  /**
   * The current error, if any: one message, a list of messages (the first one is shown), or nothing.
   * @default none
   */
  readonly error?: FormFieldSource<FormFieldError> | undefined;
  /**
   * Whether the user has interacted with the field. An error is shown only once it is `true`, or once
   * the form was submitted.
   * @default none (an error shows at once)
   */
  readonly touched?: FormFieldSource<boolean | undefined> | undefined;
  /**
   * Whether the form this field belongs to has been submitted. A submit shows every field's error,
   * including a field the user never touched: `submitted: true` shows the error whatever `touched` says.
   * Pass your form library's "was submitted" state; a library that marks every field touched on submit
   * does not need it.
   * @default none
   */
  readonly submitted?: FormFieldSource<boolean | undefined> | undefined;
  /**
   * Called with the `input` event of the control.
   * @default none
   */
  readonly onInput?: ((event: Event) => void) | undefined;
  /**
   * Called with the `blur` event of the control.
   * @default none
   */
  readonly onBlur?: ((event: Event) => void) | undefined;
  /**
   * Called with the `focus` event of the control.
   * @default none
   */
  readonly onFocus?: ((event: Event) => void) | undefined;
  /**
   * Called with the `change` event of a control, for custom parts that listen for it.
   * @default none
   */
  readonly onChange?: ((event: Event) => void) | undefined;
  /**
   * Writes a value, for controls that do not fire `input` events (a select, a checkbox, a date picker
   * built on primitives). {@link FormControl} hands it to `render` as `setValue`.
   * @default none
   */
  setValue?(value: unknown): void;
  /**
   * Called with the control element when it is rendered, so the form library can move focus to it (to the
   * first invalid control after a failed submit). {@link FormControl} calls it for you.
   * @default none
   */
  readonly ref?: ((element: Element | null) => void) | undefined;
  /**
   * Whether the field is disabled. {@link FormControl} then disables its control.
   * @default none
   */
  readonly disabled?: FormFieldSource<boolean | undefined> | undefined;
}

/** Reads a value that may be an accessor. */
function read<T>(source: FormFieldSource<T> | undefined): T | undefined {
  return typeof source === "function" ? (source as () => T)() : source;
}

/** The first message of an error, or `undefined` when there is none. */
function firstMessage(error: FormFieldError): string | undefined {
  if (typeof error === "string") return error === "" ? undefined : error;
  if (Array.isArray(error)) return error.find((message) => message !== "");
  return undefined;
}

/** What the parts under a {@link FormField} read from it. */
interface FormFieldContextValue {
  readonly name: Accessor<string>;
  readonly value: Accessor<unknown>;
  readonly rawError: Accessor<FormFieldError>;
  readonly touched: Accessor<boolean | undefined>;
  readonly submitted: Accessor<boolean | undefined>;
  readonly disabled: Accessor<boolean | undefined>;
  readonly onInput: (event: Event) => void;
  readonly onBlur: (event: Event) => void;
  readonly onFocus: (event: Event) => void;
  readonly onChange: (event: Event) => void;
  readonly setValue: (value: unknown) => void;
  readonly ref: (element: Element | null) => void;
}

/** What the parts under a {@link FormItem} read from it. */
interface FormItemContextValue {
  readonly id: string;
  readonly description: PartRegistration;
  readonly message: PartRegistration;
  /** The label element, kept so the error summary can name the field. */
  readonly setLabel: (element: Element | undefined) => void;
}

/** What a {@link FormItem} tells the {@link Form} about its field, for the error summary. @internal */
interface FormRegistration {
  readonly name: Accessor<string>;
  readonly controlId: string;
  readonly label: Accessor<string | undefined>;
}

/** What the parts under a {@link Form} read from it. @internal */
interface FormRootContextValue {
  readonly form: Accessor<FormApiLike>;
  readonly register: (registration: FormRegistration) => () => void;
  readonly find: (name: string) => FormRegistration | undefined;
  /** Changes whenever a field registers or leaves, so the summary reads the names again. */
  readonly revision: Accessor<number>;
  /** Tells the field messages that a summary announces the errors, so they need not. */
  readonly summary: PartRegistration;
}

const formFieldContext: PartContext<FormFieldContextValue> =
  createPartContext<FormFieldContextValue>("FormField");
const formItemContext: PartContext<FormItemContextValue> =
  createPartContext<FormItemContextValue>("FormItem");
const formRootContext: PartContext<FormRootContextValue> =
  createPartContext<FormRootContextValue>("Form");

/**
 * One problem of a form, as the error summary lists it: the field path (`""` for the form as a whole) and
 * the text. The `issues()` of a ShadowJS forms form returns these.
 * @see {@link FormApiLike}
 * @since 1.0.0
 */
export interface FormIssueLike {
  /** The path of the field the problem belongs to; empty for a problem of the form as a whole. */
  readonly path: string;
  /** The text for the user. */
  readonly message: string;
}

/**
 * What {@link Form} needs from a form library: the state of a field by name, and a way to submit. A
 * ShadowJS forms form (the result of `useForm`) fits as it is, and so does any object with these
 * members. Only `fieldAt` and `handleSubmit` are required; the rest improve the summary and the focus.
 * @see {@link Form}
 * @since 1.0.0
 */
export interface FormApiLike {
  /** The state of one field, by its name (the `name` of a {@link FormField}). */
  fieldAt(path: string): FormFieldState;
  /** Validates and submits. Called with the `submit` event. */
  handleSubmit(event?: Event): unknown;
  /**
   * Attributes for the `<form>`: its `id` and, while a submit runs, `aria-busy`.
   * @default none
   */
  props?(): {
    readonly id?: string | undefined;
    readonly "aria-busy"?: true | undefined;
  };
  /**
   * The problems to list in a {@link FormErrorSummary}.
   * @default none
   */
  issues?(): readonly FormIssueLike[];
  /**
   * How many submits were attempted. The summary shows after the first, and takes focus again on each.
   * @default none
   */
  submitCount?(): number;
  /**
   * Moves focus to the control of a field. Returns whether a control got focus.
   * @default none
   */
  focus?(path: string): boolean;
}

/**
 * Props of {@link FormField}: the field's name and state, and the items that render it.
 * @see {@link FormField}
 * @since 1.0.0
 */
export interface FormFieldProps {
  /**
   * The field's name: the control's `name` attribute, and what `useFormField().name()` returns.
   * @default none (required)
   */
  readonly name: string;
  /**
   * The field's state (see {@link FormFieldState}). Inside a {@link Form} it defaults to the form's field of
   * this name. Without either the field only supplies ids and the name.
   * @default the field of the surrounding {@link Form}, if any
   */
  readonly field?: FormFieldState | undefined;
  /**
   * The {@link FormItem}s, or any other parts, of this field.
   * @default none
   */
  readonly children?: JSX.Element | undefined;
}

/**
 * Connects the parts inside it (label, control, description and message) to one field. It renders no
 * element: it gives the field's name and state to the {@link FormItem} and to the parts under it. Pass
 * the state of your form library, or a {@link FormFieldState} of your own, as `field`.
 *
 * Keyboard and ARIA: this is a wiring component and has no keys. The control gets `id`, `name`,
 * `aria-describedby` (the description and the message while they are rendered), `aria-invalid` (while an
 * error shows), `disabled` (while the field is disabled) and the field's `value`, `onInput`, `onBlur`,
 * `onFocus` and `ref`. The label points at the control. The message has `role="alert"` while it shows an
 * error, so a screen reader announces it (unless a {@link FormErrorSummary} does).
 *
 * shadcn/ui differences: this is not tied to react-hook-form. It takes any state that has the members of
 * {@link FormFieldState}, and the parts are `FormItem`, `FormLabel`, `FormControl`, `FormDescription` and
 * `FormMessage` as in shadcn. `as` replaces `asChild` on `FormControl`, and the prop is `class`, not `className`.
 *
 * @param props The field props: see {@link FormFieldProps}.
 * @returns The provider around the children; it renders no element of its own.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import {
 *   FormControl,
 *   FormDescription,
 *   FormField,
 *   FormItem,
 *   FormLabel,
 *   FormMessage,
 * } from "@/components/ui/form";
 * import { Input } from "@/components/ui/input";
 *
 * export function EmailField() {
 *   const [email, setEmail] = useSignal("");
 *   return (
 *     <FormField
 *       name="email"
 *       field={{
 *         value: email,
 *         error: () => (email().includes("@") ? undefined : "Enter a valid email"),
 *         onInput: (event) => setEmail((event.target as HTMLInputElement).value),
 *       }}
 *     >
 *       <FormItem>
 *         <FormLabel>Email</FormLabel>
 *         <FormControl as={Input} type="email" />
 *         <FormDescription>We never share it.</FormDescription>
 *         <FormMessage />
 *       </FormItem>
 *     </FormField>
 *   );
 * }
 * @see {@link FormItem}
 * @see {@link useFormField}
 * @since 1.0.0
 */
function FormField(props: FormFieldProps): JSX.Element {
  const root = formRootContext.useOptional();
  const state = (): FormFieldState | undefined => props.field ?? root?.form().fieldAt(props.name);
  return (
    <formFieldContext.Provider
      value={{
        name: () => props.name,
        value: () => read(state()?.value),
        rawError: () => read(state()?.error),
        touched: () => read(state()?.touched),
        submitted: () => read(state()?.submitted),
        disabled: () => read(state()?.disabled),
        onInput: (event) => state()?.onInput?.(event),
        onBlur: (event) => state()?.onBlur?.(event),
        onFocus: (event) => state()?.onFocus?.(event),
        onChange: (event) => state()?.onChange?.(event),
        setValue: (value) => state()?.setValue?.(value),
        ref: (element) => state()?.ref?.(element),
      }}
    >
      {props.children}
    </formFieldContext.Provider>
  );
}

/**
 * The ids and state a form part needs, as returned by {@link useFormField}. Members that change
 * are accessors; call them inside JSX or an effect.
 * @see {@link useFormField}
 * @since 1.0.0
 */
export interface FormFieldInfo {
  /** The id of this item; the control's `id` is `formItemId`. */
  readonly id: string;
  /** The field's name. */
  readonly name: Accessor<string>;
  /** The id of the control (the label's `htmlFor` points at it). */
  readonly formItemId: string;
  /** The id of the {@link FormDescription}. */
  readonly formDescriptionId: string;
  /** The id of the {@link FormMessage}. */
  readonly formMessageId: string;
  /** The field's value, as given. */
  readonly value: Accessor<unknown>;
  /** The error to show: the first message, once the field is touched or the form was submitted. */
  readonly error: Accessor<string | undefined>;
  /** Whether an error is showing. */
  readonly invalid: Accessor<boolean>;
  /** The field's `touched` state; `undefined` when the field has none. */
  readonly touched: Accessor<boolean | undefined>;
  /** The field's `submitted` state; `undefined` when the field has none. */
  readonly submitted: Accessor<boolean | undefined>;
  /** The `input` handler to give the control. */
  readonly onInput: (event: Event) => void;
  /** The `blur` handler to give the control. */
  readonly onBlur: (event: Event) => void;
  /** The `focus` handler to give the control. */
  readonly onFocus: (event: Event) => void;
  /** The `change` handler, for parts that listen for `change` events. */
  readonly onChange: (event: Event) => void;
  /** Writes a value, for controls that fire no `input` event. Does nothing if the field has no `setValue`. */
  readonly setValue: (value: unknown) => void;
  /** Registers the control element with the form library, so it can move focus there. */
  readonly ref: (element: Element | null) => void;
  /** Whether the field is disabled. */
  readonly disabled: Accessor<boolean | undefined>;
  /** The `aria-describedby` for the control: the description and the message, when present. */
  readonly describedBy: Accessor<string | undefined>;
}

/**
 * Reads the field and the item the calling component sits in, to build your own form parts. Call it
 * inside a {@link FormField} and a {@link FormItem}.
 *
 * @returns The ids, the name, the value, the error and the handlers of the field.
 * @throws Error when called outside a {@link FormField} or a {@link FormItem}.
 * @example
 * import { FormField, FormItem, useFormField } from "@/components/ui/form";
 *
 * function FormHint() {
 *   const { invalid } = useFormField();
 *   return <span>{invalid() ? "Fix this field" : "Looks good"}</span>;
 * }
 *
 * export function Hinted() {
 *   return (
 *     <FormField name="email">
 *       <FormItem>
 *         <FormHint />
 *       </FormItem>
 *     </FormField>
 *   );
 * }
 * @see {@link FormField}
 * @since 1.0.0
 */
function useFormField(): FormFieldInfo {
  const field = formFieldContext.use("useFormField");
  const item = formItemContext.use("useFormField");
  // An error hides only while the field says it was not touched and the form was not submitted.
  const error = (): string | undefined =>
    field.touched() === false && field.submitted() !== true
      ? undefined
      : firstMessage(field.rawError());
  return {
    id: item.id,
    name: field.name,
    formItemId: `${item.id}-form-item`,
    formDescriptionId: `${item.id}-form-item-description`,
    formMessageId: `${item.id}-form-item-message`,
    value: field.value,
    error,
    invalid: () => error() !== undefined,
    touched: field.touched,
    submitted: field.submitted,
    onInput: field.onInput,
    onBlur: field.onBlur,
    onFocus: field.onFocus,
    onChange: field.onChange,
    setValue: field.setValue,
    ref: field.ref,
    disabled: field.disabled,
    describedBy: () => {
      const ids = [
        item.description.present() ? `${item.id}-form-item-description` : undefined,
        item.message.present() ? `${item.id}-form-item-message` : undefined,
      ].filter((id) => id !== undefined);
      return ids.length === 0 ? undefined : ids.join(" ");
    },
  };
}

/**
 * Groups one field's label, control, description and message in a grid, and generates the ids that tie
 * them together. Put it inside a {@link FormField}.
 *
 * @param props The item props: the attributes of the rendered `div` and `class`.
 * @returns The item.
 * @example
 * import { Input } from "@/components/ui/input";
 * import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
 *
 * export function NameItem() {
 *   return (
 *     <FormField name="name">
 *       <FormItem>
 *         <FormLabel>Name</FormLabel>
 *         <FormControl as={Input} />
 *       </FormItem>
 *     </FormField>
 *   );
 * }
 * @see {@link FormField}
 * @since 1.0.0
 */
function FormItem(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  const id = useBaseId()();
  const description = usePartRegistration();
  const message = usePartRegistration();
  const root = formRootContext.useOptional();
  const field = formFieldContext.useOptional();
  let label: Element | undefined;
  // A field tells its form its name, its control and its label, so the error summary can link to it.
  onMount(() => {
    if (root === undefined || field === undefined) return undefined;
    return root.register({
      name: field.name,
      controlId: `${id}-form-item`,
      label: () => label?.textContent?.trim() || undefined,
    });
  });
  return (
    <formItemContext.Provider
      value={{
        id,
        description,
        message,
        setLabel: (element) => {
          label = element;
        },
      }}
    >
      <div data-slot="form-item" class={cn("grid gap-2", local.class)} {...rest} />
    </formItemContext.Provider>
  );
}

/**
 * The label of the control. It points at the control (`htmlFor` is set for you) and turns destructive
 * while the field shows an error (`data-error="true"`).
 *
 * @param props The label props: see the `Label` component, and `class`.
 * @returns The label.
 * @throws Error when rendered outside a {@link FormField} or a {@link FormItem}.
 * @example
 * import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
 * import { Input } from "@/components/ui/input";
 *
 * export function EmailItem() {
 *   return (
 *     <FormField name="email">
 *       <FormItem>
 *         <FormLabel>Email</FormLabel>
 *         <FormControl as={Input} type="email" />
 *       </FormItem>
 *     </FormField>
 *   );
 * }
 * @see {@link FormControl}
 * @since 1.0.0
 */
function FormLabel<T extends PolymorphicTarget = "label">(props: LabelProps<T>): JSX.Element {
  const field = useFormField();
  const item = formItemContext.use("FormLabel");
  const [local, rest] = splitProps(props as unknown as { readonly class?: ClassValue }, ["class"]);
  // The label element, kept for the error summary; the caller's own ref still runs.
  const merged = mergeElementProps(
    { ref: (element: Element | null) => item.setLabel(element ?? undefined) },
    rest,
  );
  return (
    <Label
      data-slot="form-label"
      data-error={field.invalid() ? "true" : undefined}
      htmlFor={field.formItemId}
      class={cn("data-[error=true]:text-destructive", local.class)}
      {...merged}
    />
  );
}

/**
 * What {@link FormControl} hands to `render` and to the element it renders. Every member is
 * always set by {@link FormControl}, so none of them has a default.
 * @since 1.0.0
 * @see {@link FormControl}
 */
export interface FormControlRenderProps {
  /**
   * The control's id, which the label points at.
   * @default none (always set to the item's generated id)
   */
  readonly id: string;
  /**
   * The field's name.
   * @default none (always set to the `name` of the {@link FormField})
   */
  readonly name: string;
  /**
   * The description and message ids, when those parts are rendered.
   * @default none
   */
  readonly "aria-describedby": string | undefined;
  /**
   * `true` while the field shows an error.
   * @default none
   */
  readonly "aria-invalid": true | undefined;
  /**
   * The field's value, only while it is a string or a number (otherwise `undefined`).
   * @default none
   */
  readonly value: string | number | undefined;
  /**
   * The `input` handler of the field.
   * @default none (always set; it calls the field's `onInput` when there is one)
   */
  readonly onInput: (event: Event) => void;
  /**
   * The `blur` handler of the field.
   * @default none (always set; it calls the field's `onBlur` when there is one)
   */
  readonly onBlur: (event: Event) => void;
  /**
   * The `focus` handler of the field.
   * @default none (always set; it calls the field's `onFocus` when there is one)
   */
  readonly onFocus: (event: Event) => void;
  /**
   * Registers the control element with the form library, so it can move focus to it. Pass it as the
   * `ref` of your element.
   * @default none (always set; it calls the field's `ref` when there is one)
   */
  readonly ref: (element: Element | null) => void;
  /**
   * `true` while the field is disabled.
   * @default none
   */
  readonly disabled: true | undefined;
  /**
   * Writes the field's value, for controls that do not fire `input` events (a select, a checkbox).
   * Does nothing when the field has no `setValue`.
   * @default none (always set)
   */
  readonly setValue: (value: unknown) => void;
  /**
   * The whole field, as {@link useFormField} returns it: read `field.value()` for a value that is not a
   * string or a number, such as a checkbox's boolean.
   * @default none (always set)
   */
  readonly field: FormFieldInfo;
}

/**
 * Props of {@link FormControl}: the attributes of the rendered element (an `input` unless `as` says
 * otherwise) and `render`.
 * @see {@link FormControl}
 * @since 1.0.0
 */
export type FormControlProps<T extends PolymorphicTarget = "input"> = PolymorphicProps<
  "input",
  {
    /**
     * Renders the control yourself. It receives the wiring props (see {@link FormControlRenderProps}),
     * and you place them on your element.
     * @default none
     */
    readonly render?: ((control: FormControlRenderProps) => JSX.Element) | undefined;
  },
  T
>;

/**
 * Wires one control to its field. Pick the element with `as`: an `input` by default, or a component
 * such as the shadcn `Input` or `Textarea`. Or pass `render` to place the wiring props yourself, for a
 * control that is not an `input`. Either way the control gets:
 *
 * - `id` (what the label points at) and `name`,
 * - `aria-describedby` (the description and the message while they are rendered),
 * - `aria-invalid` (while an error shows),
 * - `value` (when the field's value is a string or a number), `onInput`, `onBlur` and `onFocus`,
 * - `disabled` (while the field is disabled) and `ref` (so the form library can focus it).
 *
 * `render` also receives `setValue` and `field`, for controls that do not use `input` events.
 *
 * With `as`, your own props on the element win over these, and your handlers run first and can call
 * `preventDefault()`. Overriding `id` detaches the label, which still points at the generated id.
 *
 * shadcn/ui differences: there is no `asChild`. Use `as`, or `render`, to choose the element.
 *
 * @param props The control props: see {@link FormControlProps}.
 * @returns The control, or what `render` returns.
 * @example
 * import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
 * import { Input } from "@/components/ui/input";
 *
 * export function Placeholder() {
 *   return (
 *     <FormField name="email">
 *       <FormItem>
 *         <FormLabel>Email</FormLabel>
 *         <FormControl as={Input} type="email" placeholder="you@example.com" />
 *       </FormItem>
 *     </FormField>
 *   );
 * }
 * @see {@link FormControlRenderProps}
 * @since 1.0.0
 */
function FormControl<T extends PolymorphicTarget = "input">(
  props: FormControlProps<T>,
): JSX.Element {
  const field = useFormField();
  const [local, rest] = splitProps(
    props as unknown as {
      readonly as?: PolymorphicTarget;
      readonly render?: (control: FormControlRenderProps) => JSX.Element;
      readonly children?: JSX.Element;
    },
    ["as", "render", "children"],
  );
  const control = mergeElementProps(
    {
      get id() {
        return field.formItemId;
      },
      get name() {
        return field.name();
      },
      get "aria-describedby"() {
        return field.describedBy();
      },
      get "aria-invalid"() {
        return field.invalid() ? true : undefined;
      },
      get value() {
        const value = field.value();
        return typeof value === "string" || typeof value === "number" ? value : undefined;
      },
      get disabled() {
        return field.disabled() === true ? true : undefined;
      },
      onInput: field.onInput,
      onBlur: field.onBlur,
      onFocus: field.onFocus,
      ref: field.ref,
    },
    rest,
  );
  const renderProps = mergeElementProps(control, { setValue: field.setValue, field });
  return (
    <Show
      when={local.render}
      fallback={
        <Polymorphic data-slot="form-control" as={local.as ?? "input"} {...control}>
          {local.children}
        </Polymorphic>
      }
    >
      {(render) => render()(renderProps as unknown as FormControlRenderProps)}
    </Show>
  );
}

/**
 * Helper text under the control. The control's `aria-describedby` names it, so a screen reader reads it
 * with the control.
 *
 * @param props The description props: the attributes of the rendered `p` and `class`.
 * @returns The paragraph.
 * @throws Error when rendered outside a {@link FormField} or a {@link FormItem}.
 * @example
 * import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
 * import { Input } from "@/components/ui/input";
 *
 * export function UsernameItem() {
 *   return (
 *     <FormField name="username">
 *       <FormItem>
 *         <FormLabel>Username</FormLabel>
 *         <FormControl as={Input} />
 *         <FormDescription>This is your public display name.</FormDescription>
 *       </FormItem>
 *     </FormField>
 *   );
 * }
 * @see {@link FormMessage}
 * @since 1.0.0
 */
function FormDescription(props: ComponentProps<"p">): JSX.Element {
  const field = useFormField();
  const item = formItemContext.use("FormDescription");
  item.description.register();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      data-slot="form-description"
      id={field.formDescriptionId}
      class={cn("text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  );
}

/** Whether a message body has anything to show. */
function hasContent(body: unknown): boolean {
  return body !== undefined && body !== null && body !== false && body !== "";
}

/** The element of {@link FormMessage}; it exists only while there is a message. */
function MessageText(props: ComponentProps<"p"> & { readonly body: JSX.Element }): JSX.Element {
  const field = useFormField();
  const item = formItemContext.use("FormMessage");
  const root = formRootContext.useOptional();
  item.message.register();
  const [local, rest] = splitProps(props, ["class", "body"]);
  return (
    <p
      data-slot="form-message"
      id={field.formMessageId}
      role={field.invalid() && root?.summary.present() !== true ? "alert" : undefined}
      class={cn("text-sm text-destructive", local.class)}
      {...rest}
    >
      {local.body}
    </p>
  );
}

/**
 * The message of the field: its first error, once the field is touched or the form was submitted. While
 * there is no error it shows its children, and it renders nothing when it has neither. An error has
 * `role="alert"`, so assistive technology announces it when it appears (unless a {@link FormErrorSummary}
 * in the same {@link Form} announces the errors instead), and the control's `aria-describedby` names it.
 *
 * @param props The message props: the attributes of the rendered `p`, and `children` (shown without an
 * error).
 * @returns The message, or nothing while there is nothing to show.
 * @throws Error when rendered outside a {@link FormField} or a {@link FormItem}.
 * @example
 * import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
 * import { Input } from "@/components/ui/input";
 *
 * export function EmailMessage() {
 *   return (
 *     <FormField name="email">
 *       <FormItem>
 *         <FormLabel>Email</FormLabel>
 *         <FormControl as={Input} type="email" />
 *         <FormMessage />
 *       </FormItem>
 *     </FormField>
 *   );
 * }
 * @see {@link FormDescription}
 * @since 1.0.0
 */
function FormMessage(props: ComponentProps<"p">): JSX.Element {
  const field = useFormField();
  const [local, rest] = splitProps(props, ["children"]);
  const body = (): JSX.Element => (field.error() ?? local.children) as JSX.Element;
  return (
    <Show when={hasContent(body())}>
      <MessageText body={body()} {...rest} />
    </Show>
  );
}

/**
 * Props of {@link Form}: the attributes of a `form`, plus the form from your library.
 * @see {@link Form}
 * @since 1.0.0
 */
export type FormProps = ComponentProps<"form"> & {
  /**
   * The form from your form library; the object `useForm` returns in the ShadowJS forms package fits. Its
   * `handleSubmit` runs on submit, and every {@link FormField} inside takes its state from it by name.
   * @default none (required)
   */
  readonly form: FormApiLike;
};

/**
 * The root of a form: a `form` element wired to a form library, the counterpart of shadcn's `Form`
 * (the react-hook-form `FormProvider`). It turns off the browser's own validation, runs the library's
 * `handleSubmit` on submit, and lets every {@link FormField} inside take its state from the form by name,
 * so you pass no `field`. A {@link FormErrorSummary} inside lists the problems of a failed submit.
 *
 * Your own `onSubmit` runs first and may call `preventDefault()` to take over. Without this root, a
 * {@link FormField} still works with a `field` you pass it.
 *
 * Keyboard and ARIA: a native `form`: Enter in a field and a submit button submit it. The `aria-busy`
 * state of the library shows while a submit runs. After a failed submit the library moves focus to the first
 * invalid control (or the summary does).
 *
 * shadcn/ui differences: there is no provider to spread the form into. `form` is the library object, and
 * `class` replaces `className`.
 *
 * @param props The form props: see {@link FormProps}.
 * @returns The `form` element.
 * @example
 * import { Button } from "@/components/ui/button";
 * import {
 *   Form,
 *   FormControl,
 *   type FormApiLike,
 *   FormErrorSummary,
 *   FormField,
 *   FormItem,
 *   FormLabel,
 *   FormMessage,
 * } from "@/components/ui/form";
 * import { Input } from "@/components/ui/input";
 *
 * export function Signup(props: { form: FormApiLike }) {
 *   return (
 *     <Form form={props.form} class="grid gap-4">
 *       <FormErrorSummary />
 *       <FormField name="email">
 *         <FormItem>
 *           <FormLabel>Email</FormLabel>
 *           <FormControl as={Input} type="email" />
 *           <FormMessage />
 *         </FormItem>
 *       </FormField>
 *       <Button type="submit">Sign up</Button>
 *     </Form>
 *   );
 * }
 * @see {@link FormField}
 * @see {@link FormErrorSummary}
 * @since 1.0.0
 */
function Form(props: FormProps): JSX.Element {
  const [local, rest] = splitProps(props, ["form", "onSubmit", "class", "children"]);
  const [revision, setRevision] = useSignal(0);
  const registrations = new Set<FormRegistration>();
  const summary = usePartRegistration();
  const attributes = () => local.form.props?.();
  const submit = (event: Event): void => {
    // The caller's handler runs first; `preventDefault()` there keeps the library out of it.
    const own = untrack(() => local.onSubmit) as ((event: Event) => void) | undefined;
    own?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    void local.form.handleSubmit(event);
  };
  return (
    <formRootContext.Provider
      value={{
        form: () => local.form,
        register: (registration) => {
          registrations.add(registration);
          setRevision((value) => value + 1);
          return () => {
            registrations.delete(registration);
            setRevision((value) => value + 1);
          };
        },
        find: (name) => [...registrations].find((entry) => entry.name() === name),
        revision,
        summary,
      }}
    >
      <form
        data-slot="form"
        id={attributes()?.id}
        noValidate
        aria-busy={attributes()?.["aria-busy"]}
        class={cn(local.class)}
        {...rest}
        onSubmit={submit}
      >
        {local.children}
      </form>
    </formRootContext.Provider>
  );
}

/**
 * Props of {@link FormErrorSummary}: the attributes of the `div` that holds the summary.
 * @see {@link FormErrorSummary}
 * @since 1.0.0
 */
export interface FormErrorSummaryProps extends ComponentProps<"div"> {
  /**
   * Moves focus to the summary after a failed submit, so the problems are read at once and a keyboard
   * user can tab to the links. Turn it off to let the form library focus the first invalid control.
   * @default true
   */
  readonly focusOnSubmit?: boolean | undefined;
}

/**
 * A summary of the problems of a failed submit: a count in a title and a link for each problem that moves
 * focus to its control. It appears after the first submit while the form has problems, follows them as
 * they are fixed, and goes when none is left. Put it at the top of a {@link Form}.
 *
 * Keyboard and ARIA: the summary is a `role="alert"` region named by its title, with `tabindex="-1"`. After
 * each failed submit it takes focus (see `focusOnSubmit`); Tab then reaches the links, and Enter on a link
 * focuses the control of that problem. The field messages stop being alerts while a summary is present, so
 * the problems are announced once. A problem of the whole form is listed without a link. The words are
 * the UI strings `form.errorSummary.title` and `form.errorSummary.item`.
 *
 * shadcn/ui differences: shadcn has no error summary. It follows the pattern of GOV.UK and the WAI
 * forms tutorial.
 *
 * @param props The summary props: see {@link FormErrorSummaryProps}.
 * @returns The summary while there are problems to show, otherwise nothing.
 * @throws Error when rendered outside a {@link Form}.
 * @example
 * import { Form, FormErrorSummary } from "@/components/ui/form";
 *
 * export function Page(props: { form: Parameters<typeof Form>[0]["form"] }) {
 *   return (
 *     <Form form={props.form}>
 *       <FormErrorSummary focusOnSubmit />
 *     </Form>
 *   );
 * }
 * @see {@link Form}
 * @since 1.0.0
 */
function FormErrorSummary(props: FormErrorSummaryProps): JSX.Element {
  const root = formRootContext.use("FormErrorSummary");
  const t = useUiStrings();
  const [local, rest] = splitProps(props, ["class", "focusOnSubmit", "children"]);
  const titleId = partId(useBaseId()(), "error-summary-title");
  const [element, setElement] = useRefSignal<HTMLElement>();
  root.summary.register();
  const entries = useMemo(() => {
    root.revision();
    const form = root.form();
    const seen = new Set<string>();
    const list: Array<{
      readonly path: string;
      readonly message: string;
      readonly id: string | undefined;
      readonly label: string | undefined;
    }> = [];
    for (const issue of form.issues?.() ?? []) {
      if (seen.has(issue.path) || issue.message === "") continue;
      seen.add(issue.path);
      const found = issue.path === "" ? undefined : root.find(issue.path);
      list.push({
        path: issue.path,
        message: issue.message,
        id: found?.controlId,
        label: found?.label(),
      });
    }
    // Problems are listed in the order of the page, whatever order the library found them in; the
    // problems of the whole form come last.
    const position = (id: string | undefined): Node | null =>
      id === undefined ? null : document.getElementById(id);
    return list.sort((a, b) => {
      const first = position(a.id);
      const second = position(b.id);
      if (first === null || second === null) return first === second ? 0 : first === null ? 1 : -1;
      return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  });
  const visible = (): boolean => (root.form().submitCount?.() ?? 0) > 0 && entries().length > 0;
  let focusedFor = 0;
  // After each failed submit the summary takes focus (once it is on the page).
  useEffect(() => {
    const count = root.form().submitCount?.() ?? 0;
    const node = element();
    if (node === undefined || count === focusedFor) return;
    focusedFor = count;
    if (local.focusOnSubmit !== false) node.focus();
  });
  const textOf = (entry: {
    readonly label: string | undefined;
    readonly message: string;
  }): string =>
    entry.label === undefined
      ? entry.message
      : t("form.errorSummary.item", "{label}: {message}", {
          label: entry.label,
          message: entry.message,
        });
  const follow = (event: MouseEvent, path: string, id: string | undefined): void => {
    event.preventDefault();
    const moved = root.form().focus?.(path) === true;
    if (!moved && id !== undefined) document.getElementById(id)?.focus();
  };
  return (
    <Show when={visible()}>
      <div
        data-slot="form-error-summary"
        ref={(node: HTMLElement) => setElement(node)}
        role="alert"
        tabindex={-1}
        aria-labelledby={titleId}
        class={cn(
          "grid gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
          local.class,
        )}
        {...rest}
      >
        <p data-slot="form-error-summary-title" id={titleId} class="font-medium">
          {t(
            "form.errorSummary.title",
            "{count, plural, one {There is # problem with your submission} other {There are # problems with your submission}}",
            { count: entries().length },
          )}
        </p>
        <ul class="grid list-disc gap-1 ps-5">
          <For each={entries()} key={(entry: { path: string }) => entry.path}>
            {(entry) => (
              <li>
                <Show when={entry().id} fallback={() => textOf(entry())}>
                  {(id) => (
                    <a
                      href={`#${id()}`}
                      class="underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-[3px] focus-visible:ring-destructive/30 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent"
                      onClick={(event: MouseEvent) => follow(event, entry().path, id())}
                    >
                      {textOf(entry())}
                    </a>
                  )}
                </Show>
              </li>
            )}
          </For>
        </ul>
        {local.children}
      </div>
    </Show>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormErrorSummary,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
