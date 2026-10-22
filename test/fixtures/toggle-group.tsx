import { useSignal } from "@shadow-js/core";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = Record<string, unknown>;

/** Three formatting toggles; "underline" is disabled. */
export function Multiple(props: Props) {
  return (
    <ToggleGroup type="multiple" aria-label="Text style" {...props}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline" disabled>
        U
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

/** Three alignment toggles, one pressed at most. */
export function Single(props: Props) {
  return (
    <ToggleGroup type="single" aria-label="Alignment" {...props}>
      <ToggleGroupItem value="left" aria-label="Left">
        L
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center" size="lg" variant="default">
        C
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right" class="px-6">
        R
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function Controlled() {
  const [value, setValue] = useSignal("left");
  return (
    <div>
      <ToggleGroup type="single" aria-label="Alignment" value={value()} onValueChange={(next: string) => setValue(next)}>
        <ToggleGroupItem value="left" aria-label="Left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right">
          R
        </ToggleGroupItem>
      </ToggleGroup>
      <button type="button" onClick={() => setValue("right")}>
        right
      </button>
      <output>{value()}</output>
    </div>
  );
}

/** A single group with the shadcn spacing and orientation, and outline items. */
export function Spaced(props: { spacing?: number; orientation?: "horizontal" | "vertical" }) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      aria-label="Alignment"
      spacing={props.spacing}
      orientation={props.orientation}
    >
      <ToggleGroupItem value="left" aria-label="Left">
        L
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center">
        C
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right">
        R
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
