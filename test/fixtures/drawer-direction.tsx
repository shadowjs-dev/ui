import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface WrapperProps {
  wrapperDir?: "ltr" | "rtl";
  contentDir?: "ltr" | "rtl";
}

/** A drawer whose trigger sits in a wrapper with a dir attribute. The drawer content is portaled to the body. */
export function InWrapper(props: WrapperProps) {
  return (
    <div dir={props.wrapperDir} data-testid="wrapper">
      <Drawer>
        <DrawerTrigger as={Button} variant="outline" data-testid="trigger">
          فتح الدرج
        </DrawerTrigger>
        <DrawerContent data-testid="drawer" dir={props.contentDir}>
          <DrawerHeader>
            <DrawerTitle>تصفية النتائج</DrawerTitle>
            <DrawerDescription>حدد الخيارات التي تريدها هنا.</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
