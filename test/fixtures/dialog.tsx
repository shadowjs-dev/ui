import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showCloseButton?: boolean;
}

export function Demo(props: DemoProps) {
  return (
    <Dialog open={props.open} defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
      <DialogTrigger as={Button} variant="outline">
        Edit profile
      </DialogTrigger>
      <DialogContent showCloseButton={props.showCloseButton} data-testid="content">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
        </DialogHeader>
        <input aria-label="Name" />
        <DialogFooter>
          <DialogClose as={Button} variant="secondary">
            Cancel
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Content with no DialogTitle: named by the application's aria-label when given, otherwise unnamed. */
export function Unnamed(props: { ariaLabel?: string | undefined; defaultOpen?: boolean | undefined }) {
  return (
    <Dialog defaultOpen={props.defaultOpen}>
      <DialogContent aria-label={props.ariaLabel} data-testid="content">
        <input aria-label="Name" />
      </DialogContent>
    </Dialog>
  );
}
