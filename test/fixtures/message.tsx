import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message";

export function Thread() {
  return (
    <div>
      <Message align="end" data-testid="mine">
        <MessageContent data-testid="mine-content">
          <Bubble align="end" variant="muted">
            <BubbleContent>How do I add a dialog?</BubbleContent>
          </Bubble>
          <MessageFooter data-testid="mine-footer">Read</MessageFooter>
        </MessageContent>
      </Message>
      <Message data-testid="theirs">
        <MessageAvatar data-testid="avatar">
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader data-testid="header">Ada</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>Install Dialog first.</BubbleContent>
          </Bubble>
          <MessageFooter data-testid="footer">
            <button type="button" aria-label="Copy">
              c
            </button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}

export function Group() {
  return (
    <MessageGroup data-testid="group">
      <Message>
        <MessageAvatar data-testid="empty-avatar" />
        <MessageContent>One</MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>Two</MessageContent>
      </Message>
    </MessageGroup>
  );
}
