import { Kbd, KbdGroup } from "@/components/ui/kbd";

const hint = "اضغط";
const arabicKey = "ك";
const digitKey = "٣";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <p>
        <KbdGroup data-testid="group">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>
    </div>
  );
}

export function Arabic() {
  return (
    <div dir="rtl" data-testid="root">
      <p>{hint}</p>
      <KbdGroup data-testid="group">
        <Kbd>{arabicKey}</Kbd>
        <Kbd>{digitKey}</Kbd>
      </KbdGroup>
    </div>
  );
}
