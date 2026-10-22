import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { SearchIcon } from "@/components/ui/icons";

export function Basic() {
  return (
    <ItemGroup aria-label="Files">
      <Item variant="outline" data-testid="one">
        <ItemMedia variant="icon" data-testid="media">
          <SearchIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Report.pdf</ItemTitle>
          <ItemDescription>2 MB</ItemDescription>
        </ItemContent>
        <ItemActions>
          <button type="button">Open</button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item size="sm" as="a" href="/notes" data-testid="link">
        <ItemContent>
          <ItemTitle>Notes</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  );
}

export function Custom() {
  return (
    <Item class="p-8" data-testid="custom">
      <ItemContent>
        <ItemTitle>Padded</ItemTitle>
      </ItemContent>
    </Item>
  );
}

export function Standalone() {
  return (
    <div>
      <ItemSeparator />
    </div>
  );
}

export function Variants() {
  return (
    <div>
      <Item variant="muted" data-testid="muted">
        <ItemMedia variant="image" data-testid="image">
          <img src="/cover.png" alt="" />
        </ItemMedia>
      </Item>
    </div>
  );
}
