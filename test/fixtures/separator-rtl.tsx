import { Separator } from "@/components/ui/separator";

/** An Arabic toolbar in a right-to-left document: a vertical divider between two labels, and a horizontal rule under them. */
export function Rtl() {
  return (
    <div dir="rtl">
      <div data-testid="toolbar" class="flex h-5 items-center gap-4">
        <span>الرئيسية</span>
        <Separator data-testid="divider" orientation="vertical" decorative={false} />
        <span>الوثائق</span>
      </div>
      <Separator data-testid="rule" />
      <Separator data-testid="semantic" decorative={false} />
    </div>
  );
}
