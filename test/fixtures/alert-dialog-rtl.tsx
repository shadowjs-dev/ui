import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const TRIGGER = "حذف الحساب";
const TITLE = "هل أنت متأكد؟";
const DESCRIPTION = "لا يمكن التراجع عن هذا الإجراء.";
const CANCEL = "إلغاء";
const ACTION = "متابعة";

export function Rtl(props: { onAction?: () => void; onOpenChange?: (open: boolean) => void }) {
  return (
    <div dir="rtl">
      <AlertDialog onOpenChange={props.onOpenChange}>
        <AlertDialogTrigger as={Button} variant="outline" data-testid="trigger">
          {TRIGGER}
        </AlertDialogTrigger>
        <AlertDialogContent dir="rtl" data-testid="content">
          <AlertDialogHeader data-testid="header">
            <AlertDialogTitle>{TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{DESCRIPTION}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter data-testid="footer">
            <AlertDialogCancel>{CANCEL}</AlertDialogCancel>
            <AlertDialogAction onClick={props.onAction}>{ACTION}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
