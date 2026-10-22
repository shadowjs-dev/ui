import { splitProps } from "@shadow-js/core";
import {
  type PolymorphicTarget,
  type QuestionnaireChoiceInputProps,
  type QuestionnaireChoiceProps,
  type QuestionnaireChoicesProps,
  type QuestionnaireDescriptionProps,
  type QuestionnaireErrorProps,
  type QuestionnaireInputProps,
  type QuestionnaireItemProps,
  type QuestionnaireNextProps,
  type QuestionnaireOwnProps,
  type QuestionnairePreviousProps,
  Questionnaire as QuestionnairePrimitive,
  type QuestionnaireProgressProps,
  type QuestionnaireSkipProps,
  type QuestionnaireSubmitProps,
  type QuestionnaireTitleProps,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { Button } from "@/components/ui/button";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * A multi-step form: one question shows at a time, with progress, checks and the keys to answer quickly. It handles the showing question, the answers' status, validation, progress
 * and the move from one question to the next. The card, dialog or page around it handles closing, saving and sending. Answers are native form values: read them with `FormData` in `onSubmit`.
 * Its words ("Question 2 of 5", the errors, the buttons) come from the kit's strings.
 *
 * Keyboard and ARIA: Tab moves between answers and buttons; the arrow keys move between answers and, outside a field, between questions; Enter continues; Cmd or Ctrl with Enter submits from the last
 * question; with `shortcuts` a letter or number picks an answer. Each question is a `fieldset` with a `legend`, and the progress is a named `progressbar`. See the primitive for the full list.
 *
 * Compared with shadcn/ui: `as` replaces `render`, `class` replaces `className`, and every part has a `data-slot`.
 *
 * @param props - The questionnaire props: `item`, `defaultItem`, `onItemChange`, `shortcuts`, `onSubmit` and the `form` attributes.
 * @returns The form.
 * @example
 * ```tsx
 * import {
 *   Questionnaire,
 *   QuestionnaireActions,
 *   QuestionnaireChoice,
 *   QuestionnaireChoices,
 *   QuestionnaireError,
 *   QuestionnaireItem,
 *   QuestionnaireNext,
 *   QuestionnaireProgress,
 *   QuestionnaireSubmit,
 *   QuestionnaireTitle,
 * } from "@/components/ui/questionnaire";
 *
 * export function Survey() {
 *   return (
 *     <Questionnaire onSubmit={(event) => console.log(new FormData(event.currentTarget as HTMLFormElement))}>
 *       <QuestionnaireProgress />
 *       <QuestionnaireItem name="color" required>
 *         <QuestionnaireTitle>Pick a color</QuestionnaireTitle>
 *         <QuestionnaireChoices>
 *           <QuestionnaireChoice value="red">Red</QuestionnaireChoice>
 *           <QuestionnaireChoice value="blue">Blue</QuestionnaireChoice>
 *         </QuestionnaireChoices>
 *         <QuestionnaireError />
 *       </QuestionnaireItem>
 *       <QuestionnaireActions>
 *         <QuestionnaireNext />
 *         <QuestionnaireSubmit />
 *       </QuestionnaireActions>
 *     </Questionnaire>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireItem}
 * @see {@link QuestionnaireActions}
 */
function Questionnaire(
  props: QuestionnaireOwnProps & Omit<ComponentProps<"form">, keyof QuestionnaireOwnProps>,
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as {
      readonly class?: string;
      readonly messages?: QuestionnaireOwnProps["messages"];
    },
    ["class", "messages"],
  );
  const t = useUiStrings();
  return (
    <QuestionnairePrimitive
      data-slot="questionnaire"
      messages={{
        progress: (current, total) =>
          t("questionnaire.progress", "Question {current} of {total}", { current, total }),
        progressLabel: t("questionnaire.progressLabel", "Questionnaire progress"),
        required: t("questionnaire.required", "Answer this question to continue."),
        optional: t("questionnaire.optional", "Answer this question, or skip it, to continue."),
        ...local.messages,
      }}
      class={cn("flex w-full min-w-0 flex-col gap-5", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * Shows "Question 2 of 5" and a bar that fills as the reader goes. It is a named progress bar, so a screen reader hears the same text. With children you draw your own indicator;
 * the numbers are on the element as `data-current` and `data-total`.
 *
 * Keyboard and ARIA: not focusable; `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and `aria-valuetext`.
 *
 * @param props - The progress props.
 * @returns The progress element.
 * @example
 * ```tsx
 * import { QuestionnaireProgress } from "@/components/ui/questionnaire";
 *
 * export const Progress = <QuestionnaireProgress />;
 * ```
 * @since 1.0.0
 * @see {@link Questionnaire}
 */
function QuestionnaireProgress<T extends PolymorphicTarget = "div">(
  props: QuestionnaireProgressProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <QuestionnairePrimitive.Progress
      data-slot="questionnaire-progress"
      class={cn("text-sm font-medium text-muted-foreground tabular-nums", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * One question. Only the showing question is visible; the others are hidden and inert. `required` removes Skip for it, `multiple` makes the choices checkboxes, `disabled` takes it out of
 * the questionnaire, and `invalid` shows its error from your own validator. `onStatusChange` reports `"unanswered"`, `"answered"` and `"skipped"`.
 *
 * Keyboard and ARIA: a native `fieldset` named by its title and described by its description and, while invalid, its error; `aria-invalid` while invalid.
 *
 * @param props - The item props: `name`, `required`, `multiple`, `disabled`, `invalid`, `onStatusChange` and the `fieldset` attributes.
 * @returns The fieldset.
 * @example
 * ```tsx
 * import { QuestionnaireItem, QuestionnaireTitle } from "@/components/ui/questionnaire";
 *
 * export const Question = (
 *   <QuestionnaireItem name="size" required>
 *     <QuestionnaireTitle>Pick a size</QuestionnaireTitle>
 *   </QuestionnaireItem>
 * );
 * ```
 * @since 1.0.0
 * @see {@link Questionnaire}
 */
function QuestionnaireItem<T extends PolymorphicTarget = "fieldset">(
  props: QuestionnaireItemProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <QuestionnairePrimitive.Item
      data-slot="questionnaire-item"
      class={cn("m-0 flex min-w-0 flex-col gap-3 border-0 p-0 outline-none", local.class)}
      {...(rest as QuestionnaireItemProps<"fieldset">)}
    />
  );
}

/**
 * The question, as the legend of the item's fieldset. Write it as a complete sentence: it is the name of the group of answers for assistive technology.
 *
 * Keyboard and ARIA: no keys; it names the item.
 *
 * @param props - The legend attributes and `class`.
 * @returns The title.
 * @example
 * ```tsx
 * import { QuestionnaireTitle } from "@/components/ui/questionnaire";
 *
 * export const Title = <QuestionnaireTitle>What should we build next?</QuestionnaireTitle>;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireItem}
 */
function QuestionnaireTitle<T extends PolymorphicTarget = "legend">(
  props: QuestionnaireTitleProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <QuestionnairePrimitive.Title
      data-slot="questionnaire-title"
      class={cn("text-base font-semibold text-balance", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * Helper text under the question, read with it by a screen reader.
 *
 * Keyboard and ARIA: no keys; linked to the item with `aria-describedby`.
 *
 * @param props - The paragraph attributes and `class`.
 * @returns The description.
 * @example
 * ```tsx
 * import { QuestionnaireDescription } from "@/components/ui/questionnaire";
 *
 * export const Help = <QuestionnaireDescription>Choose one.</QuestionnaireDescription>;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireItem}
 */
function QuestionnaireDescription<T extends PolymorphicTarget = "p">(
  props: QuestionnaireDescriptionProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <QuestionnairePrimitive.Description
      data-slot="questionnaire-description"
      class={cn("-mt-1 text-sm text-muted-foreground", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * The answers of a question: the fixed choices and an optional free-text input, stacked.
 *
 * Keyboard and ARIA: no role and no keys.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The container.
 * @example
 * ```tsx
 * import { QuestionnaireChoices } from "@/components/ui/questionnaire";
 *
 * export const Answers = <QuestionnaireChoices />;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireChoice}
 */
function QuestionnaireChoices<T extends PolymorphicTarget = "div">(
  props: QuestionnaireChoicesProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <QuestionnairePrimitive.Choices
      data-slot="questionnaire-choices"
      class={cn("flex flex-col gap-2", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * One fixed answer: a bordered row with a native radio (or checkbox, in a `multiple` question), its text, and the key that picks it when the questionnaire has shortcuts.
 * Plain children are the text; put several pieces in it for a title and a description.
 *
 * Keyboard and ARIA: native radio and checkbox behavior; Space picks it, and the whole row is the click target. The input has `aria-keyshortcuts` and `aria-invalid`.
 *
 * @param props - The choice props: `value`, `checked`, `defaultChecked`, `disabled`, `onChange` and the `label` attributes.
 * @returns The choice.
 * @example
 * ```tsx
 * import { QuestionnaireChoice } from "@/components/ui/questionnaire";
 *
 * export const Yes = <QuestionnaireChoice value="yes">Yes</QuestionnaireChoice>;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireChoices}
 */
function QuestionnaireChoice<T extends PolymorphicTarget = "label">(
  props: QuestionnaireChoiceProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(
    props as unknown as { readonly class?: string; readonly children?: JSX.Element },
    ["class", "children"],
  );
  return (
    <QuestionnairePrimitive.Choice
      data-slot="questionnaire-choice"
      class={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-accent has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[invalid]:border-destructive motion-reduce:transition-none has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-transparent",
        local.class,
      )}
      {...(rest as QuestionnaireChoiceProps<"label">)}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-slot="questionnaire-choice-input"
        class="mt-0.5 size-4 shrink-0 accent-primary outline-none"
      />
      <QuestionnairePrimitive.ChoiceLabel
        data-slot="questionnaire-choice-label"
        class="flex min-w-0 flex-1 flex-col gap-0.5"
      >
        {local.children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        data-slot="questionnaire-choice-shortcut"
        class="ms-auto inline-flex size-5 shrink-0 items-center justify-center rounded border bg-muted font-mono text-xs text-muted-foreground"
      />
    </QuestionnairePrimitive.Choice>
  );
}

/**
 * A free-text answer beside the fixed choices, in the kit's input style. It is submitted under the item's name. Give it an accessible name (`aria-label`, or a visible label):
 * a placeholder is not a name.
 *
 * Keyboard and ARIA: a native text field; shortcuts and arrow navigation pause while it has focus.
 *
 * @param props - The input props: `type` and the `input` attributes.
 * @returns The input.
 * @example
 * ```tsx
 * import { QuestionnaireInput } from "@/components/ui/questionnaire";
 *
 * export const Other = <QuestionnaireInput aria-label="Another answer" placeholder="Type another answer" />;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireChoices}
 */
function QuestionnaireInput<T extends PolymorphicTarget = "input">(
  props: QuestionnaireInputProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <QuestionnairePrimitive.Input
      data-slot="questionnaire-input"
      class={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[invalid]:border-destructive data-[invalid]:ring-destructive/20 md:text-sm dark:bg-input/30 motion-reduce:transition-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...(rest as object)}
    />
  );
}

/**
 * The message shown when the question is not answered. It is hidden until then, announced when it appears, and linked to the question.
 *
 * Keyboard and ARIA: `role="alert"`; no keys.
 *
 * @param props - The paragraph attributes and `class`.
 * @returns The message, or nothing while valid.
 * @example
 * ```tsx
 * import { QuestionnaireError } from "@/components/ui/questionnaire";
 *
 * export const Problem = <QuestionnaireError />;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireItem}
 */
function QuestionnaireError<T extends PolymorphicTarget = "p">(
  props: QuestionnaireErrorProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as unknown as { readonly class?: string }, ["class"]);
  return (
    <QuestionnairePrimitive.Error
      data-slot="questionnaire-error"
      class={cn("text-sm text-destructive", local.class)}
      {...(rest as object)}
    />
  );
}

/**
 * A row for the buttons: Back and Skip at the start, Next or Submit at the end.
 *
 * Keyboard and ARIA: a plain `div`; the buttons inside are the focus stops.
 *
 * @param props - The `div` attributes and `class`.
 * @returns The row.
 * @example
 * ```tsx
 * import { QuestionnaireActions, QuestionnaireNext } from "@/components/ui/questionnaire";
 *
 * export const Row = (
 *   <QuestionnaireActions>
 *     <QuestionnaireNext />
 *   </QuestionnaireActions>
 * );
 * ```
 * @since 1.0.0
 * @see {@link QuestionnairePrevious}
 */
function QuestionnaireActions(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="questionnaire-actions"
      class={cn("flex items-center gap-2", local.class)}
      {...rest}
    />
  );
}

/**
 * Goes back one question, without checking the answer. Shown from the second question on. With no children it reads "Back".
 *
 * Keyboard and ARIA: a native button; the left arrow (right in right-to-left text) does the same from outside a field.
 *
 * @param props - The button props (`variant` and `size` of {@link Button} too).
 * @returns The button.
 * @example
 * ```tsx
 * import { QuestionnairePrevious } from "@/components/ui/questionnaire";
 *
 * export const Back = <QuestionnairePrevious />;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireActions}
 */
function QuestionnairePrevious<T extends PolymorphicTarget = "button">(
  props: QuestionnairePreviousProps<T> & { readonly variant?: string },
): JSX.Element {
  const t = useUiStrings();
  const [local, rest] = splitProps(
    props as unknown as {
      readonly class?: string;
      readonly children?: JSX.Element;
      readonly variant?: "outline";
    },
    ["class", "children", "variant"],
  );
  return (
    <QuestionnairePrimitive.Previous
      as={Button}
      data-slot="questionnaire-previous"
      variant={local.variant ?? "outline"}
      class={local.class}
      {...(rest as object)}
    >
      {local.children ?? t("questionnaire.previous", "Back")}
    </QuestionnairePrimitive.Previous>
  );
}

/**
 * Skips an optional question on purpose. Shown only while the question is optional. With no children it reads "Skip".
 *
 * Keyboard and ARIA: a native button.
 *
 * @param props - The button props.
 * @returns The button.
 * @example
 * ```tsx
 * import { QuestionnaireSkip } from "@/components/ui/questionnaire";
 *
 * export const Pass = <QuestionnaireSkip />;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireActions}
 */
function QuestionnaireSkip<T extends PolymorphicTarget = "button">(
  props: QuestionnaireSkipProps<T> & { readonly variant?: string },
): JSX.Element {
  const t = useUiStrings();
  const [local, rest] = splitProps(
    props as unknown as {
      readonly class?: string;
      readonly children?: JSX.Element;
      readonly variant?: "ghost";
    },
    ["class", "children", "variant"],
  );
  return (
    <QuestionnairePrimitive.Skip
      as={Button}
      data-slot="questionnaire-skip"
      variant={local.variant ?? "ghost"}
      class={cn("me-auto", local.class)}
      {...(rest as object)}
    >
      {local.children ?? t("questionnaire.skip", "Skip")}
    </QuestionnairePrimitive.Skip>
  );
}

/**
 * Checks the question and goes on; on a question that is not valid it shows the error instead. Shown on every question but the last. With no children it reads "Next".
 *
 * Keyboard and ARIA: a native button; Enter on a picked choice does the same.
 *
 * @param props - The button props.
 * @returns The button.
 * @example
 * ```tsx
 * import { QuestionnaireNext } from "@/components/ui/questionnaire";
 *
 * export const Forward = <QuestionnaireNext />;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireActions}
 */
function QuestionnaireNext<T extends PolymorphicTarget = "button">(
  props: QuestionnaireNextProps<T>,
): JSX.Element {
  const t = useUiStrings();
  const [local, rest] = splitProps(
    props as unknown as { readonly class?: string; readonly children?: JSX.Element },
    ["class", "children"],
  );
  return (
    <QuestionnairePrimitive.Next
      as={Button}
      data-slot="questionnaire-next"
      class={cn("ms-auto", local.class)}
      {...(rest as object)}
    >
      {local.children ?? t("questionnaire.next", "Next")}
    </QuestionnairePrimitive.Next>
  );
}

/**
 * Submits from the last question, after every question has been checked. With no children it reads "Submit".
 *
 * Keyboard and ARIA: a native submit button; Cmd or Ctrl with Enter submits from the last question.
 *
 * @param props - The button props.
 * @returns The button.
 * @example
 * ```tsx
 * import { QuestionnaireSubmit } from "@/components/ui/questionnaire";
 *
 * export const Send = <QuestionnaireSubmit />;
 * ```
 * @since 1.0.0
 * @see {@link QuestionnaireActions}
 */
function QuestionnaireSubmit<T extends PolymorphicTarget = "button">(
  props: QuestionnaireSubmitProps<T>,
): JSX.Element {
  const t = useUiStrings();
  const [local, rest] = splitProps(
    props as unknown as { readonly class?: string; readonly children?: JSX.Element },
    ["class", "children"],
  );
  return (
    <QuestionnairePrimitive.Submit
      as={Button}
      data-slot="questionnaire-submit"
      class={cn("ms-auto", local.class)}
      {...(rest as object)}
    >
      {local.children ?? t("questionnaire.submit", "Submit")}
    </QuestionnairePrimitive.Submit>
  );
}

export type { QuestionnaireChoiceInputProps };
export {
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
};
