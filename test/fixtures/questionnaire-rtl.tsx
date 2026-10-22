import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import { UiStringsProvider } from "@/lib/ui-strings";

const strings = {
  questionnaire: {
    next: "التالي",
    optional: "أجب عن هذا السؤال، أو تخطَّه، للمتابعة.",
    previous: "السابق",
    progress: "السؤال {current} من {total}",
    progressLabel: "تقدم الاستبيان",
    required: "أجب عن هذا السؤال للمتابعة.",
    skip: "تخطَّ",
    submit: "إرسال",
  },
};

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <UiStringsProvider strings={strings} locale="ar">
        <Questionnaire dir="rtl">
          <QuestionnaireProgress data-testid="progress" />
          <QuestionnaireItem name="color" required>
            <QuestionnaireTitle>اختر لونا</QuestionnaireTitle>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="red" data-testid="red">أحمر</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError data-testid="error" />
          </QuestionnaireItem>
          <QuestionnaireItem name="note">
            <QuestionnaireTitle>ملاحظة</QuestionnaireTitle>
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnairePrevious data-testid="previous" />
            <QuestionnaireSkip data-testid="skip" />
            <QuestionnaireNext data-testid="next" />
            <QuestionnaireSubmit data-testid="submit" />
          </QuestionnaireActions>
        </Questionnaire>
      </UiStringsProvider>
    </div>
  );
}
