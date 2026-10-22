import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

/** A right-to-left preview card: the trigger and the card text are Arabic. */
export function Rtl() {
  return (
    <div dir="rtl" lang="ar">
      <HoverCard>
        <HoverCardTrigger href="/shadow" data-testid="trigger">
          مؤلف
        </HoverCardTrigger>
        <HoverCardContent data-testid="content">
          <p>٣ مشاريع مفتوحة</p>
          <a href="/more">المزيد</a>
        </HoverCardContent>
      </HoverCard>
      <button type="button" data-testid="outside">
        خارج
      </button>
    </div>
  );
}
