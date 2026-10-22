import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function Demo(props: DemoProps) {
  return (
    <Collapsible
      data-testid="root"
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      disabled={props.disabled}
    >
      <div>
        <h4>3 starred repositories</h4>
        <CollapsibleTrigger as={Button} variant="ghost" size="sm">
          Toggle
        </CollapsibleTrigger>
      </div>
      <p>@shadow-js/core</p>
      <CollapsibleContent class="space-y-2" data-testid="content">
        <p>@shadow-js/web</p>
        <p>@shadow-js/primitives</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function Plain() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Plain toggle</CollapsibleTrigger>
      <CollapsibleContent>Plain content</CollapsibleContent>
    </Collapsible>
  );
}
