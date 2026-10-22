import { Badge } from "@/components/ui/badge";

const LABEL = "جديد";

export function Rtl() {
  return (
    <div dir="rtl">
      <Badge data-testid="badge">{LABEL}</Badge>
      <Badge as="a" href="#new" data-testid="link-badge">
        {LABEL}
      </Badge>
    </div>
  );
}
