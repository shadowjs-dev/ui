import { useSignal } from "@shadow-js/core";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DemoProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  size?: "sm" | "default";
  triggerClass?: string;
  contentClass?: string;
  invalid?: boolean;
  position?: "popper" | "item-aligned";
}

/** Two groups of fruits and vegetables with a separator. "Banana" is disabled. */
export function Demo(props: DemoProps) {
  return (
    <div dir={props.dir}>
      <Label htmlFor="fruit">Fruit</Label>
      <Select
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        disabled={props.disabled}
        dir={props.dir}
      >
        <SelectTrigger
          id="fruit"
          size={props.size}
          class={props.triggerClass}
          aria-invalid={props.invalid ? "true" : undefined}
        >
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent class={props.contentClass} position={props.position}>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana" disabled>
              Banana
            </SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Controlled() {
  const [value, setValue] = useSignal("apple");
  return (
    <div>
      <Select value={value()} onValueChange={(next: string) => setValue(next)}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
      <button type="button" onClick={() => setValue("cherry")}>
        cherry
      </button>
      <output>{value()}</output>
    </div>
  );
}

export function InForm(props: { required?: boolean; defaultValue?: string }) {
  return (
    <form data-testid="form">
      <Select name="fruit" required={props.required} defaultValue={props.defaultValue}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
      <button type="reset">reset</button>
    </form>
  );
}

/** Thirty items, so the list scrolls and shows its scroll buttons. */
export function Long(props: { position?: "popper" | "item-aligned"; dir?: "ltr" | "rtl" }) {
  const items = Array.from({ length: 30 }, (_, index) => `Item ${index + 1}`);
  return (
    <div dir={props.dir}>
      <Select defaultOpen defaultValue="item-1" dir={props.dir}>
        <SelectTrigger aria-label="Many">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent position={props.position}>
          {items.map((label, index) => (
            <SelectItem value={`item-${index + 1}`}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
