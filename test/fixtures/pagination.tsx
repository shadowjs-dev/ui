import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DemoProps {
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageCount?: number;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  getHref?: (page: number) => string;
  previousLabel?: string;
  nextLabel?: string;
}

export function Demo(props: DemoProps) {
  return (
    <Pagination
      data-testid="nav"
      page={props.page}
      defaultPage={props.defaultPage}
      onPageChange={props.onPageChange}
      pageCount={props.pageCount ?? 10}
      siblingCount={props.siblingCount}
      boundaryCount={props.boundaryCount}
      disabled={props.disabled}
      dir={props.dir}
      getHref={props.getHref}
    >
      <PaginationContent data-testid="list">
        <PaginationPrevious>{props.previousLabel}</PaginationPrevious>
        <PaginationItems />
        <PaginationNext>{props.nextLabel}</PaginationNext>
      </PaginationContent>
    </Pagination>
  );
}

/** Hand-written items: three pages, one gap, custom classes. */
export function Manual() {
  return (
    <Pagination pageCount={30} defaultPage={2}>
      <PaginationContent>
        <PaginationItem page={1} class="rounded-full" itemProps={{ "data-testid": "li-1" }}>
          1
        </PaginationItem>
        <PaginationItem page={2} size="icon-sm">
          2
        </PaginationItem>
        <PaginationEllipsis data-testid="gap" />
        <PaginationItem page={30}>30</PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/** A custom render function for the slots. */
export function CustomSlots() {
  return (
    <Pagination pageCount={5} defaultPage={3}>
      <PaginationContent>
        <PaginationItems>
          {(item: number | string) =>
            typeof item === "number" ? (
              <PaginationItem page={item}>P{item}</PaginationItem>
            ) : (
              <PaginationEllipsis>...</PaginationEllipsis>
            )
          }
        </PaginationItems>
      </PaginationContent>
    </Pagination>
  );
}

/** The standalone link for hand-written navigation. */
export function Links() {
  return (
    <Pagination pageCount={3}>
      <PaginationContent>
        <li>
          <PaginationLink href="/page/1" isActive>
            1
          </PaginationLink>
        </li>
        <li>
          <PaginationLink href="/page/2" size="sm" class="px-6">
            2
          </PaginationLink>
        </li>
        <li>
          <PaginationLink as="button" aria-label="Go to page 3">
            3
          </PaginationLink>
        </li>
      </PaginationContent>
    </Pagination>
  );
}
