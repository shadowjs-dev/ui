import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export function Basic(props: { onAddonClick?: () => void }) {
  return (
    <InputGroup data-testid="group">
      <InputGroupAddon data-testid="prefix" onClick={props.onAddonClick}>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Domain" />
      <InputGroupAddon align="inline-end" data-testid="suffix">
        <InputGroupButton aria-label="Clear">Clear</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function Blocks() {
  return (
    <InputGroup>
      <InputGroupAddon align="block-start" data-testid="top">
        <InputGroupText>Message</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea aria-label="Body" />
      <Button size="sm">Send</Button>
    </InputGroup>
  );
}

/** One button in a group, with the size and variant the test asks for. */
export function Sizes(props: {
  size?: "xs" | "sm" | "icon-xs" | "icon-sm";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}) {
  return (
    <InputGroup>
      <InputGroupInput aria-label="Search" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Action" data-testid="action" size={props.size} variant={props.variant}>
          Go
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
