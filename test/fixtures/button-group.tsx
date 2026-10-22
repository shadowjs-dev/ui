import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";

export function Basic() {
  return (
    <ButtonGroup aria-label="Alignment" data-testid="group">
      <ButtonGroupText>Align</ButtonGroupText>
      <Button variant="outline">Left</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  );
}

export function Vertical() {
  return (
    <ButtonGroup orientation="vertical" data-testid="stack">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  );
}

export function Stacked() {
  return (
    <ButtonGroup orientation="vertical" data-testid="stacked">
      <Button variant="outline">Top</Button>
      <ButtonGroupSeparator orientation="horizontal" data-testid="divider" />
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  );
}

export function Linked() {
  return (
    <ButtonGroup aria-label="Sort">
      <ButtonGroupText as="a" href="/sort" data-testid="linked">
        Sort by
      </ButtonGroupText>
      <Button variant="outline">Date</Button>
    </ButtonGroup>
  );
}

export function Custom() {
  return (
    <ButtonGroup class="gap-4" data-testid="custom">
      <Button>One</Button>
    </ButtonGroup>
  );
}
