import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * A right-to-left scroll area: Arabic text, an Arabic-Indic digit, and horizontal overflow.
 * `explicitDir` sets the area's own `dir` prop; without it the area reads only its own prop, a provider, or `<html>`.
 */
export function Rtl(props: { explicitDir?: boolean }) {
  return (
    <div dir="rtl" lang="ar">
      <ScrollArea
        data-testid="root"
        dir={props.explicitDir ? "rtl" : undefined}
        type="always"
        class="h-40 w-48"
      >
        <p data-testid="count">٣ عناصر</p>
        <p class="w-[400px]">محتوى عريض يتجاوز حدود الإطار.</p>
      </ScrollArea>
    </div>
  );
}
