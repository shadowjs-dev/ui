import {
  Pagination,
  PaginationContent,
  PaginationLink,
} from "@/components/ui/pagination";

const current = "١";
const next = "التالي";

export function Arabic() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationLink href="#page-1" isActive data-testid="current">
          {current}
        </PaginationLink>
        <PaginationLink href="#page-2" data-testid="next">
          {next}
        </PaginationLink>
      </PaginationContent>
    </Pagination>
  );
}
