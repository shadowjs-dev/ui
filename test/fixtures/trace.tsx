import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

export function Lines() {
  return (
    <Trace data-testid="trace">
      {(["running", "error", "pending", undefined] as const).map((status) => (
        <TraceLine status={status} data-testid={status ?? "done"}>
          <TraceIcon data-testid={`${status ?? "done"}-icon`}>
            <svg viewBox="0 0 1 1" />
          </TraceIcon>
          <TraceTitle data-testid={`${status ?? "done"}-title`}>Step</TraceTitle>
          <TraceDescription>2 of 5</TraceDescription>
        </TraceLine>
      ))}
    </Trace>
  );
}

export function Expandable(props: { keepMounted?: boolean; defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <Trace>
      <TraceCollapsible defaultOpen={props.defaultOpen} open={props.open} onOpenChange={props.onOpenChange} data-testid="row">
        <TraceCollapsibleTrigger data-testid="trigger">
          <TraceLine>
            <TraceTitle>Ran node --version</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent keepMounted={props.keepMounted} data-testid="content">
          v24.18.0
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
