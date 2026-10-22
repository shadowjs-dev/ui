import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/** The attributes that make a scroll container a named region. @internal */
interface RegionAttributes {
  readonly role?: "region" | undefined;
  readonly "aria-label"?: string | null | undefined;
  readonly "aria-labelledby"?: string | null | undefined;
}

/**
 * A responsive table. The `table` sits in a container that scrolls horizontally when the table is
 * wider than the space it has. `class` goes on the `table` element.
 *
 * Keyboard and ARIA: the container takes keyboard focus (`tabindex="0"`), so keyboard users can
 * scroll a wide table. The component adds no keys of its own. When the table has an accessible name
 * (`aria-label` or `aria-labelledby`), the container is a `role="region"` with the same name, so the
 * scrolling area is announced by name. Name the table with a {@link TableCaption} or an
 * `aria-label`.
 *
 * shadcn/ui differences: the scroll container is focusable and, for a named table, a labeled
 * region. shadcn/ui sets neither. `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `table`, and `class`.
 * @returns The scroll container, with the table inside.
 * @example
 * ```tsx
 * import {
 *   Table,
 *   TableBody,
 *   TableCaption,
 *   TableCell,
 *   TableHead,
 *   TableHeader,
 *   TableRow,
 * } from "@/components/ui/table";
 *
 * export function Invoices() {
 *   return (
 *     <Table>
 *       <TableCaption>Recent invoices</TableCaption>
 *       <TableHeader>
 *         <TableRow>
 *           <TableHead scope="col">Invoice</TableHead>
 *           <TableHead scope="col">Amount</TableHead>
 *         </TableRow>
 *       </TableHeader>
 *       <TableBody>
 *         <TableRow>
 *           <TableCell>INV001</TableCell>
 *           <TableCell>$250.00</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link TableCaption}
 */
function Table(props: ComponentProps<"table">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  // A named table names its scroll region too; an unnamed one is not a region at all.
  const region = (): RegionAttributes =>
    props["aria-label"] === undefined && props["aria-labelledby"] === undefined
      ? {}
      : {
          role: "region",
          "aria-label": props["aria-label"],
          "aria-labelledby": props["aria-labelledby"],
        };
  return (
    <div
      data-slot="table-container"
      class="relative w-full overflow-x-auto"
      tabindex={0}
      {...region()}
    >
      <table data-slot="table" class={cn("w-full caption-bottom text-sm", local.class)} {...rest}>
        {local.children}
      </table>
    </div>
  );
}

