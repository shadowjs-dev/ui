import { untrack } from "@shadow-js/core";
import type { Direction } from "@shadow-js/primitives";
import type { Column, Header, Row, Table } from "@shadow-js/table";
import { For, type JSX, type JsxChild } from "@shadow-js/web";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  Table as TableRoot,
  TableRow,
} from "@/components/ui/table";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * Props of {@link DataTable}: the table to render and the options of its element.
 * @see {@link DataTable}
 * @since 1.0.0
 */
export interface DataTableProps<TData> {
  /** The table from `createTable` in `@shadow-js/table`. @default none (required) */
  readonly table: Table<TData>;
  /** Classes for the `table` element, merged with the table's own classes. @default none */
  readonly class?: string;
  /**
   * Shown in one cell spanning every column while there are no rows.
   * @default "No results."
   */
  readonly empty?: JsxChild;
  /**
   * The table's accessible name. It names the table and the scrollable region around it, so a wide
   * table is a labeled region that keyboard users can scroll. Pass it or `aria-labelledby`.
   * @default none
   */
  readonly "aria-label"?: string | undefined;
  /**
   * The id of a visible heading that names the table. Use it instead of `aria-label` when the page
   * already has the heading.
   * @default none
   */
  readonly "aria-labelledby"?: string | undefined;
}

/**
 * The `aria-sort` value of a column header: the direction the column is sorted in, `"none"` when it
 * is sortable but not sorted, and `undefined` (no attribute) when it cannot be sorted at all.
 * @internal
 */
function sortState<TData>(column: Column<TData>): "ascending" | "descending" | "none" | undefined {
  if (!column.getCanSort()) return undefined;
  const sorted = column.getIsSorted();
  return sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";
}

/**
 * Renders a column's `header` or `cell` definition. A function is called with the context; a cell
 * without a definition shows its value (`renderValue`, passed as the fallback).
 */
function render(definition: unknown, context: unknown): JsxChild {
  if (typeof definition === "function") return definition(context) as JsxChild;
  if (definition === undefined || definition === null) return "";
  return String(definition);
}

/**
 * A table that renders a `@shadow-js/table` table: one header cell per visible column (a group header
 * spans its children), one row per row of the current row model, and `data-state="selected"` on the
 * rows that are selected. A sort or a page change updates only the parts that changed. Use
 * {@link DataTableColumnHeader} for sortable headers and {@link DataTablePagination} for the footer.
 *
 * Keyboard and ARIA: the element is a native table. Each header cell is a `columnheader` with
 * `aria-sort` set to `"ascending"`, `"descending"` or `"none"` when the column can be sorted, and no
 * `aria-sort` when it cannot. Sort buttons and pagination buttons are native buttons, so Enter and
 * Space activate them, and a disabled button is skipped. Name the table with `aria-label` or
 * `aria-labelledby` so its scrollable region has a name.
 *
 * shadcn/ui differences: the table is driven by `@shadow-js/table` (`createTable`) rather than by
 * TanStack Table, so `table.getRowModel()`, `column.toggleSorting()` and the other table methods come
 * from that package. The prop is `class`, not `className`, and every element has a `data-slot`.
 *
 * @param props The table and its options: see {@link DataTableProps}.
 * @returns The table element.
 * @example
 * import { createColumnHelper, createTable } from "@shadow-js/table";
 * import { layout } from "@shadow-js/table/layout";
 * import { DataTable, DataTableColumnHeader, DataTablePagination } from "@/components/ui/data-table";
 *
 * interface Person {
 *   id: string;
 *   name: string;
 *   age: number;
 * }
 *
 * const helper = createColumnHelper<Person>();
 * const people: Person[] = [
 *   { id: "1", name: "Ada", age: 36 },
 *   { id: "2", name: "Grace", age: 85 },
 * ];
 *
 * export function PeopleTable() {
 *   const table = createTable({
 *     data: people,
 *     getRowId: (row) => row.id,
 *     features: [layout],
 *     columns: [
 *       helper.accessor("name", {
 *         header: (context) => <DataTableColumnHeader column={context.column} title="Name" />,
 *       }),
 *       helper.accessor("age", { header: "Age" }),
 *     ],
 *   });
 *   return (
 *     <>
 *       <DataTable table={table} aria-label="People" />
 *       <DataTablePagination table={table} />
 *     </>
 *   );
 * }
 * @see {@link DataTableColumnHeader}
 * @see {@link DataTablePagination}
 * @since 1.0.0
 */
