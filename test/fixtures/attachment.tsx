import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";

export function States() {
  return (
    <div>
      {(["idle", "uploading", "processing", "error", "done"] as const).map((state) => (
        <Attachment state={state} data-testid={state}>
          <AttachmentMedia data-testid={`${state}-media`}>
            <svg viewBox="0 0 1 1" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle data-testid={`${state}-title`}>report.pdf</AttachmentTitle>
            <AttachmentDescription data-testid={`${state}-description`}>PDF</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </div>
  );
}

export function Full(props: { onRemove?: () => void; onOpen?: () => void }) {
  return (
    <Attachment data-testid="card" size="sm">
      <AttachmentMedia variant="image" data-testid="image">
        <img src="/p.png" alt="" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>photo.png</AttachmentTitle>
      </AttachmentContent>
      <AttachmentActions data-testid="actions">
        <AttachmentAction aria-label="Remove photo.png" onClick={props.onRemove}>
          x
        </AttachmentAction>
      </AttachmentActions>
      <AttachmentTrigger aria-label="Preview photo.png" onClick={props.onOpen} data-testid="trigger" />
    </Attachment>
  );
}

export function Layouts() {
  return (
    <div>
      <Attachment orientation="vertical" size="xs" data-testid="vertical" />
      <AttachmentGroup role="group" aria-label="Attachments" tabindex="0" data-testid="group">
        <Attachment class="w-56 shrink-0 snap-start" />
        <Attachment class="w-56 shrink-0 snap-start" />
      </AttachmentGroup>
      <Attachment>
        <AttachmentTrigger as="a" href="/file.pdf" aria-label="Open file.pdf" data-testid="link-trigger" />
      </Attachment>
    </div>
  );
}
