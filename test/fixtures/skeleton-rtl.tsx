import { Skeleton } from "@/components/ui/skeleton";

/** A loading row in a right-to-left document: a round avatar, two text lines, and an Arabic caption that stays visible. */
export function Rtl() {
  return (
    <div dir="rtl" class="flex items-center gap-4">
      <Skeleton data-testid="avatar" class="size-10 shrink-0 rounded-full" />
      <div data-testid="lines" class="ms-3 grid gap-2">
        <Skeleton data-testid="line" class="h-4 w-40" />
        <Skeleton data-testid="short" class="h-4 w-24" />
      </div>
      <p data-testid="caption">جارٍ تحميل الملف الشخصي</p>
    </div>
  );
}
