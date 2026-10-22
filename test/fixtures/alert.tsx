import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "@/components/ui/icons";

export function Demo(props: { variant?: "default" | "destructive"; icon?: boolean }) {
  return (
    <Alert variant={props.variant} data-testid="alert">
      {props.icon === false ? null : <TriangleAlertIcon />}
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app.</AlertDescription>
    </Alert>
  );
}

export function WithAction() {
  return (
    <Alert data-testid="action-alert">
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>Restart to apply it.</AlertDescription>
      <AlertAction class="end-4">
        <button type="button">Restart</button>
      </AlertAction>
    </Alert>
  );
}

export function Custom() {
  return (
    <Alert class="px-8" aria-live="polite" id="a">
      <AlertTitle class="font-bold">T</AlertTitle>
      <AlertDescription class="text-base">D</AlertDescription>
    </Alert>
  );
}
