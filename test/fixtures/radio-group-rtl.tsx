import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const small = "صغير";
const large = "كبير";

export function Arabic() {
  return (
    <RadioGroup data-testid="group" defaultValue="small">
      <RadioGroupItem value="small" aria-label={small} />
      <RadioGroupItem value="large" aria-label={large} />
    </RadioGroup>
  );
}
