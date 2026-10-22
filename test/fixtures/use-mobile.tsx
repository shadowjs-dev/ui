import { Show } from "@shadow-js/web";
import { useIsMobile } from "@/hooks/use-mobile";

export function Probe() {
  const isMobile = useIsMobile();
  return (
    <p data-testid="probe">
      <Show when={isMobile()} fallback="desktop">
        mobile
      </Show>
    </p>
  );
}

export function Pair() {
  const first = useIsMobile();
  const second = useIsMobile();
  return (
    <p data-testid="pair">
      {String(first())}/{String(second())}
    </p>
  );
}
