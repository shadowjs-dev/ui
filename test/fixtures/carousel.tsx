import { useSignal } from "@shadow-js/core";
import {
  Carousel,
  CarouselContent,
  CarouselIndicators,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function Basic(props: Record<string, unknown>) {
  return (
    <Carousel aria-label="Featured" data-testid="carousel" {...props}>
      <CarouselContent>
        <CarouselItem>One</CarouselItem>
        <CarouselItem>Two</CarouselItem>
        <CarouselItem>Three</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselIndicators />
    </Carousel>
  );
}

export function Vertical() {
  return (
    <Carousel orientation="vertical" aria-label="Stack" class="h-40">
      <CarouselContent>
        <CarouselItem>A</CarouselItem>
        <CarouselItem>B</CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}

/** Autoplay is switched on and off by a button after mount. */
export function Live() {
  const [delay, setDelay] = useSignal<number | undefined>(undefined);
  return (
    <div>
      <Carousel aria-label="Featured" autoplay={delay()}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>
      <button type="button" onClick={() => setDelay(1000)}>
        Autoplay on
      </button>
      <button type="button" onClick={() => setDelay(undefined)}>
        Autoplay off
      </button>
    </div>
  );
}

/** The same carousel inside a wrapper with `dir="rtl"`; the carousel gets no dir prop. */
export function InRtlWrapper() {
  return (
    <div dir="rtl">
      <Carousel aria-label="Featured" data-testid="carousel">
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}
