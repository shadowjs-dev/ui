import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TITLE = "بطاقة الفوترة";
const DESCRIPTION = "إدارة طرق الدفع";
const ACTION = "تعديل";
const BODY = "الرصيد الحالي";
const FOOTER = "حفظ";

export function Rtl() {
  return (
    <div dir="rtl">
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>{TITLE}</CardTitle>
          <CardDescription>{DESCRIPTION}</CardDescription>
          <CardAction data-testid="card-action">
            <Button size="sm" variant="outline">
              {ACTION}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>{BODY}</CardContent>
        <CardFooter>{FOOTER}</CardFooter>
      </Card>
    </div>
  );
}
