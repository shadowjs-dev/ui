import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function For() {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" />
    </div>
  );
}

export function Wrapping() {
  return (
    <Label data-testid="wrapping">
      Name
      <Input />
    </Label>
  );
}

export function Peer() {
  return (
    <div>
      <Input id="peer" class="peer" disabled />
      <Label htmlFor="peer" class="text-red-500 gap-4">
        Disabled field
      </Label>
    </div>
  );
}

/** A label pointing at a native checkbox, so a click on the label activates the control. */
export function ForCheckbox() {
  return (
    <div>
      <input id="news" type="checkbox" />
      <Label htmlFor="news">Send me the newsletter</Label>
    </div>
  );
}

export function AsSpan() {
  return (
    <Label as="span" id="title">
      Section
    </Label>
  );
}