export function DataTable<TData>(props: DataTableProps<TData>): JSX.Element {
  const table = props.table;
  const t = useUiStrings();
  return (
    <TableRoot
      class={cn(props.class)}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
    >
      <TableHeader>
        {() =>
          table.getHeaderGroups().map((group) => (
            <TableRow>
              {group.headers.map((header: Header<TData>) =>
                // A placeholder is covered by the header above it (its rowSpan), so it is no cell.
                header.isPlaceholder ? null : (
                  <TableHead
                    colSpan={header.colSpan}
                    rowSpan={header.rowSpan}
                    aria-sort={sortState(header.column)}
                  >
                    {render(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ),
              )}
            </TableRow>
          ))
        }
      </TableHeader>
      <TableBody>
        {() => {
          const rows = table.getRowModel().rows;
          if (rows.length === 0) {
            return (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length}>
                  {props.empty ?? t("dataTable.empty", "No results.")}
                </TableCell>
              </TableRow>
            );
          }
          return rows.map((row: Row<TData>) => (
            <TableRow data-state={row.getIsSelected() ? "selected" : undefined}>
              {row.getVisibleCells().map((cell) => (
                <TableCell>
                  {render(cell.column.columnDef.cell ?? cell.renderValue, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ));
        }}
      </TableBody>
    </TableRoot>
  );
}

/**
 * Props of {@link DataTableColumnHeader}: the column to sort and the visible title.
 * @see {@link DataTableColumnHeader}
 * @since 1.0.0
 */
export interface DataTableColumnHeaderProps<TData> {
  /** The column this header sorts, from the header context (`context.column`). @default none (required) */
  readonly column: Column<TData>;
  /**
   * The visible title of the header.
   * @default the column id
   */
  readonly title?: string;
}

/**
 * A button in a column header that sorts its column. Each click cycles the column through ascending,
 * descending and unsorted (`column.toggleSorting()`). The header is disabled when the column cannot
 * be sorted. The direction is shown as an arrow and announced by `aria-sort` on the column header
 * cell, which {@link DataTable} sets; the button itself has no `aria-sort`.
 *
 * @param props The header props: see {@link DataTableColumnHeaderProps}.
 * @returns The sort button.
 * @example
 * import { createColumnHelper } from "@shadow-js/table";
 * import { DataTableColumnHeader } from "@/components/ui/data-table";
 *
 * interface Person {
 *   name: string;
 * }
 *
 * const helper = createColumnHelper<Person>();
 * export const nameColumn = helper.accessor("name", {
 *   header: (context) => <DataTableColumnHeader column={context.column} title="Name" />,
 * });
 * @see {@link DataTable}
 * @since 1.0.0
 */
export function DataTableColumnHeader<TData>(
  props: DataTableColumnHeaderProps<TData>,
): JSX.Element {
  const column = props.column;
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={!column.getCanSort()}
      onClick={() => column.toggleSorting()}
    >
      {props.title ?? column.id}
      {() => (column.getIsSorted() === "desc" ? " ↓" : column.getIsSorted() === "asc" ? " ↑" : "")}
    </Button>
  );
}

/**
 * The words of {@link DataTablePagination}. Each one defaults to English; an app in another language
 * passes its own.
 * @see {@link DataTablePagination}
 * @since 1.0.0
 */
export interface DataTablePaginationLabels {
  /**
   * The text of the previous-page button.
   * @default "Previous"
   */
  readonly previous?: string | undefined;
  /**
   * The text of the next-page button.
   * @default "Next"
   */
  readonly next?: string | undefined;
  /**
   * The page status, given the current page (from 1) and the page count.
   * @default `Page ${page} of ${pages}`
   */
  readonly page?: ((page: number, pages: number) => string) | undefined;
  /**
   * The status shown when the table has no pages.
   * @default "No pages"
   */
  readonly noPages?: string | undefined;
}

/** The words of the footer, each one set (the defaults filled in). @internal */
type PaginationWords = {
  readonly previous: string;
  readonly next: string;
  readonly page: (page: number, pages: number) => string;
  readonly noPages: string;
};

/**
 * Props of {@link DataTablePagination}: the table to page through and the footer's words.
 * @see {@link DataTablePagination}
 * @since 1.0.0
 */
export interface DataTablePaginationProps<TData> {
  /** The table from `createTable` in `@shadow-js/table`, whose page state the footer changes. @default none (required) */
  readonly table: Table<TData>;
  /** The words of the footer, for a language other than English. @default none */
  readonly labels?: DataTablePaginationLabels | undefined;
}

/**
 * The footer of a {@link DataTable}: the page status, and Previous and Next buttons. Previous is
 * disabled on the first page and Next on the last one. The status reads "No pages" when there is
 * nothing to page through.
 *
 * Keyboard and ARIA: the buttons are native buttons, so Enter and Space activate them, and a disabled
 * one is skipped. The page status is plain text.
 *
 * @param props The footer props: see {@link DataTablePaginationProps}.
 * @returns The footer element.
 * @example
 * import { createColumnHelper, createTable } from "@shadow-js/table";
 * import { DataTablePagination } from "@/components/ui/data-table";
 *
 * interface Person {
 *   id: string;
 *   name: string;
 * }
 *
 * const helper = createColumnHelper<Person>();
 *
 * export function Footer() {
 *   const table = createTable({
 *     data: [{ id: "1", name: "Ada" }],
 *     getRowId: (row) => row.id,
 *     columns: [helper.accessor("name", { header: "Name" })],
 *   });
 *   return <DataTablePagination table={table} labels={{ previous: "Zurück", next: "Weiter" }} />;
 * }
 * @see {@link DataTable}
 * @since 1.0.0
 */
export function DataTablePagination<TData>(props: DataTablePaginationProps<TData>): JSX.Element {
  const table = props.table;
  const t = useUiStrings();
  const label = (): PaginationWords => ({
    previous: props.labels?.previous ?? t("dataTable.previous", "Previous"),
    next: props.labels?.next ?? t("dataTable.next", "Next"),
    page:
      props.labels?.page ??
      ((page: number, pages: number) =>
        t("dataTable.page", "Page {page} of {pages}", { page, pages })),
    noPages: props.labels?.noPages ?? t("dataTable.noPages", "No pages"),
  });
  return (
    <div data-slot="data-table-pagination" class="flex items-center justify-end gap-2 py-2">
      <span class="text-sm text-muted-foreground">
        {() => {
          const count = table.getPageCount();
          const page = table.getState().pagination.pageIndex + 1;
          return count > 0 ? label().page(page, count) : label().noPages;
        }}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        {() => label().previous}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      >
        {() => label().next}
      </Button>
    </div>
  );
}

/**
 * Props of {@link DataTableViewOptions}.
 * @see {@link DataTableViewOptions}
 * @since 1.0.0
 */
export interface DataTableViewOptionsProps<TData> {
  /** Table with the `visibility` feature installed. @default none (required) */
  readonly table: Table<TData>;
  /** Accessible name and text of the menu trigger. @default "View" */
  readonly label?: string | undefined;
  /** Label for each column, called untracked. @default the column id */
  readonly columnLabel?: ((column: Column<TData>) => JsxChild) | undefined;
  /** Trigger classes, merged with the button's defaults. @default none */
  readonly class?: string | undefined;
  /** Reading direction of the portaled menu. @default inherited direction */
  readonly dir?: Direction | undefined;
}

/**
 * A checkbox menu for showing and hiding leaf columns. Columns with `enableHiding: false` are
 * excluded. Checked state follows the table, including changes made outside the menu.
 *
 * Keyboard and ARIA: a named menu button opens with Enter, Space or ArrowDown. The menu uses
 * `menuitemcheckbox` roles; arrow keys move focus, Enter or Space toggles, and Escape closes and
 * returns focus. Supply `label` and `columnLabel` for the app's language.
 *
 * @param props The table, labels, trigger classes and reading direction.
 * @returns The column visibility menu.
 * @example
 * import { createColumnHelper, createTable } from "@shadow-js/table";
 * import { visibility } from "@shadow-js/table/visibility";
 * import { DataTableViewOptions } from "@/components/ui/data-table";
 *
 * export function Columns() {
 *   const helper = createColumnHelper<{ name: string }>();
 *   const table = createTable({ data: [], columns: [helper.accessor("name")], features: [visibility] });
 *   return <DataTableViewOptions table={table} />;
 * }
 * @see {@link DataTable}
 * @since 1.0.0
 */
export function DataTableViewOptions<TData>(props: DataTableViewOptionsProps<TData>): JSX.Element {
  const t = useUiStrings();
  const columns = () => props.table.getAllLeafColumns().filter((column) => column.getCanHide());
  return (
    <DropdownMenu dir={props.dir}>
      <DropdownMenuTrigger
        as={Button}
        data-slot="data-table-view-options"
        variant="outline"
        size="sm"
        class={props.class}
        disabled={columns().length === 0}
      >
        {props.label ?? t("dataTable.view", "View")}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <For each={columns()}>
          {(column) => (
            <DropdownMenuCheckboxItem
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(checked)}
            >
              {() => {
                const label = props.columnLabel;
                return label === undefined ? column.id : untrack(() => label(column));
              }}
            </DropdownMenuCheckboxItem>
          )}
        </For>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
