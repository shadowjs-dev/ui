import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function Demo() {
  return <Spinner data-testid="spinner" />;
}

export function Sized() {
  return <Spinner class="size-8 text-red-500" aria-label="Saving" />;
}

export function InButton() {
  return (
    <Button disabled>
      <Spinner />
      Please wait
    </Button>
  );
}
