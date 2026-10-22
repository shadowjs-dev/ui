import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  contentClass?: string;
}

/** A tooltip with no provider above it. */
export function Demo(props: DemoProps) {
  return (
    <div>
      <Tooltip open={props.open} defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
        <TooltipTrigger as={Button} variant="outline" data-testid="trigger">
          Hover
        </TooltipTrigger>
        <TooltipContent side={props.side} sideOffset={props.sideOffset} class={props.contentClass}>
          Add to library
        </TooltipContent>
      </Tooltip>
      <button type="button" data-testid="outside">
        outside
      </button>
    </div>
  );
}

interface GroupProps {
  delayDuration?: number;
  skipDelayDuration?: number;
}

/** Two tooltips in one provider. */
export function Group(props: GroupProps) {
  return (
    <TooltipProvider
      delayDuration={props.delayDuration}
      skipDelayDuration={props.skipDelayDuration}
    >
      <Tooltip>
        <TooltipTrigger data-testid="first">Bold</TooltipTrigger>
        <TooltipContent>Make it bold</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger data-testid="second">Italic</TooltipTrigger>
        <TooltipContent>Make it italic</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
