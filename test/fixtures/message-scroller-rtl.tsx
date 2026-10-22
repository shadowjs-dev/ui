import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { UiStringsProvider } from "@/lib/ui-strings";

const strings = { messageScroller: { label: "الرسائل", toEnd: "الانتقال إلى أحدث رسالة", toStart: "الانتقال إلى البداية" } };

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <UiStringsProvider strings={strings} locale="ar">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport data-testid="viewport">
              <MessageScrollerContent>
                <MessageScrollerItem messageId="1">مرحبا</MessageScrollerItem>
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton data-testid="end" />
          </MessageScroller>
        </MessageScrollerProvider>
      </UiStringsProvider>
    </div>
  );
}
