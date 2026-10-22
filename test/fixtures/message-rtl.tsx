import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "@/components/ui/message";

const name = "آدا";
const text = "مرحبًا، كيف يمكنني مساعدتك؟";
const read = "تمت القراءة";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Message data-testid="theirs">
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>آ</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>{name}</MessageHeader>
          <p>{text}</p>
          <MessageFooter data-testid="footer">{read}</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end" data-testid="mine">
        <MessageContent>
          <p>{text}</p>
        </MessageContent>
      </Message>
    </div>
  );
}
