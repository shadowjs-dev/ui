import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const heading = "الاسم";
const cell = "٤٢";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="head">Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell data-testid="cell">Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export function Arabic() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead data-testid="head">{heading}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell data-testid="cell">{cell}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
