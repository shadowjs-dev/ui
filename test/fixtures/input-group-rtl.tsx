import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

/** An Arabic amount field: a unit addon at the start, a copy button at the end, in a right-to-left document. */
export function Rtl() {
  return (
    <div dir="rtl">
      <InputGroup aria-label="حقل المبلغ" data-testid="group">
        <InputGroupAddon align="inline-start" data-testid="start">
          <InputGroupText data-testid="unit">ر.س</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="المبلغ" data-testid="control" />
        <InputGroupAddon align="inline-end" data-testid="end">
          <InputGroupButton data-testid="copy">نسخ</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

/** An Arabic note field: a block addon above a textarea, in a right-to-left document. */
export function Block() {
  return (
    <div dir="rtl">
      <InputGroup data-testid="group">
        <InputGroupAddon align="block-start" data-testid="top">
          <InputGroupText>ملاحظة</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea aria-label="الرسالة" data-testid="control" />
      </InputGroup>
    </div>
  );
}
