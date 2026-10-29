import { useSignal } from "@shadow-js/core";
import { Show } from "@shadow-js/web";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

/** Three panels around a middle one that comes and goes after the first render. */
export function Dynamic(props: {
  setMiddle: (set: (shown: boolean) => void) => void;
  onLayout?: (sizes: number[]) => void;
}) {
  const [middle, setMiddle] = useSignal(false);
  props.setMiddle(setMiddle);
  return (
    <ResizablePanelGroup direction="horizontal" onLayout={props.onLayout}>
      <ResizablePanel defaultSize={50} minSize={10} data-testid="a">
        A
      </ResizablePanel>
      <ResizableHandle data-testid="h1" />
      <Show when={middle()}>
        <ResizablePanel defaultSize={20} minSize={10} data-testid="m">
          M
        </ResizablePanel>
        <ResizableHandle data-testid="h2" />
      </Show>
      <ResizablePanel defaultSize={50} minSize={10} data-testid="b">
        B
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

/** A group that remembers its layout, with bounds on the panels. */
export function Saved() {
  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="bounded">
      <ResizablePanel defaultSize={50} minSize={20} maxSize={70} data-testid="a">
        A
      </ResizablePanel>
      <ResizableHandle data-testid="h1" />
      <ResizablePanel defaultSize={50} minSize={30} data-testid="b">
        B
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
