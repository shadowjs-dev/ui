import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type RtlProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** An Arabic save hint in a right-to-left document. The bubble is portaled to body, so it carries its own dir. */
export function Rtl(props: RtlProps) {
  return (
    <div dir="rtl">
      <Tooltip {...props}>
        <TooltipTrigger data-testid="trigger">حفظ</TooltipTrigger>
        <TooltipContent dir="rtl" data-testid="bubble" side="bottom">
          احفظ المستند الحالي
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
