import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/ui/progress";

type Props = Record<string, unknown>;

export function Demo(props: Props) {
  return <Progress aria-label="Upload" {...props} />;
}

export function Rtl(props: Props) {
  return (
    <div dir="rtl">
      <Progress aria-label="Upload" {...props} />
    </div>
  );
}

export function Reactive(props: { value: number }) {
  return <Progress aria-label="Upload" value={props.value} />;
}

export function Composable(props: Props) {
  return (
    <Progress dir="rtl" {...props}>
      <ProgressLabel>Upload</ProgressLabel>
      <ProgressValue />
      <ProgressTrack class="h-4">
        <ProgressIndicator class="bg-red-200" />
      </ProgressTrack>
    </Progress>
  );
}
