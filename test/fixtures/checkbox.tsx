import { useSignal } from "@shadow-js/core";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DemoProps {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  disabled?: boolean;
  invalid?: boolean;
  class?: string;
}

export function Demo(props: DemoProps) {
  return (
    <div>
      <Checkbox
        id="terms"
        checked={props.checked}
        defaultChecked={props.defaultChecked}
        onCheckedChange={props.onCheckedChange}
        disabled={props.disabled}
        aria-invalid={props.invalid ? "true" : undefined}
        class={props.class}
      />
      <Label htmlFor="terms">Accept terms</Label>
    </div>
  );
}

export function Controlled() {
  const [checked, setChecked] = useSignal<boolean | "indeterminate">(false);
  return (
    <div>
      <Checkbox
        aria-label="Controlled"
        checked={checked()}
        onCheckedChange={(next: boolean | "indeterminate") => setChecked(next)}
      />
      <button type="button" onClick={() => setChecked("indeterminate")}>
        mix
      </button>
    </div>
  );
}

export function InForm(props: { required?: boolean; defaultChecked?: boolean }) {
  return (
    <form data-testid="form">
      <Checkbox
        aria-label="Newsletter"
        name="newsletter"
        value="yes"
        required={props.required}
        defaultChecked={props.defaultChecked}
      />
      <button type="reset">reset</button>
    </form>
  );
}

export function Rtl() {
  return (
    <div dir="rtl">
      <Checkbox aria-label="Rtl" defaultChecked />
    </div>
  );
}
