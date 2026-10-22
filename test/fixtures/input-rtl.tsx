import { Input } from "@/components/ui/input";

const placeholder = "اكتب اسمك";
const value = "محمد";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Input data-testid="field" type="text" placeholder="Your name" />
    </div>
  );
}

export function Arabic() {
  return (
    <div>
      <Input data-testid="field" type="text" placeholder={placeholder} value={value} />
    </div>
  );
}
