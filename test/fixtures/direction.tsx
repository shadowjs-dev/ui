import { type Accessor, useSignal } from "@shadow-js/core";
import { DirectionProvider, useDirection } from "@/components/ui/direction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Reader(props: { id: string }) {
  const dir = useDirection();
  return <span data-testid={props.id}>{dir()}</span>;
}

export function Nested() {
  return (
    <div>
      <Reader id="outside" />
      <DirectionProvider dir="rtl">
        <Reader id="rtl" />
        <DirectionProvider direction="ltr">
          <Reader id="inner" />
        </DirectionProvider>
      </DirectionProvider>
      <DirectionProvider dir="rtl" direction="ltr">
        <Reader id="both" />
      </DirectionProvider>
    </div>
  );
}

export function Reactive(props: { dir: Accessor<"ltr" | "rtl"> }) {
  return (
    <DirectionProvider dir={props.dir()}>
      <Reader id="value" />
    </DirectionProvider>
  );
}

export function Controlled() {
  const [dir, setDir] = useSignal<"ltr" | "rtl">("ltr");
  return (
    <div>
      <button type="button" data-testid="flip" onClick={() => setDir("rtl")}>
        flip
      </button>
      <DirectionProvider dir={dir()}>
        <Reader id="live" />
      </DirectionProvider>
    </div>
  );
}

export function TabsInProvider() {
  return (
    <DirectionProvider dir="rtl">
      <Tabs defaultValue="one">
        <TabsList aria-label="Pages" data-testid="list">
          <TabsTrigger value="one" data-testid="one">
            One
          </TabsTrigger>
          <TabsTrigger value="two" data-testid="two">
            Two
          </TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>
    </DirectionProvider>
  );
}
