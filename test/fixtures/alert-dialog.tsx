import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAction?: () => void;
}

export function Demo(props: DemoProps) {
  return (
    <div>
      <AlertDialog open={props.open} defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
        <AlertDialogTrigger as={Button} variant="outline">
          Delete account
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={props.onAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <button type="button" data-testid="outside">
        outside
      </button>
    </div>
  );
}

/** The small size, with a media slot that holds an icon. */
export function Small() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <svg aria-hidden="true" viewBox="0 0 1 1" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Overridden classes and polymorphic parts. */
export function Custom() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent class="max-w-sm bg-red-50" data-testid="content">
        <AlertDialogTitle>Title</AlertDialogTitle>
        <AlertDialogDescription>Description</AlertDialogDescription>
        <AlertDialogCancel class="bg-green-500 px-8">No</AlertDialogCancel>
        <AlertDialogAction as="a" href="/confirm" class="bg-red-500">
          Yes
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
