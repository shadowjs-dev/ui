import {
  Attachment,
  AttachmentActions,
  AttachmentAction,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

const title = "تقرير.pdf";
const description = "ملف PDF، ٢٫٤ ميغابايت";
const remove = "إزالة تقرير.pdf";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <AttachmentGroup data-testid="group">
        <Attachment data-testid="card">
          <AttachmentMedia>
            <svg viewBox="0 0 1 1" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{title}</AttachmentTitle>
            <AttachmentDescription>{description}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions data-testid="actions">
            <AttachmentAction aria-label={remove}>x</AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </AttachmentGroup>
    </div>
  );
}
