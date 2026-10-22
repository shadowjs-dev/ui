import { PasswordInput, PasswordStrength } from "@/components/ui/password-input";
import { UiStringsProvider } from "@/lib/ui-strings";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <PasswordInput data-testid="field" placeholder="Password" />
    </div>
  );
}

/** An Arabic field with the meter and the Caps Lock hint, with Arabic words from the provider. */
export function RtlExtras() {
  return (
    <UiStringsProvider
      locale="ar"
      strings={{
        password: {
          show: "إظهار كلمة المرور",
          capsLock: "مفتاح الأحرف الكبيرة مفعّل",
          strength: "قوة كلمة المرور",
          level: { "0": "ضعيفة جداً", "1": "ضعيفة", "2": "مقبولة", "3": "جيدة", "4": "قوية" },
        },
      }}
    >
      <div dir="rtl" lang="ar" data-testid="root">
        <label for="ar-pw">كلمة المرور</label>
        <PasswordInput id="ar-pw" data-testid="field">
          <PasswordStrength />
        </PasswordInput>
      </div>
    </UiStringsProvider>
  );
}
