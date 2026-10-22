import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface DemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  delay?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClass?: string;
}

export function Demo(props: DemoProps) {
  return (
    <div>
      <HoverCard
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        openDelay={props.openDelay}
        closeDelay={props.closeDelay}
        delay={props.delay}
      >
        <HoverCardTrigger href="/shadow" data-testid="trigger">
          @shadow-js
        </HoverCardTrigger>
        <HoverCardContent side={props.side} align={props.align} class={props.contentClass} data-testid="content">
          <p>The fine-grained UI framework.</p>
          <a href="/more">More</a>
        </HoverCardContent>
      </HoverCard>
      <button type="button" data-testid="outside">
        outside
      </button>
    </div>
  );
}

/** The trigger rendered as a button-styled link. */
export function AsButton() {
  return (
    <HoverCard defaultOpen>
      <HoverCardTrigger as={Button} variant="link" data-testid="trigger">
        @shadow-js
      </HoverCardTrigger>
      <HoverCardContent>Preview</HoverCardContent>
    </HoverCard>
  );
}
