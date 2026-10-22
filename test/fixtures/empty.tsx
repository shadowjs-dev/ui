import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SearchIcon } from "@/components/ui/icons";

export function Basic() {
  return (
    <Empty data-testid="empty">
      <EmptyHeader>
        <EmptyMedia variant="icon" data-testid="media">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>
          Try <a href="/reset">another search</a>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Clear filters</Button>
      </EmptyContent>
    </Empty>
  );
}

/** A title made a level-2 heading by the application, as the item's docs advise. */
export function Heading() {
  return (
    <Empty data-testid="heading-empty">
      <EmptyHeader>
        <EmptyTitle role="heading" aria-level={2}>
          No projects
        </EmptyTitle>
        <EmptyDescription>Create one to get started.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function Plain() {
  return (
    <Empty class="p-2" data-testid="plain">
      <EmptyTitle>Nothing</EmptyTitle>
    </Empty>
  );
}
