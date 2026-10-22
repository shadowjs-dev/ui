import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DemoProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabledItem?: string;
  dir?: "ltr" | "rtl";
}

const ITEMS = [
  ["a", "Is it accessible?", "Yes. It follows the WAI-ARIA pattern."],
  ["b", "Is it styled?", "Yes. It comes with default styles."],
  ["c", "Is it animated?", "Yes. It animates by default."],
] as const;

export function Demo(props: DemoProps) {
  const type = props.type ?? "single";
  return (
    <Accordion
      data-testid="root"
      type={type}
      collapsible={props.collapsible}
      value={props.value as never}
      defaultValue={props.defaultValue as never}
      onValueChange={props.onValueChange as never}
      dir={props.dir}
    >
      {ITEMS.map(([value, title, body]) => (
        <AccordionItem value={value} disabled={props.disabledItem === value}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent class="text-muted-foreground">{body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function Custom() {
  return (
    <Accordion type="single" collapsible defaultValue="x" class="max-w-sm">
      <AccordionItem value="x" class="border-0" data-testid="item">
        <AccordionTrigger class="py-2">Title</AccordionTrigger>
        <AccordionContent class="pb-0" data-testid="content">
          Body
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
