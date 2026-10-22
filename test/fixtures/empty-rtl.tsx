import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** An Arabic empty state with an icon tile, a heading, a description with a link, and an action, in a right-to-left document. */
export function Rtl() {
  return (
    <div dir="rtl">
      <Empty data-testid="root">
        <EmptyHeader data-testid="header">
          <EmptyMedia variant="icon" data-testid="media">
            <span>ب</span>
          </EmptyMedia>
          <EmptyTitle role="heading" aria-level={2} data-testid="title">
            لا توجد نتائج
          </EmptyTitle>
          <EmptyDescription data-testid="description">
            جرّب بحثاً مختلفاً أو <a href="#reset">أعد ضبط المرشحات</a>.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent data-testid="actions">
          <button type="button">إنشاء عنصر</button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
