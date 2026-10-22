import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const first = "يسار";
const second = "وسط";

export function Arabic() {
  return (
    <ToggleGroup data-testid="group" type="single" defaultValue="a">
      <ToggleGroupItem value="a" aria-label={first}>
        {first}
      </ToggleGroupItem>
      <ToggleGroupItem value="b" aria-label={second}>
        {second}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
