import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";

export function Survey(props: { onSubmit?: (event: Event) => void }) {
  return (
    <Questionnaire data-testid="form" onSubmit={props.onSubmit}>
      <QuestionnaireProgress data-testid="progress" />
      <QuestionnaireItem name="color" required data-testid="color">
        <QuestionnaireTitle data-testid="title">Pick a color</QuestionnaireTitle>
        <QuestionnaireDescription data-testid="description">Choose one.</QuestionnaireDescription>
        <QuestionnaireChoices data-testid="choices">
          <QuestionnaireChoice value="red" data-testid="red">Red</QuestionnaireChoice>
          <QuestionnaireChoice value="blue" data-testid="blue">Blue</QuestionnaireChoice>
          <QuestionnaireInput aria-label="Another color" data-testid="other" />
        </QuestionnaireChoices>
        <QuestionnaireError data-testid="error" />
      </QuestionnaireItem>
      <QuestionnaireItem name="note" data-testid="note">
        <QuestionnaireTitle>Anything else?</QuestionnaireTitle>
        <QuestionnaireInput aria-label="Note" />
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions data-testid="actions">
        <QuestionnairePrevious data-testid="previous" />
        <QuestionnaireSkip data-testid="skip" />
        <QuestionnaireNext data-testid="next" />
        <QuestionnaireSubmit data-testid="submit" />
      </QuestionnaireActions>
    </Questionnaire>
  );
}
