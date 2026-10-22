import { useSignal } from "@shadow-js/core";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface DemoProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  class?: string;
  size?: "sm" | "default";
  invalid?: boolean;
}

export function Demo(props: DemoProps) {
  return (
    <div>
      <Switch
        id="airplane"
        checked={props.checked}
        defaultChecked={props.defaultChecked}
        onCheckedChange={props.onCheckedChange}
        disabled={props.disabled}
        class={props.class}
        size={props.size}
        aria-invalid={props.invalid ? "true" : undefined}
      />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  );
}

export function Controlled() {
  const [on, setOn] = useSignal(false);
  return (
    <div>
      <Switch aria-label="Controlled" checked={on()} onCheckedChange={(next: boolean) => setOn(next)} />
      <output>{on() ? "on" : "off"}</output>
    </div>
  );
}

export function InForm(props: { required?: boolean; defaultChecked?: boolean }) {
  return (
    <form data-testid="form">
      <Switch
        aria-label="Alerts"
        name="alerts"
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
      <Switch aria-label="Rtl" defaultChecked />
    </div>
  );
}
