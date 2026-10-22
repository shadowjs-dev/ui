import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const TITLE = "تنبيه";
const BODY = "يمكنك إضافة مكونات إلى تطبيقك.";
const ACTION = "إغلاق";

export function Rtl(props: { withAction?: boolean }) {
  return (
    <div dir="rtl">
      <Alert data-testid="alert">
        <svg aria-hidden="true" viewBox="0 0 24 24" />
        <AlertTitle>{TITLE}</AlertTitle>
        <AlertDescription>{BODY}</AlertDescription>
        {props.withAction ? (
          <AlertAction data-testid="action-alert">
            <Button size="sm" variant="outline">
              {ACTION}
            </Button>
          </AlertAction>
        ) : null}
      </Alert>
    </div>
  );
}
