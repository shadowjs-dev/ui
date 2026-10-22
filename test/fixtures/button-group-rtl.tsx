import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";

const PREV = "السابق";
const PAGE = "الصفحة ٣";
const NEXT = "التالي";

export function Rtl() {
  return (
    <div dir="rtl">
      <ButtonGroup data-testid="group">
        <Button variant="outline">{PREV}</Button>
        <ButtonGroupSeparator />
        <ButtonGroupText>{PAGE}</ButtonGroupText>
        <Button variant="outline">{NEXT}</Button>
      </ButtonGroup>
    </div>
  );
}
