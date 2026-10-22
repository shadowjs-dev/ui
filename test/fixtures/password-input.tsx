import { PasswordInput, PasswordStrength, usePasswordInput } from "@/components/ui/password-input";

interface BasicProps {
  disabled?: boolean;
  defaultVisible?: boolean;
  class?: string;
  onVisibleChange?: (visible: boolean) => void;
  toggleLabel?: string;
}

export function Basic(props: BasicProps) {
  return (
    <div>
      <label for="pw">Password</label>
      <PasswordInput
        id="pw"
        name="password"
        placeholder="Enter your password"
        autocomplete="current-password"
        disabled={props.disabled}
        defaultVisible={props.defaultVisible}
        onVisibleChange={props.onVisibleChange}
        toggleLabel={props.toggleLabel}
        class={props.class}
      />
      <PasswordInput aria-label="Invalid" aria-invalid="true" />
      <PasswordInput aria-label="New" autocomplete="new-password" />
      <PasswordInput aria-label="Narrow" class="w-64" />
    </div>
  );
}

/** A field with the strength meter slot, in a form that can be reset. */
export function Extras(props: {
  capsLockHint?: boolean;
  value?: string;
  preset?: string;
  evaluate?: (password: string) => 0 | 1 | 2 | 3 | 4;
  labels?: readonly string[];
  describedBy?: string;
  meter?: boolean;
  onInput?: () => void;
  attrs?: Record<string, unknown>;
}) {
  return (
    <form data-testid="form">
      <label for="pw2">Password</label>
      <PasswordInput
        id="pw2"
        name="pw"
        {...(props.value === undefined ? {} : { value: props.value })}
        ref={(node: HTMLInputElement) => {
          if (props.preset !== undefined) node.value = props.preset;
        }}
        capsLockHint={props.capsLockHint}
        aria-describedby={props.describedBy}
        onInput={props.onInput}
        {...props.attrs}
      >
        {props.meter !== false && <PasswordStrength evaluate={props.evaluate} labels={props.labels} />}
      </PasswordInput>
      <button type="reset">reset</button>
    </form>
  );
}

/** A custom part that reads the field through the hook. */
function Count() {
  const field = usePasswordInput();
  return (
    <output data-testid="count">
      {field.value().length}:{String(field.visible())}
    </output>
  );
}

export function Hook() {
  return (
    <PasswordInput aria-label="Password">
      <Count />
    </PasswordInput>
  );
}
