import { For } from "@shadow-js/web";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxValue,
} from "@/components/ui/combobox";

const FRAMEWORKS = [
  { value: "next", label: "نكست جي إس" },
  { value: "svelte", label: "سفيلت كيت" },
  { value: "remix", label: "ريمكس" },
  { value: "astro", label: "أسترو" },
];

/** The text of a value before its item has ever rendered (the list is closed). */
const labelOf = (value: string): string =>
  FRAMEWORKS.find((framework) => framework.value === value)?.label ?? value;

/** A single-select combobox with Arabic options inside a right-to-left document. */
export function Rtl(props: { defaultOpen?: boolean }) {
  return (
    <div dir="rtl">
      <Combobox dir="rtl" defaultOpen={props.defaultOpen} itemToString={labelOf}>
        <ComboboxInput aria-label="الإطار" placeholder="اختر إطارا" />
        <ComboboxContent>
          <For each={FRAMEWORKS}>
            {(framework) => <ComboboxItem value={framework.value}>{framework.label}</ComboboxItem>}
          </For>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

/** A multiple combobox with Arabic chips inside a right-to-left document. */
export function RtlMulti(props: { defaultValue?: string[] }) {
  return (
    <div dir="rtl">
      <Combobox multiple defaultValue={props.defaultValue} itemToString={labelOf}>
        <ComboboxChips data-testid="chips">
          <ComboboxValue>
            {(chip) => <ComboboxChip value={chip.value}>{chip.label()}</ComboboxChip>}
          </ComboboxValue>
          <ComboboxChipsInput aria-label="الأطر" placeholder="أضف إطارا" />
        </ComboboxChips>
        <ComboboxContent>
          <For each={FRAMEWORKS}>
            {(framework) => <ComboboxItem value={framework.value}>{framework.label}</ComboboxItem>}
          </For>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
