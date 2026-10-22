import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select";

/** A right-to-left native select: Arabic label, placeholder, option groups, and an Arabic-Indic digit option. */
export function Rtl(props: { onChange?: (value: string) => void }) {
  return (
    <div dir="rtl" lang="ar">
      <NativeSelect
        aria-label="الدولة"
        data-testid="select"
        onChange={(event: Event) => props.onChange?.((event.currentTarget as HTMLSelectElement).value)}
      >
        <NativeSelectOption value="">اختر دولة</NativeSelectOption>
        <NativeSelectOptGroup label="شمال أوروبا">
          <NativeSelectOption value="se">السويد</NativeSelectOption>
          <NativeSelectOption value="no">النرويج</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOption value="٣">٣ مدن</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
