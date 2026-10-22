import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RtlProps {
  /** The select's own `dir` prop. Without it the select reads only its own prop, a provider, or `<html>`. */
  dir?: "rtl";
  defaultValue?: string;
  defaultOpen?: boolean;
  onValueChange?: (value: string) => void;
}

/**
 * A right-to-left select: Arabic trigger label, placeholder, groups, items, and an Arabic-Indic digit item.
 * The wrapper sets `dir="rtl" lang="ar"`; the select's own `dir` is set only when `props.dir` is given.
 */
export function Rtl(props: RtlProps) {
  return (
    <div dir="rtl" lang="ar">
      <Select
        dir={props.dir}
        defaultValue={props.defaultValue}
        defaultOpen={props.defaultOpen}
        onValueChange={props.onValueChange}
      >
        <SelectTrigger aria-label="الفاكهة" data-testid="trigger">
          <SelectValue placeholder="اختر فاكهة" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>الفواكه</SelectLabel>
            <SelectItem value="apple">تفاح</SelectItem>
            <SelectItem value="banana" disabled>
              موز
            </SelectItem>
            <SelectItem value="blueberry">توت</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>الخضروات</SelectLabel>
            <SelectItem value="carrot">جزر</SelectItem>
            <SelectItem value="٣">٣ حبات</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
