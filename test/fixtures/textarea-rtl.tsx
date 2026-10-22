import { Textarea } from "@/components/ui/textarea";

const placeholder = "اكتب رسالتك هنا";
const value = "مرحبا ٢٠٢٦";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Textarea data-testid="field" placeholder="Your message" />
    </div>
  );
}

export function Arabic() {
  return (
    <div>
      <Textarea data-testid="field" placeholder={placeholder} value={value} />
    </div>
  );
}
