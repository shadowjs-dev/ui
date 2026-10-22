import { useSignal } from "@shadow-js/core";
import {
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** The control, wired to its field through the field's accessors. */
function Control() {
  const field = useField();
  return (
    <Input
      aria-label="Email"
      id={field.id()}
      aria-describedby={field.describedBy()}
      aria-invalid={field.invalid() ? true : undefined}
      disabled={field.disabled()}
    />
  );
}

export function Basic(props: { invalid?: boolean; error?: string; description?: boolean }) {
  return (
    <Field invalid={props.invalid} data-testid="field">
      <FieldLabel>Email</FieldLabel>
      <Control />
      {props.description === true && <FieldDescription>We never share it.</FieldDescription>}
      <FieldError>{props.error}</FieldError>
    </Field>
  );
}

export function Horizontal() {
  return (
    <FieldSet>
      <FieldLegend variant="label">Notifications</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal" data-testid="row">
          <FieldContent>
            <FieldTitle>Email</FieldTitle>
            <FieldDescription>Weekly digest.</FieldDescription>
          </FieldContent>
        </Field>
        <FieldSeparator>or</FieldSeparator>
      </FieldGroup>
    </FieldSet>
  );
}

export function Custom() {
  return (
    <Field class="gap-1" data-testid="custom">
      <FieldLabel class="text-base">Name</FieldLabel>
    </Field>
  );
}

/** An error that appears after mount, the way a form shows a message after a failed submit. */
export function Live() {
  const [error, setError] = useSignal<string | undefined>(undefined);
  return (
    <div>
      <Field data-testid="field">
        <FieldLabel>Email</FieldLabel>
        <Control />
        <FieldError>{error()}</FieldError>
      </Field>
      <button type="button" onClick={() => setError("Enter a valid email.")}>
        Submit
      </button>
      <button type="button" onClick={() => setError(undefined)}>
        Clear
      </button>
    </div>
  );
}

/** A field whose control has an id the application chose. */
export function Named() {
  return (
    <Field controlId="profile-email">
      <FieldLabel>Email</FieldLabel>
      <Control />
    </Field>
  );
}

/** The errors of a validator: one message for one entry, a list for several distinct messages. */
export function Errors(props: { errors?: ReadonlyArray<{ message?: string } | undefined> }) {
  return (
    <Field invalid data-testid="field">
      <FieldLabel>Email</FieldLabel>
      <Control />
      <FieldError errors={props.errors} />
    </Field>
  );
}
