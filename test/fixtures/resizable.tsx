import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export function Basic(props: Record<string, unknown>) {
  return (
    <ResizablePanelGroup data-testid="group" direction="horizontal" {...props}>
      <ResizablePanel defaultSize={30} minSize={20} data-testid="left">
        Files
      </ResizablePanel>
      <ResizableHandle withHandle data-testid="handle" />
      <ResizablePanel defaultSize={70} data-testid="right">
        Editor
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export function Handled(props: { onKeyDown?: (event: KeyboardEvent) => void }) {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={20}>
        Files
      </ResizablePanel>
      <ResizableHandle data-testid="handle" onKeyDown={props.onKeyDown} />
      <ResizablePanel defaultSize={70}>Editor</ResizablePanel>
    </ResizablePanelGroup>
  );
}

export function Stacked() {
  return (
    <ResizablePanelGroup direction="vertical" autoSaveId="stack-test">
      <ResizablePanel defaultSize={50}>Top</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>Bottom</ResizablePanel>
    </ResizablePanelGroup>
  );
}

/** The group with the shadcn name for the layout direction. */
export function Oriented(props: { orientation?: "horizontal" | "vertical" }) {
  return (
    <ResizablePanelGroup data-testid="group" orientation={props.orientation}>
      <ResizablePanel defaultSize={50} data-testid="first">
        Top
      </ResizablePanel>
      <ResizableHandle data-testid="handle" />
      <ResizablePanel defaultSize={50}>Bottom</ResizablePanel>
    </ResizablePanelGroup>
  );
}

/** The same group inside a wrapper with `dir="rtl"`; the group gets no dir prop. */
export function InRtlWrapper() {
  return (
    <div dir="rtl">
      <ResizablePanelGroup data-testid="group" direction="horizontal">
        <ResizablePanel defaultSize={30} minSize={20} data-testid="left">
          Files
        </ResizablePanel>
        <ResizableHandle data-testid="handle" />
        <ResizablePanel defaultSize={70} data-testid="right">
          Editor
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

/** Every part is given a ref by the application. */
export function WithRefs(props: {
  groupRef: (node: HTMLElement) => void;
  panelRef: (node: HTMLElement) => void;
  handleRef: (node: HTMLElement) => void;
}) {
  return (
    <ResizablePanelGroup direction="horizontal" ref={props.groupRef}>
      <ResizablePanel defaultSize={30} minSize={20} data-testid="left" ref={props.panelRef}>
        Files
      </ResizablePanel>
      <ResizableHandle data-testid="handle" ref={props.handleRef} />
      <ResizablePanel defaultSize={70} data-testid="right">
        Editor
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
