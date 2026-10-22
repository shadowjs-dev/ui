import { Marker, MarkerContent, MarkerIcon, markerVariants } from "@/components/ui/marker";

export function Variants() {
  return (
    <div>
      <Marker data-testid="default">
        <MarkerIcon data-testid="icon">
          <svg viewBox="0 0 1 1" />
        </MarkerIcon>
        <MarkerContent data-testid="content">Checking the logs...</MarkerContent>
      </Marker>
      <Marker variant="border" data-testid="border">
        <MarkerContent>Ada joined</MarkerContent>
      </Marker>
      <Marker variant="separator" data-testid="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
    </div>
  );
}

export function Interactive() {
  return (
    <div>
      <Marker as="button" type="button" data-testid="button">
        <MarkerContent>Restore</MarkerContent>
      </Marker>
      <Marker as="a" href="/thread" data-testid="link">
        <MarkerContent>Open thread</MarkerContent>
      </Marker>
      <Marker role="status" data-testid="status">
        <MarkerContent class="shimmer">Thinking...</MarkerContent>
      </Marker>
      <p data-testid="plain" class={markerVariants({ variant: "border" })}>
        Plain
      </p>
    </div>
  );
}
