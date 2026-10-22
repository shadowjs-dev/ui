import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  contentClass?: string;
}

export function Demo(props: DemoProps) {
  return (
    <div>
      <Popover
        open={props.open}
        defaultOpen={props.defaultOpen}
        modal={props.modal}
        onOpenChange={props.onOpenChange}
      >
        <PopoverTrigger as={Button} variant="outline">
          Dimensions
        </PopoverTrigger>
        <PopoverContent align={props.align} sideOffset={props.sideOffset} class={props.contentClass}>
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </PopoverHeader>
          <input aria-label="Width" />
          <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </Popover>
      <button type="button" data-testid="outside">
        outside
      </button>
    </div>
  );
}

/** Anchored to another element than the trigger. */
export function Anchored() {
  return (
    <Popover defaultOpen>
      <PopoverAnchor class="toolbar" data-testid="anchor">
        <PopoverTrigger>Open</PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent aria-label="Details">Details</PopoverContent>
    </Popover>
  );
}
