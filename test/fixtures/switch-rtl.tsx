import { Switch } from "@/components/ui/switch";

const label = "تفعيل الإشعارات";

export function Arabic() {
  return (
    <div>
      <Switch data-testid="switch" aria-label={label} />
    </div>
  );
}
