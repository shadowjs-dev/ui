import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type RtlProps = {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
};

const ITEMS = [
  ["a", "ما هي سياسة الإلغاء؟", "يمكن الإلغاء في أي وقت دون رسوم."],
  ["b", "هل يدعم الحساب أكثر من مستخدم؟", "نعم، يمكن إضافة مستخدمين غير محدود."],
  ["c", "كيف أتواصل مع الدعم؟", "من خلال نافذة المحادثة في أسفل الصفحة."],
] as const;

/** An Arabic accordion inside a right-to-left document. The root sets dir itself. */
export function Rtl(props: RtlProps) {
  const type = props.type ?? "single";
  return (
    <div dir="rtl">
      <Accordion
        data-testid="root"
        dir="rtl"
        type={type}
        collapsible={props.collapsible}
        defaultValue={props.defaultValue as never}
      >
        {ITEMS.map(([value, title, body]) => (
          <AccordionItem value={value} data-testid={`item-${value}`}>
            <AccordionTrigger data-testid={`trigger-${value}`}>{title}</AccordionTrigger>
            <AccordionContent class="text-muted-foreground" data-testid={`content-${value}`}>
              {body}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
