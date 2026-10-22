import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/ui/progress";

const caption = "التقدم";

export function Arabic() {
  return (
    <Progress data-testid="meter" value={40} max={100}>
      <div>
        <ProgressLabel>{caption}</ProgressLabel>
        <ProgressValue />
      </div>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}

export function ArabicDigits() {
  return (
    <Progress data-testid="meter" lang="ar" value={40} max={100}>
      <div>
        <ProgressLabel>{caption}</ProgressLabel>
        <ProgressValue />
      </div>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}
