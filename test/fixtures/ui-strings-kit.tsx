import { createColumnHelper, createTable } from "@shadow-js/table";
import { layout } from "@shadow-js/table/layout";
import { visibility } from "@shadow-js/table/visibility";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Calendar } from "@/components/ui/calendar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from "@/components/ui/combobox";
import { CommandDialog } from "@/components/ui/command";
import { DataTable, DataTablePagination, DataTableViewOptions } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHandle, DrawerTitle } from "@/components/ui/drawer";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Pagination, PaginationContent, PaginationItems, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/toast";
import { type UiStringsCatalog, UiStringsProvider } from "@/lib/ui-strings";

interface Person {
  id: string;
  name: string;
}

const people: Person[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Grace" },
  { id: "3", name: "Linus" },
];
const helper = createColumnHelper<Person>();

/** The parts of the kit that carry words of their own, under a provider with the given pack. */
export function Kit(props: { pack?: UiStringsCatalog; locale?: string }) {
  const table = createTable({
    data: people,
    getRowId: (row: Person) => row.id,
    features: [layout, visibility],
    columns: [helper.accessor("name", { header: "Name" })],
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
  });
  const empty = createTable({
    data: [] as Person[],
    getRowId: (row: Person) => row.id,
    features: [layout],
    columns: [helper.accessor("name", { header: "Name" })],
  });
  return (
    <UiStringsProvider strings={props.pack} locale={props.locale}>
      <div data-testid="kit">
        <Breadcrumb data-testid="breadcrumb">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Spinner data-testid="spinner" />
        <Calendar data-testid="calendar" defaultMonth={{ year: 2026, month: 3 }} captionLayout="dropdown" />
        <Pagination pageCount={5} defaultPage={2} data-testid="pagination">
          <PaginationContent>
            <PaginationPrevious />
            <PaginationItems />
            <PaginationNext />
          </PaginationContent>
        </Pagination>
        <InputOTP maxLength={4} aria-label="code" data-testid="otp">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>
        <Carousel aria-label="slides" data-testid="carousel">
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
            <CarouselItem>Two</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <ResizablePanelGroup direction="horizontal" data-testid="resizable">
          <ResizablePanel defaultSize={50}>A</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>B</ResizablePanel>
        </ResizablePanelGroup>
        <Combobox>
          <ComboboxInput showClear aria-label="fruit" />
          <ComboboxContent>
            <ComboboxItem value="apple">Apple</ComboboxItem>
          </ComboboxContent>
        </Combobox>
        <DatePicker data-testid="date-picker" />
        <DataTable table={table} />
        <DataTablePagination table={table} />
        <DataTableViewOptions table={table} />
        <DataTable table={empty} data-testid="empty" />
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>t</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogContent>
        </Dialog>
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle>t</SheetTitle>
            <SheetDescription>d</SheetDescription>
          </SheetContent>
        </Sheet>
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>t</DrawerTitle>
            <DrawerDescription>d</DrawerDescription>
            <DrawerHandle />
          </DrawerContent>
        </Drawer>
        <CommandDialog defaultOpen />
        <Toaster />
      </div>
    </UiStringsProvider>
  );
}