/**
 * The `thead` of a table. Its rows get a bottom border.
 *
 * Keyboard and ARIA: no keys, and no role of its own (it is a row group). Its header cells are
 * column headers (see {@link TableHead}).
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `thead`, and `class`.
 * @returns The `thead` element.
 * @example
 * ```tsx
 * import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 *
 * export function Columns() {
 *   return (
 *     <Table>
 *       <TableHeader>
 *         <TableRow>
 *           <TableHead scope="col">Invoice</TableHead>
 *         </TableRow>
 *       </TableHeader>
 *     </Table>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TableHeader(props: ComponentProps<"thead">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <thead data-slot="table-header" class={cn("[&_tr]:border-b", local.class)} {...rest}>
      {local.children}
    </thead>
  );
}

/**
 * The `tbody` of a table. Its last row has no bottom border.
 *
 * Keyboard and ARIA: no keys, and no role of its own (it is a row group).
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `tbody`, and `class`.
 * @returns The `tbody` element.
 * @example
 * ```tsx
 * import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
 *
 * export function Rows() {
 *   return (
 *     <Table>
 *       <TableBody>
 *         <TableRow>
 *           <TableCell>INV001</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TableBody(props: ComponentProps<"tbody">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <tbody data-slot="table-body" class={cn("[&_tr:last-child]:border-0", local.class)} {...rest}>
      {local.children}
    </tbody>
  );
}

/**
 * The `tfoot` of a table, for totals. It has a top border and a muted background, and its last row
 * has no bottom border.
 *
 * Keyboard and ARIA: no keys, and no role of its own (it is a row group).
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `tfoot`, and `class`.
 * @returns The `tfoot` element.
 * @example
 * ```tsx
 * import { Table, TableCell, TableFooter, TableRow } from "@/components/ui/table";
 *
 * export function Total() {
 *   return (
 *     <Table>
 *       <TableFooter>
 *         <TableRow>
 *           <TableCell>Total</TableCell>
 *           <TableCell>$250.00</TableCell>
 *         </TableRow>
 *       </TableFooter>
 *     </Table>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TableFooter(props: ComponentProps<"tfoot">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <tfoot
      data-slot="table-footer"
      class={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", local.class)}
      {...rest}
    >
      {local.children}
    </tfoot>
  );
}

/**
 * A row of cells. It highlights on hover, and with `data-state="selected"` it takes the selected
 * background.
 *
 * Keyboard and ARIA: no keys; the row has the `row` role. Set `data-state="selected"` for the
 * highlight only; it is not announced, so mark a selected row with `aria-selected` if assistive
 * technology must know.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `tr`, and `class`.
 * @returns The `tr` element.
 * @example
 * ```tsx
 * import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
 *
 * export function SelectedRow() {
 *   return (
 *     <Table>
 *       <TableBody>
 *         <TableRow data-state="selected" aria-selected="true">
 *           <TableCell>INV001</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TableRow(props: ComponentProps<"tr">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <tr
      data-slot="table-row"
      class={cn(
        "border-b transition-colors hover:bg-muted/50 motion-reduce:transition-none data-[state=selected]:bg-muted forced-colors:data-[state=selected]:bg-[Highlight] forced-colors:data-[state=selected]:text-[HighlightText]",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </tr>
  );
}

/**
 * A header cell (`th`). Give it `scope="col"` (a column header) or `scope="row"` (a row header), so
 * assistive technology knows what the cell heads.
 *
 * Keyboard and ARIA: no keys. In a header row it is a `columnheader`; `scope="row"` makes it a
 * row header.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `th`, and `class`.
 * @returns The `th` element.
 * @example
 * ```tsx
 * import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 *
 * export function AmountHead() {
 *   return (
 *     <Table>
 *       <TableHeader>
 *         <TableRow>
 *           <TableHead scope="col">Amount</TableHead>
 *         </TableRow>
 *       </TableHeader>
 *     </Table>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TableHead(props: ComponentProps<"th">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <th
      data-slot="table-head"
      class={cn(
        "h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </th>
  );
}

/**
 * A data cell (`td`).
 *
 * Keyboard and ARIA: no keys; the cell has the `cell` role.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `td`, and `class`.
 * @returns The `td` element.
 * @example
 * ```tsx
 * import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
 *
 * export function Amount() {
 *   return (
 *     <Table>
 *       <TableBody>
 *         <TableRow>
 *           <TableCell>$250.00</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TableCell(props: ComponentProps<"td">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <td
      data-slot="table-cell"
      class={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </td>
  );
}

/**
 * The caption of a table. It is shown below the table and is the table's accessible name.
 *
 * Keyboard and ARIA: no keys. The caption names the table, so a table needs a caption or an
 * `aria-label` for its name.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the `caption`, and `class`.
 * @returns The `caption` element.
 * @example
 * ```tsx
 * import { Table, TableCaption } from "@/components/ui/table";
 *
 * export function Captioned() {
 *   return (
 *     <Table>
 *       <TableCaption>A list of your recent invoices.</TableCaption>
 *     </Table>
 *   );
 * }
 * ```
 * @since 1.0.0
 */
function TableCaption(props: ComponentProps<"caption">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <caption
      data-slot="table-caption"
      class={cn("mt-4 text-sm text-muted-foreground", local.class)}
      {...rest}
    >
      {local.children}
    </caption>
  );
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
