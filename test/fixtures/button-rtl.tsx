import { Button } from "@/components/ui/button";

const SUBMIT = "إرسال";
const MORE = "عرض المزيد";

export function Rtl(props: { onPress?: () => void }) {
  return (
    <div dir="rtl">
      <Button data-testid="submit" onClick={() => props.onPress?.()}>
        {SUBMIT}
      </Button>
      <Button as="a" href="#more" variant="outline" size="sm" data-testid="link">
        {MORE}
      </Button>
    </div>
  );
}
