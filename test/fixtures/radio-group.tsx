import { useSignal } from "@shadow-js/core";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DemoProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  name?: string;
  required?: boolean;
  class?: string;
  itemClass?: string;
}

/** Three plans; "team" is disabled. */
export function Demo(props: DemoProps) {
  return (
    <RadioGroup
      aria-label="Plan"
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
      dir={props.dir}
      name={props.name}
      required={props.required}
      class={props.class}
    >
      <div>
        <RadioGroupItem value="free" id="plan-free" class={props.itemClass} />
        <Label htmlFor="plan-free">Free</Label>
      </div>
      <div>
        <RadioGroupItem value="pro" id="plan-pro" />
        <Label htmlFor="plan-pro">Pro</Label>
      </div>
      <div>
        <RadioGroupItem value="team" id="plan-team" disabled />
        <Label htmlFor="plan-team">Team</Label>
      </div>
      <div>
        <RadioGroupItem value="max" id="plan-max" aria-invalid="true" />
        <Label htmlFor="plan-max">Max</Label>
      </div>
    </RadioGroup>
  );
}

export function Controlled() {
  const [value, setValue] = useSignal("pro");
  return (
    <div>
      <RadioGroup aria-label="Plan" value={value()} onValueChange={(next: string) => setValue(next)}>
        <RadioGroupItem value="free" aria-label="Free" />
        <RadioGroupItem value="pro" aria-label="Pro" />
      </RadioGroup>
      <button type="button" onClick={() => setValue("free")}>
        free
      </button>
      <output>{value()}</output>
    </div>
  );
}

export function InForm(props: { required?: boolean; defaultValue?: string }) {
  return (
    <form data-testid="form">
      <RadioGroup
        aria-label="Plan"
        name="plan"
        required={props.required}
        defaultValue={props.defaultValue}
      >
        <RadioGroupItem value="free" aria-label="Free" />
        <RadioGroupItem value="pro" aria-label="Pro" />
      </RadioGroup>
      <button type="reset">reset</button>
    </form>
  );
}
