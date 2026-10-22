import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const caption = "البريد الإلكتروني";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Label htmlFor="rtl-email">Email</Label>
      <Input id="rtl-email" type="email" />
    </div>
  );
}

export function Arabic() {
  return (
    <div>
      <Label htmlFor="ar-email">{caption}</Label>
      <Input id="ar-email" type="email" />
    </div>
  );
}
