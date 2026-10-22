import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, REGEXP_ONLY_DIGITS, REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS_AND_CHARS } from "@/components/ui/input-otp";

export function Patterns() { return [REGEXP_ONLY_DIGITS, REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS_AND_CHARS]; }

export function Custom(props: { pattern?: string; value?: string; defaultValue?: string; onChange?: (value: string) => void; onComplete?: (value: string) => void; disabled?: boolean; dir?: "ltr" | "rtl" }) {
  return <form data-testid="form"><InputOTP maxLength={4} pattern={props.pattern} value={props.value} defaultValue={props.defaultValue} onChange={props.onChange} onComplete={props.onComplete} disabled={props.disabled} dir={props.dir} name="code" aria-label="Code">
    <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup>
  </InputOTP></form>;
}

export function Basic(props: { dir?: "ltr" | "rtl" } = {}) {
  return (
    <InputOTP maxLength={6} dir={props.dir} aria-label="Code" data-testid="otp">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

export function Alphanumeric(props: { onComplete?: (value: string) => void }) {
  return (
    <InputOTP maxLength={4} type="alphanumeric" aria-label="Key" onComplete={props.onComplete} class="gap-1">
      <InputOTPGroup>
        <InputOTPSlot index={0} aria-invalid="true" />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  );
}
