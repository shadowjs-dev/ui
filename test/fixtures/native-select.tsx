import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";

export function Basic(props: { onChange?: (value: string) => void; disabled?: boolean; invalid?: boolean; size?: "sm" | "default"; class?: string }) {
  return (
    <NativeSelect
      aria-label="Country"
      data-testid="select"
      disabled={props.disabled}
      aria-invalid={props.invalid ? "true" : undefined}
      size={props.size}
      class={props.class}
      onChange={(event: Event) => props.onChange?.((event.currentTarget as HTMLSelectElement).value)}
    >
      <NativeSelectOption value="">Choose</NativeSelectOption>
      <NativeSelectOptGroup label="Nordic">
        <NativeSelectOption value="se">Sweden</NativeSelectOption>
        <NativeSelectOption value="no">Norway</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  );
}

export function Disabled() {
  return (
    <NativeSelect aria-label="Plan">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOptGroup label="Paid" disabled>
        <NativeSelectOption value="pro" disabled>
          Pro
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  );
}
