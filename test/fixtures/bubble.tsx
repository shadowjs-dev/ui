import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";

export function Variants() {
  return (
    <div>
      {(["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"] as const).map((variant) => (
        <Bubble variant={variant} data-testid={variant}>
          <BubbleContent data-testid={`${variant}-content`}>{variant}</BubbleContent>
        </Bubble>
      ))}
    </div>
  );
}

export function Aligned() {
  return (
    <BubbleGroup data-testid="group">
      <Bubble align="end" variant="muted" data-testid="end">
        <BubbleContent>Mine</BubbleContent>
        <BubbleReactions role="img" aria-label="2 people liked this" data-testid="reactions">
          2
        </BubbleReactions>
      </Bubble>
      <Bubble data-testid="start">
        <BubbleContent as="button" type="button" data-testid="button">
          Suggestion
        </BubbleContent>
        <BubbleReactions side="top" align="start" data-testid="top-reactions">
          1
        </BubbleReactions>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent as="a" href="/x" data-testid="link">
          Link
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  );
}
