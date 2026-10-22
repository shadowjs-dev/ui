import { ScrollArea } from "@/components/ui/scroll-area";

export function Basic() {
  return (
    <ScrollArea data-testid="root" type="always" class="h-40 w-48 rounded-md border">
      <p data-testid="content">Lorem ipsum dolor sit amet.</p>
    </ScrollArea>
  );
}

/** A horizontally overflowing area in the given direction, with its bar always shown. */
export function Horizontal(props: { dir?: "ltr" | "rtl" }) {
  return (
    <ScrollArea data-testid="horizontal" dir={props.dir} type="always" class="h-40 w-48">
      <p class="w-[400px]">Wide content that overflows the viewport.</p>
    </ScrollArea>
  );
}

/** An area the application names as a region, as the item's docs advise. */
export function Named() {
  return (
    <ScrollArea data-testid="named" role="region" aria-label="Release notes" type="always">
      <p>Notes</p>
    </ScrollArea>
  );
}

export function Custom() {
  return (
    <ScrollArea data-testid="custom" class="h-12 w-12" type="auto">
      <p>tiny</p>
    </ScrollArea>
  );
}
