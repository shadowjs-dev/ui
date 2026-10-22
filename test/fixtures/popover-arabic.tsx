import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

/** A right-to-left popover: Arabic trigger, title, description, field label, and an Arabic-Indic digit. */
export function Rtl(props: { defaultOpen?: boolean }) {
  return (
    <div dir="rtl" lang="ar">
      <Popover defaultOpen={props.defaultOpen}>
        <PopoverTrigger as={Button} variant="outline" data-testid="trigger">
          الأبعاد
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>الأبعاد</PopoverTitle>
            <PopoverDescription>حدد أبعاد الطبقة. العدد ٣ حقول.</PopoverDescription>
          </PopoverHeader>
          <input aria-label="العرض" data-testid="width" />
          <PopoverClose>تم</PopoverClose>
        </PopoverContent>
      </Popover>
      <button type="button" data-testid="outside">
        خارج
      </button>
    </div>
  );
}
