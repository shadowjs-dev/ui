import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

const title = "تم البحث عن الملف";
const detail = "عُثر على ثلاثة ملفات";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Trace>
        <TraceCollapsible defaultOpen>
          <TraceCollapsibleTrigger data-testid="trigger">
            <TraceLine>
              <TraceIcon>
                <svg viewBox="0 0 1 1" />
              </TraceIcon>
              <TraceTitle>{title}</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent data-testid="content">{detail}</TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    </div>
  );
}
