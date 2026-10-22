import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

/** A right-to-left group: the first panel sits on the right, the handle is labeled in Arabic. */
export function Rtl() {
  return (
    <div dir="rtl" lang="ar">
      <ResizablePanelGroup data-testid="group" direction="horizontal" dir="rtl">
        <ResizablePanel defaultSize={30} minSize={20} data-testid="first">
          <span data-testid="count">٣</span> ملفات
        </ResizablePanel>
        <ResizableHandle withHandle data-testid="handle" aria-label="تغيير حجم اللوحات" />
        <ResizablePanel defaultSize={70} data-testid="second">
          المحرر
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
