import { useSignal } from "@shadow-js/core";
import { Input } from "@/components/ui/input";

export function Basic() {
  return (
    <div>
      <label for="email">Email</label>
      <Input id="email" type="email" placeholder="you@example.com" />
      <Input aria-label="Disabled" disabled />
      <Input aria-label="Invalid" aria-invalid="true" />
      <Input aria-label="Custom" class="h-12 w-64" />
      <Input aria-label="File" type="file" />
    </div>
  );
}

export function Controlled() {
  const [value, setValue] = useSignal("start");
  return (
    <div>
      <Input
        aria-label="Name"
        value={value()}
        onInput={(event) => setValue(event.currentTarget.value)}
      />
      <output>{value()}</output>
    </div>
  );
}
