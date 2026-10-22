import { Toggle } from "@/components/ui/toggle";

const label = "غامق";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Toggle data-testid="toggle" aria-label="Bold">
        Bold
      </Toggle>
    </div>
  );
}

export function Arabic() {
  return (
    <div>
      <Toggle data-testid="toggle" aria-label={label}>
        {label}
      </Toggle>
    </div>
  );
}
