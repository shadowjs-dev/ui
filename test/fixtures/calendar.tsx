import { Calendar } from "@/components/ui/calendar";

export function Basic(props: Record<string, unknown>) {
  return <Calendar data-testid="calendar" defaultMonth={{ year: 2026, month: 3 }} {...props} />;
}

export function Dropdown() {
  return <Calendar data-testid="calendar" defaultMonth={{ year: 2026, month: 3 }} captionLayout="dropdown" />;
}

/** The month and year select, with the navigation names supplied by the app (another language). */
export function Localized() {
  return (
    <Calendar
      data-testid="calendar"
      defaultMonth={{ year: 2026, month: 3 }}
      captionLayout="dropdown"
      labels={{ previousMonth: "الشهر السابق", nextMonth: "الشهر التالي", month: "الشهر", year: "السنة" }}
    />
  );
}
