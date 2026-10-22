import { createColumnHelper, createTable } from "@shadow-js/table";
import { layout } from "@shadow-js/table/layout";
import { visibility } from "@shadow-js/table/visibility";
import { DataTable, DataTableColumnHeader, DataTablePagination, DataTableViewOptions } from "@/components/ui/data-table";

interface Person {
  id: string;
  name: string;
  age: number;
}

export const people: Person[] = [
  { id: "1", name: "Ada", age: 36 },
  { id: "2", name: "Grace", age: 85 },
  { id: "3", name: "Linus", age: 54 },
  { id: "4", name: "Margaret", age: 40 },
];

const helper = createColumnHelper<Person>();

/** A sortable, paged table: the header buttons sort, the buttons under it page. */
export function Demo(props: { pageSize?: number; empty?: boolean }) {
  const table = createTable({
    data: props.empty === true ? [] : people,
    getRowId: (row: Person) => row.id,
    features: [layout],
    columns: [
      helper.accessor("name", {
        header: (context) => <DataTableColumnHeader column={context.column} title="Name" />,
      }),
      helper.accessor("age", {
        header: (context) => <DataTableColumnHeader column={context.column} title="Age" />,
      }),
    ],
    initialState: { pagination: { pageIndex: 0, pageSize: props.pageSize ?? 10 } },
  });
  return (
    <div>
      <DataTable table={table} />
      <DataTablePagination table={table} />
    </div>
  );
}

/** The pagination footer with its words supplied by the app (for a language other than English). */
export function Localized() {
  const table = createTable({
    data: people,
    getRowId: (row: Person) => row.id,
    columns: [helper.accessor("name", { header: "Name" })],
    features: [layout],
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
  });
  return (
    <DataTablePagination
      table={table}
      labels={{
        previous: "السابق",
        next: "التالي",
        page: (page: number, pages: number) => `صفحة ${page} من ${pages}`,
        noPages: "لا صفحات",
      }}
    />
  );
}

/** A group header over one column, and a column with no group: that header spans both header rows. */
export function Grouped() {
  const table = createTable({
    data: people,
    getRowId: (row: Person) => row.id,
    features: [layout],
    columns: [
      helper.accessor("name", { header: "Name" }),
      helper.group({
        id: "details",
        header: "Details",
        columns: [helper.accessor("age", { header: "Age" })],
      }),
    ],
  });
  return <DataTable table={table} aria-label="People" />;
}

/** Column visibility with a fixed identifying column and app-supplied language. */
export function ViewOptions(props: { arabic?: boolean; hidden?: boolean }) {
  const table = createTable({
    data: people,
    getRowId: (row: Person) => row.id,
    features: [layout, visibility],
    columns: [
      helper.accessor("name", { header: "Name", enableHiding: false }),
      helper.accessor("age", { header: "Age" }),
    ],
    initialState: { columnVisibility: { age: props.hidden !== true } },
  });
  return (
    <div dir={props.arabic === true ? "rtl" : "ltr"}>
      <DataTableViewOptions
        table={table}
        dir={props.arabic === true ? "rtl" : "ltr"}
        label={props.arabic === true ? "عرض الأعمدة" : "View"}
        columnLabel={(column) => props.arabic === true ? "العمر" : column.columnDef.header as string}
        class="h-10"
      />
      <DataTable table={table} aria-label="People" />
      <button type="button" onClick={() => table.getColumn("age")?.toggleVisibility(true)}>
        Show age
      </button>
    </div>
  );
}
