import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** A busy Arabic save button in a right-to-left document: the spinner sits before the label, spaced by a logical margin. */
export function Rtl() {
  return (
    <div dir="rtl">
      <Button type="button" disabled data-testid="save">
        <Spinner data-testid="spinner" class="me-2" />
        جارٍ الحفظ
      </Button>
    </div>
  );
}
