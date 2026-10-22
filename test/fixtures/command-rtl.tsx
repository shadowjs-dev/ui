import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type RtlProps = {
  onSelect?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
};

/** A command palette with Arabic text inside a right-to-left document. */
export function Rtl(props: RtlProps) {
  return (
    <div dir="rtl">
      <Command label="قائمة الأوامر" data-testid="command">
        <CommandInput
          placeholder="اكتب أمرا أو ابحث..."
          value={props.search}
          onValueChange={props.onSearchChange}
        />
        <CommandList data-testid="list">
          <CommandEmpty>لا توجد نتائج.</CommandEmpty>
          <CommandGroup heading="الاقتراحات" data-testid="suggestions">
            <CommandItem onSelect={props.onSelect}>التقويم</CommandItem>
            <CommandItem keywords={["ابتسامة"]} onSelect={props.onSelect}>
              البحث عن رمز تعبيري
            </CommandItem>
            <CommandItem disabled onSelect={props.onSelect}>
              الحاسبة
            </CommandItem>
          </CommandGroup>
          <CommandSeparator data-testid="separator" />
          <CommandGroup heading="الإعدادات" data-testid="settings">
            <CommandItem value="profile" onSelect={props.onSelect} data-testid="profile">
              <span>الملف الشخصي</span>
              <CommandShortcut data-testid="shortcut">Ctrl+P</CommandShortcut>
            </CommandItem>
            <CommandItem value="billing" onSelect={props.onSelect}>
              الفوترة
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
