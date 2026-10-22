import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function Rtl() {
  return (
    <div dir="rtl">
      <div>
        <Checkbox id="rtl-terms" aria-label="الموافقة على الشروط" data-testid="box" />
        <Label htmlFor="rtl-terms" data-testid="label">
          أوافق على الشروط
        </Label>
      </div>
    </div>
  );
}
