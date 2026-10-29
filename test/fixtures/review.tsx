import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export function Slides(props: Record<string, unknown>) {
  return (
    <Carousel aria-label="Featured" data-testid="carousel" {...props}>
      <CarouselContent>
        <CarouselItem>One</CarouselItem>
        <CarouselItem>Two</CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}

export function Group(props: Record<string, unknown>) {
  return (
    <InputGroup>
      <InputGroupInput aria-label="Link" />
      <InputGroupAddon data-testid="addon" {...props}>
        https://
      </InputGroupAddon>
    </InputGroup>
  );
}

import { ChartContainer, ChartLine } from "@/components/ui/chart";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export function Chart(props: { initialWidth: number }) {
  return (
    <ChartContainer config={{ sales: { label: "Sales" } }} initialWidth={props.initialWidth}>
      <ChartLine
        data={[
          { month: "Jan", sales: 3 },
          { month: "Feb", sales: 5 },
        ]}
        xKey="month"
        series={["sales"]}
      />
    </ChartContainer>
  );
}

export function Split(props: { onLayout: (sizes: number[]) => void }) {
  return (
    <ResizablePanelGroup direction="horizontal" onLayout={props.onLayout}>
      <ResizablePanel defaultSize={50}>A</ResizablePanel>
      <ResizableHandle data-testid="handle" />
      <ResizablePanel defaultSize={50}>B</ResizablePanel>
    </ResizablePanelGroup>
  );
}

import { useSignal } from "@shadow-js/core";
import { For } from "@shadow-js/web";
import { CarouselIndicators } from "@/components/ui/carousel";

export function Dynamic(props: { setApi: (api: unknown) => void }) {
  const [items, setItems] = useSignal(["a", "b", "c"]);
  return (
    <div>
      <button type="button" data-testid="drop" onClick={() => setItems((list) => list.slice(0, -1))}>
        drop
      </button>
      <button type="button" data-testid="add" onClick={() => setItems((list) => [...list, "n"])}>
        add
      </button>
      <button type="button" data-testid="swap" onClick={() => setItems(["x", "y"])}>
        swap
      </button>
      <Carousel aria-label="Dynamic" setApi={props.setApi as never}>
        <CarouselContent>
          <For each={items()}>{(item) => <CarouselItem>{item}</CarouselItem>}</For>
        </CarouselContent>
        <CarouselIndicators />
      </Carousel>
    </div>
  );
}
