import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface WrapperProps {
  wrapperDir?: "ltr" | "rtl";
  contentDir?: "ltr" | "rtl";
}

/** A sheet whose trigger sits in a wrapper with a dir attribute. The sheet content is portaled to the body. */
export function InWrapper(props: WrapperProps) {
  return (
    <div dir={props.wrapperDir} data-testid="wrapper">
      <Sheet>
        <SheetTrigger as={Button} variant="outline" data-testid="trigger">
          فتح الورقة
        </SheetTrigger>
        <SheetContent data-testid="sheet" dir={props.contentDir}>
          <SheetHeader>
            <SheetTitle>تعديل الملف الشخصي</SheetTitle>
            <SheetDescription>قم بإجراء التغييرات على ملفك الشخصي هنا.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
