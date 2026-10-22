import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble";

const question = "كيف أضيف نافذة حوار؟";
const reply = "استخدم المكوّن Dialog.";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Bubble align="end" variant="muted" data-testid="mine">
        <BubbleContent data-testid="question">{question}</BubbleContent>
        <BubbleReactions data-testid="reactions">2</BubbleReactions>
      </Bubble>
      <Bubble data-testid="theirs">
        <BubbleContent>{reply}</BubbleContent>
      </Bubble>
    </div>
  );
}
