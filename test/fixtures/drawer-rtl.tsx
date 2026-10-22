import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type RtlProps = {
  snapPoints?: readonly number[];
  defaultSnap?: number;
  onSnapChange?: (index: number) => void;
};

/** A drawer with Arabic text inside a right-to-left document. The portaled content sets dir itself. */
export function Rtl(props: RtlProps) {
  return (
    <div dir="rtl">
      <Drawer
        snapPoints={props.snapPoints}
        defaultSnap={props.defaultSnap}
        onSnapChange={props.onSnapChange}
      >
        <DrawerTrigger as={Button} variant="outline" data-testid="trigger">
          فتح الدرج
        </DrawerTrigger>
        <DrawerContent dir="rtl" data-testid="sheet">
          <DrawerHandle data-testid="grip" />
          <DrawerHeader data-testid="header">
            <DrawerTitle>تصفية النتائج</DrawerTitle>
            <DrawerDescription>حدد الخيارات التي تريدها هنا.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter data-testid="footer">
            <Button data-testid="apply">تطبيق</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
