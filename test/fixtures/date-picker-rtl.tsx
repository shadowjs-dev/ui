import { DatePicker } from "@/components/ui/date-picker";

type RtlProps = Record<string, unknown>;

/** A date field with Arabic text and an Arabic calendar inside a right-to-left document. */
export function Rtl(props: RtlProps) {
  return (
    <div dir="rtl">
      <label for="rtl-due">تاريخ الاستحقاق</label>
      <DatePicker
        id="rtl-due"
        locale="ar-EG"
        placeholder="يوم/شهر/سنة"
        triggerLabel="فتح التقويم"
        {...props}
      />
    </div>
  );
}
