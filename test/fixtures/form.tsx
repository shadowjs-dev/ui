import { useSignal } from "@shadow-js/core";
import { useForm } from "@shadow-js/forms";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormErrorSummary,
  FormField,
  type FormFieldState,
  FormItem,
  FormLabel,
  FormMessage,
  type FormApiLike,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** A hand-written field state on signals: required, must contain "@", touched on blur. */
function emailField(initial: string): FormFieldState {
  const [value, setValue] = useSignal(initial);
  const [touched, setTouched] = useSignal(false);
  return {
    value,
    touched,
    error: () => {
      if (value() === "") return "Email is required";
      return value().includes("@") ? undefined : "Enter a valid email";
    },
    onInput: (event) => setValue((event.target as HTMLInputElement).value),
    onBlur: () => setTouched(true),
  };
}

export function Demo(props: { initial?: string }) {
  const field = emailField(props.initial ?? "");
  return (
    <FormField name="email" field={field}>
      <FormItem data-testid="item">
        <FormLabel>Email</FormLabel>
        <FormControl as={Input} type="email" placeholder="you@example.com" />
        <FormDescription>We never share it.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
  );
}

/** Plain (non-accessor) state. */
export function Plain(props: { error: string | string[] | undefined; touched?: boolean }) {
  return (
    <FormField name="bio" field={{ value: "static text", error: props.error, touched: props.touched }}>
      <FormItem>
        <FormLabel>Bio</FormLabel>
        <FormControl as={Textarea} />
        <FormMessage />
      </FormItem>
    </FormField>
  );
}

/** A state with only an error accessor: no value, no touched. */
export function ErrorOnly() {
  const [error, setError] = useSignal<string | undefined>("Nope");
  return (
    <div>
      <FormField name="x" field={{ error }}>
        <FormItem>
          <FormLabel>X</FormLabel>
          <FormControl as={Input} />
          <FormMessage />
        </FormItem>
      </FormField>
      <button type="button" onClick={() => setError(undefined)}>
        fix
      </button>
    </div>
  );
}

/** No field state at all, with a message that has children. */
export function Bare() {
  return (
    <FormField name="plain">
      <FormItem>
        <FormLabel>Plain</FormLabel>
        <FormControl />
        <FormMessage>Helpful note</FormMessage>
        <FormMessage />
      </FormItem>
    </FormField>
  );
}

/** `render` places the props itself (a checkbox). */
export function RenderProp() {
  const [checked, setChecked] = useSignal<boolean | "indeterminate">(false);
  return (
    <FormField
      name="terms"
      field={{ error: () => (checked() === true ? undefined : "You must accept the terms") }}
    >
      <FormItem>
        <FormControl
          render={(control) => (
            <Checkbox
              id={control.id}
              name={control.name}
              aria-describedby={control["aria-describedby"]}
              aria-invalid={control["aria-invalid"]}
              checked={checked()}
              onCheckedChange={(next: boolean | "indeterminate") => setChecked(next)}
            />
          )}
        />
        <FormLabel>Accept the terms</FormLabel>
        <FormMessage />
      </FormItem>
    </FormField>
  );
}

/** The user's own props and handlers on the control. */
export function Overrides(props: { onUserInput: () => void }) {
  const field = emailField("");
  return (
    <FormField name="email" field={field}>
      <FormItem>
        <FormLabel class="text-red-500">Email</FormLabel>
        <FormControl
          as={Input}
          name="renamed"
          placeholder="mine"
          onInput={props.onUserInput}
          class="w-64"
        />
        <FormDescription class="text-xs">Hint</FormDescription>
      </FormItem>
    </FormField>
  );
}

/** Two fields in one form. */
export function Two() {
  return (
    <form>
      <FormField name="first">
        <FormItem>
          <FormLabel>First</FormLabel>
          <FormControl as={Input} />
        </FormItem>
      </FormField>
      <FormField name="second">
        <FormItem>
          <FormLabel>Second</FormLabel>
          <FormControl as={Input} />
        </FormItem>
      </FormField>
    </form>
  );
}

function Probe() {
  const field = useFormField();
  return (
    <output data-testid="probe">
      {field.name()}:{field.invalid() ? "invalid" : "ok"}:{field.formItemId}
    </output>
  );
}

export function UsesHook() {
  return (
    <FormField name="probe" field={{ error: "bad" }}>
      <FormItem>
        <Probe />
      </FormItem>
    </FormField>
  );
}

/** A form part outside a FormField. */
export function Orphan() {
  return <FormLabel>Lost</FormLabel>;
}

/** A field supplied by the caller (a `@shadow-js/forms` handle, or a hand-written state). */
export function Bound(props: { field: FormFieldState }) {
  return (
    <FormField name="email" field={props.field}>
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl as={Input} />
        <FormMessage />
      </FormItem>
    </FormField>
  );
}

/** A signup form wired to a `@shadow-js/forms` form through the `Form` root, with an error summary. */
export function Signup(props: {
  form: FormApiLike;
  summary?: boolean;
  focusOnSubmit?: boolean;
  onSubmit?: (event: Event) => void;
}) {
  return (
    <Form form={props.form} data-testid="form" onSubmit={props.onSubmit}>
      {props.summary !== false && (
        <FormErrorSummary data-testid="summary" focusOnSubmit={props.focusOnSubmit} />
      )}
      <FormField name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl as={Input} type="email" />
          <FormDescription>We never share it.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField name="password">
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl as={Input} type="password" />
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField name="plan">
        <FormItem>
          <FormLabel>Plan</FormLabel>
          <FormControl
            render={(control) => (
              <Select
                value={String(control.field.value())}
                onValueChange={(next: string) => control.setValue(next)}
              >
                <SelectTrigger
                  id={control.id}
                  aria-invalid={control["aria-invalid"]}
                  aria-describedby={control["aria-describedby"]}
                  onBlur={control.onBlur}
                >
                  <SelectValue placeholder="Pick a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField name="terms">
        <FormItem>
          <FormControl
            render={(control) => (
              <Checkbox
                id={control.id}
                name={control.name}
                aria-invalid={control["aria-invalid"]}
                aria-describedby={control["aria-describedby"]}
                checked={control.field.value() === true}
                onCheckedChange={(next: boolean | "indeterminate") => control.setValue(next === true)}
              />
            )}
          />
          <FormLabel>Accept the terms</FormLabel>
          <FormMessage />
        </FormItem>
      </FormField>
      <button type="submit">Create account</button>
    </Form>
  );
}

/** A control whose element the caller also wants a reference to, and a field the form disables. */
export function Refs(props: { form: FormApiLike; onRef: (node: Element | null) => void }) {
  return (
    <Form form={props.form}>
      <FormField name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl as={Input} ref={props.onRef} />
        </FormItem>
      </FormField>
      <FormField name="password">
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl as={Input} type="password" />
        </FormItem>
      </FormField>
    </Form>
  );
}

/** The library's own form object goes straight into `Form`: the types line up with no cast. */
export function Typed() {
  const form = useForm({
    id: "typed",
    defaultValues: { email: "", age: 0 },
    validators: { email: (value: string) => (value === "" ? "Required" : undefined) },
  });
  return (
    <Form form={form} data-testid="typed">
      <FormErrorSummary />
      <FormField name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl as={Input} type="email" />
          <FormMessage />
        </FormItem>
      </FormField>
      <button type="submit">Send</button>
    </Form>
  );
}
