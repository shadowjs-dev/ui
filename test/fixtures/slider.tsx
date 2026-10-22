import { useSignal } from "@shadow-js/core";
import { Slider } from "@/components/ui/slider";

type Props = Record<string, unknown>;

/** A one-thumb slider; every Slider prop can be passed through `props`. */
export function Single(props: Props) {
  return <Slider aria-label="Volume" data-testid="slider" {...props} />;
}

/** A range slider with named thumbs. */
export function Range(props: Props) {
  return (
    <Slider
      aria-label="Price"
      defaultValue={[20, 80]}
      thumbLabels={["Minimum price", "Maximum price"]}
      data-testid="slider"
      {...props}
    />
  );
}

export function Controlled() {
  const [value, setValue] = useSignal<number[]>([30]);
  return (
    <div>
      <Slider
        aria-label="Level"
        value={value()}
        onValueChange={(next: number[]) => setValue(next)}
        data-testid="slider"
      />
      <button type="button" onClick={() => setValue([75])}>
        set
      </button>
      <output>{value().join(",")}</output>
    </div>
  );
}

export function InForm() {
  return (
    <form data-testid="form">
      <Slider aria-label="Volume" name="volume" defaultValue={[40]} />
      <button type="reset">reset</button>
    </form>
  );
}
