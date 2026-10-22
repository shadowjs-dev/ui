import { useSignal } from "@shadow-js/core";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Basic() {
  return (
    <div>
      <Textarea placeholder="Type here" rows={3} />
      <Textarea aria-label="Invalid" aria-invalid="true" />
      <Textarea aria-label="Off" disabled />
      <Textarea aria-label="Custom" class="min-h-32 border-red-500" />
    </div>
  );
}

export function Labeled() {
  return (
    <div>
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" value="hello" />
    </div>
  );
}

export function Controlled() {
  const [text, setText] = useSignal("");
  return (
    <div>
      <Textarea
        aria-label="Message"
        value={text()}
        onInput={(event: Event) => setText((event.target as HTMLTextAreaElement).value)}
      />
      <output>{text().length}</output>
    </div>
  );
}
