import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function Basic(props: Record<string, unknown>) {
  return (
    <Drawer {...props}>
      <DrawerTrigger data-testid="trigger">Filters</DrawerTrigger>
      <DrawerContent data-testid="sheet">
        <DrawerHandle data-testid="grip" />
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the list.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}

/** The same sheet inside a right-to-left wrapper. */
export function InRtl(props: Record<string, unknown>) {
  return (
    <div dir="rtl">
      <Drawer {...props}>
        <DrawerTrigger data-testid="trigger">Filters</DrawerTrigger>
        <DrawerContent data-testid="sheet">
          <DrawerHandle data-testid="grip" />
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow the list.</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
