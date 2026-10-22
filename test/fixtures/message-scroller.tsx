import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

export function Thread() {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller data-testid="frame" class="h-96">
        <MessageScrollerViewport data-testid="viewport">
          <MessageScrollerContent data-testid="content">
            <MessageScrollerItem messageId="q" scrollAnchor data-testid="row">
              Question
            </MessageScrollerItem>
            <MessageScrollerItem messageId="a">Answer</MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton data-testid="end" />
        <MessageScrollerButton direction="start" data-testid="start" />
        <MessageScrollerButton data-testid="custom">Latest</MessageScrollerButton>
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
