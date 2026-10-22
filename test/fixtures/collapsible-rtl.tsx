import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const TRIGGER = "عرض التفاصيل";
const BODY = "تفاصيل إضافية للطلب";

export function Rtl(props: {
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <div dir="rtl">
      <Collapsible
        data-testid="root"
        defaultOpen={props.defaultOpen}
        disabled={props.disabled}
        onOpenChange={props.onOpenChange}
      >
        <CollapsibleTrigger data-testid="trigger">{TRIGGER}</CollapsibleTrigger>
        <CollapsibleContent data-testid="panel">{BODY}</CollapsibleContent>
      </Collapsible>
    </div>
  );
}
