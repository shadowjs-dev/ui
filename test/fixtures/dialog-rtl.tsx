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

type RtlProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showCloseButton?: boolean;
};

/** A dialog with Arabic text inside a right-to-left document. The portaled content sets dir itself. */
export function Rtl(props: RtlProps) {
  return (
    <div dir="rtl">
      <Dialog open={props.open} defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
        <DialogTrigger as={Button} variant="outline" data-testid="trigger">
          فتح الحوار
        </DialogTrigger>
        <DialogContent dir="rtl" showCloseButton={props.showCloseButton} data-testid="content">
          <DialogHeader data-testid="header">
            <DialogTitle>تعديل الملف الشخصي</DialogTitle>
            <DialogDescription>قم بإجراء التغييرات على ملفك الشخصي هنا.</DialogDescription>
          </DialogHeader>
          <input aria-label="الاسم" />
          <DialogFooter data-testid="footer">
            <DialogClose as={Button} variant="secondary" data-testid="cancel">
              إلغاء
            </DialogClose>
            <Button data-testid="save">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
