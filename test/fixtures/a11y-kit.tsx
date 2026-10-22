import { createColumnHelper, createTable } from "@shadow-js/table";
import { layout } from "@shadow-js/table/layout";
import { DataTable } from "@/components/ui/data-table";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface ShellProps {
  readonly isMobile?: boolean | undefined;
  readonly as?: "aside" | "nav" | "div" | undefined;
  readonly insetAs?: "main" | "div" | undefined;
  readonly label?: string | undefined;
  readonly labelledBy?: string | undefined;
}

/** A sidebar with a header, menu and footer, next to the page. The caller names the sidebar. */
export function Shell(props: ShellProps) {
  return (
    <SidebarProvider isMobile={props.isMobile} defaultOpen>
      <Sidebar as={props.as} aria-label={props.label} aria-labelledby={props.labelledBy}>
        <SidebarHeader>
          <p>Brand</p>
        </SidebarHeader>
        <SidebarContent>
          <p>Menu</p>
        </SidebarContent>
        <SidebarFooter>
          <p>Account</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset as={props.insetAs}>
        <SidebarTrigger />
        <p>Page</p>
      </SidebarInset>
    </SidebarProvider>
  );
}

/** A table with one row, named by the caller when a label is given. */
export function NamedTable(props: { readonly label?: string | undefined }) {
  return (
    <Table aria-label={props.label} data-testid="table">
      <TableBody>
        <TableRow>
          <TableCell>Cell</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

interface Person {
  id: string;
  name: string;
}

const people: Person[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Grace" },
];

const helper = createColumnHelper<Person>();

/** A data table named by the caller when a label is given. */
export function NamedDataTable(props: { readonly label?: string | undefined }) {
  const table = createTable({
    data: people,
    getRowId: (row: Person) => row.id,
    features: [layout],
    columns: [helper.accessor("name", { header: "Name" })],
  });
  return <DataTable table={table} aria-label={props.label} />;
}
