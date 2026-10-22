import {
  Form,
  FormControl,
  FormDescription,
  FormErrorSummary,
  FormField,
  type FormApiLike,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UiStringsProvider } from "@/lib/ui-strings";

/** An Arabic email field in a right-to-left document, with a description and an error shown once touched. */
export function Rtl() {
  return (
    <div dir="rtl">
      <FormField
        name="email"
        field={{ value: "", error: "أدخل بريداً إلكترونياً صحيحاً", touched: true }}
      >
        <FormItem data-testid="item">
          <FormLabel data-testid="label">البريد الإلكتروني</FormLabel>
          <FormControl as={Input} type="email" data-testid="control" />
          <FormDescription data-testid="description">لن نشاركه مع أحد.</FormDescription>
          <FormMessage data-testid="message" />
        </FormItem>
      </FormField>
    </div>
  );
}

/** The same field before the user touches it: the error is held back, so no message renders. */
export function Idle() {
  return (
    <div dir="rtl">
      <FormField name="email" field={{ value: "", error: "أدخل بريداً إلكترونياً صحيحاً", touched: false }}>
        <FormItem data-testid="item">
          <FormLabel data-testid="label">البريد الإلكتروني</FormLabel>
          <FormControl as={Input} type="email" data-testid="control" />
          <FormDescription data-testid="description">لن نشاركه مع أحد.</FormDescription>
          <FormMessage data-testid="message" />
        </FormItem>
      </FormField>
    </div>
  );
}

/** An Arabic form in a right-to-left document, with Arabic words for the summary. */
export function RtlSummary(props: { form: FormApiLike }) {
  return (
    <UiStringsProvider
      locale="ar"
      strings={{
        form: {
          errorSummary: {
            title:
              "{count, plural, zero {لا مشاكل} one {هناك مشكلة واحدة في النموذج} two {هناك مشكلتان في النموذج} few {هناك # مشاكل في النموذج} many {هناك # مشكلة في النموذج} other {هناك # مشكلة في النموذج}}",
            item: "{label}: {message}",
          },
        },
      }}
    >
      <div dir="rtl" lang="ar">
        <Form form={props.form} data-testid="form">
          <FormErrorSummary data-testid="summary" />
          <FormField name="email">
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl as={Input} type="email" />
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField name="name">
            <FormItem>
              <FormLabel>الاسم</FormLabel>
              <FormControl as={Input} />
              <FormMessage />
            </FormItem>
          </FormField>
          <button type="submit">إرسال</button>
        </Form>
      </div>
    </UiStringsProvider>
  );
}
