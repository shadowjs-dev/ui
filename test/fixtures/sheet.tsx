import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left" | "start" | "end";
  showCloseButton?: boolean;
  contentClass?: string;
}

export function Demo(props: DemoProps) {
  return (
    <div>
      <Sheet open={props.open} defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
        <SheetTrigger as={Button} variant="outline">
          Open sheet
        </SheetTrigger>
        <SheetContent
          side={props.side}
          showCloseButton={props.showCloseButton}
          class={props.contentClass}
        >
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Make changes to your profile here.</SheetDescription>
          </SheetHeader>
          <input aria-label="Name" />
          <SheetFooter>
            <SheetClose as={Button} variant="secondary">
              Cancel
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <button type="button" data-testid="outside">
        outside
      </button>
    </div>
  );
}
