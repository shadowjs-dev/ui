import { splitProps, useEffect, useSignal } from "@shadow-js/core";
import {
  type CalendarDate,
  type CalendarValue,
  compareDates,
  formatDate,
  parseDateInput,
  useControllableState,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { Button } from "@/components/ui/button";
import { Calendar, isCalendarDay } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/** A calendar glyph for the trigger, inline so the kit needs no icon package. @internal */
function CalendarGlyph(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-4"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

/**
 * Props of {@link DatePicker}: the day (controlled or uncontrolled), the locale and the limits, and the
 * field's own attributes such as `id` and `aria-describedby`.
 * @see {@link DatePicker}
 * @since 1.0.0
 */
export interface DatePickerProps {
  /**
   * The chosen day. Setting it controls the picker; `undefined` means the picker is uncontrolled.
   * @default none
   */
  readonly value?: CalendarDate | undefined;
  /**
   * The day when the picker is uncontrolled.
   * @default none
   */
  readonly defaultValue?: CalendarDate | undefined;
  /**
   * Called with the day when the user picks a day or types a valid one, and with `undefined` when the
   * field is cleared.
   * @default none
   */
  readonly onValueChange?: ((value: CalendarDate | undefined) => void) | undefined;
  /**
   * A BCP 47 tag, such as `"de-DE"`. It sets the format of the typed date and the language and week
   * start of the calendar.
   * @default "en-US"
   */
  readonly locale?: string | undefined;
  /**
   * The earliest day that can be typed or picked.
   * @default none
   */
  readonly min?: CalendarDate | undefined;
  /**
   * The latest day that can be typed or picked.
   * @default none
   */
  readonly max?: CalendarDate | undefined;
  /**
   * The text shown while the field is empty.
   * @default "MM/DD/YYYY"
   */
  readonly placeholder?: string | undefined;
  /**
   * Reading direction of the calendar. The popover opens in a portal, so a `dir` attribute on an ancestor of the field
   * does not reach it: by default the calendar takes the direction of the nearest ancestor `dir` attribute of the field.
   * @default the nearest ancestor `dir` of the field, else inherited from `DirectionProvider` or the document
   */
  readonly dir?: "ltr" | "rtl" | undefined;
  /**
   * The accessible name of the calendar button. Translate it for another language.
   * @default "Open calendar"
   */
  readonly triggerLabel?: string | undefined;
  /**
   * Marks the field invalid from outside, for example a required field left empty. A typed date that
   * does not exist marks it invalid too.
   * @default false
   */
  readonly invalid?: boolean | undefined;
  /**
   * The id of the element that describes the field, such as an error message. It is set on the field,
   * so a screen reader reads the message with it.
   * @default none
   */
  readonly "aria-describedby"?: string | undefined;
  /**
   * Disables the field and the calendar button.
   * @default false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The id of the field. Point a `Label` at it with `htmlFor`.
   * @default none
   */
  readonly id?: string | undefined;
  /**
   * The name under which the typed date is submitted with a form.
   * @default none
   */
  readonly name?: string | undefined;
  /**
   * Classes for the wrapper around the field and the button.
   * @default none
   */
  readonly class?: string | undefined;
}

/**
 * The code point of zero in each script whose ten digits are consecutive: ASCII, Arabic-Indic (used by
 * `ar-EG`), Persian, Devanagari, Bengali, Thai and the others a date can be written in. @internal
 */
const DIGIT_ZEROS: readonly number[] = [
  0x30, 0x660, 0x6f0, 0x7c0, 0x966, 0x9e6, 0xa66, 0xae6, 0xb66, 0xbe6, 0xc66, 0xce6, 0xd66, 0xde6,
  0xe50, 0xed0, 0xf20, 0x1040, 0x1090, 0x17e0, 0x1810, 0xff10,
];

/**
 * The text with every digit written as ASCII. Locales such as `ar-EG` format with Arabic-Indic digits,
 * and the parser reads ASCII digits only; any other character is kept as it is. @internal
 */
function asciiDigits(text: string): string {
  return [...text]
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      const zero = DIGIT_ZEROS.find((start) => code >= start && code <= start + 9);
      return zero === undefined ? char : String(code - zero);
    })
    .join("");
}

/** Whether a typed day is inside the allowed range. @internal */
function inBounds(
  day: CalendarDate,
  min: CalendarDate | undefined,
  max: CalendarDate | undefined,
): boolean {
  if (min !== undefined && compareDates(day, min) < 0) return false;
  if (max !== undefined && compareDates(day, max) > 0) return false;
  return true;
}

/**
 * A text field for a day, with a calendar button that opens a calendar in a popover. Typing reads the
 * day in the locale's format, or in ISO form (`2026-03-05`), when the field loses focus or Enter is
 * pressed. A day that does not exist, or that is outside `min` or `max`, marks the field invalid and is
 * not taken. Picking a day in the calendar fills the field and closes the popover. Use it for a date
 * that people type; the calendar is there for picking.
 *
 * Keyboard and ARIA: the field is a text input with `inputmode="numeric"`, and Enter reads the typed
 * date without submitting a surrounding form. Name it with a `Label` (`htmlFor` pointing at the `id`).
 * An invalid field has `aria-invalid="true"`, and `aria-describedby` points at your error message. The
 * calendar button is a native button named by `triggerLabel` (default "Open calendar"): Enter or Space
 * opens the calendar and moves focus into it, Escape or a press outside closes it. Inside the calendar,
 * the arrow keys move between days, PageUp and PageDown move a month, and Enter or Space picks the
 * focused day. Shift with PageUp or PageDown moves a year.
 *
 * shadcn/ui differences: shadcn's date picker is usually a button that shows the chosen date. This one
 * is a typed text field with a calendar button next to it, so a user can type a date or pick one. `class`
 * replaces `className`, and the parts have `data-slot` values (`date-picker`, `date-picker-input` and
 * `date-picker-trigger`).
 *
 * @param props The picker props: see {@link DatePickerProps}.
 * @returns The field and its calendar button.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { DatePicker } from "@/components/ui/date-picker";
 * import { Label } from "@/components/ui/label";
 *
 * export function DueDate() {
 *   const [due, setDue] = useSignal<{ year: number; month: number; day: number } | undefined>(
 *     undefined,
 *   );
 *   return (
 *     <>
 *       <Label htmlFor="due">Due date</Label>
 *       <DatePicker id="due" value={due()} onValueChange={setDue} />
 *     </>
 *   );
 * }
 * @see {@link DatePickerProps}
 * @since 1.0.0
 */
function DatePicker(props: DatePickerProps): JSX.Element {
  const [local, rest] = splitProps(props as DatePickerProps & Record<string, unknown>, [
    "value",
    "defaultValue",
    "onValueChange",
    "locale",
    "min",
    "max",
    "placeholder",
    "triggerLabel",
    "invalid",
    "disabled",
    "id",
    "name",
    "class",
    "dir",
  ]);
  const t = useUiStrings();
  let root: HTMLElement | undefined;
  // The calendar is built when the popover opens, so this reads the field's surroundings at that moment.
  const direction = (): "ltr" | "rtl" | undefined => {
    if (local.dir === "ltr" || local.dir === "rtl") return local.dir;
    const own = root?.closest("[dir]")?.getAttribute("dir");
    return own === "ltr" || own === "rtl" ? own : undefined;
  };
  const locale = (local.locale as string | undefined) ?? "en-US";
  const [day, setDay] = useControllableState<CalendarDate | undefined>({
    value: () => local.value as CalendarDate | undefined,
    defaultValue: () => local.defaultValue as CalendarDate | undefined,
    onChange: () => {
      const callback = local.onValueChange as
        | ((value: CalendarDate | undefined) => void)
        | undefined;
      return callback === undefined ? undefined : (next) => callback(next);
    },
    name: "DatePicker value",
  });
  const [text, setText] = useSignal<string>(
    day() === undefined ? "" : formatDate(locale, day() as CalendarDate),
  );
  const [invalid, setInvalid] = useSignal(false);
  const [open, setOpen] = useSignal(false);

  // The field shows the day the app holds, so a day set from outside (a controlled value that changes,
  // or a locale switch) replaces the text, and an invalid typed text is cleared with it.
  useEffect(() => {
    const current = day();
    const tag = (local.locale as string | undefined) ?? "en-US";
    setText(current === undefined ? "" : formatDate(tag, current));
    setInvalid(false);
  });

  const commitText = (): void => {
    const trimmed = text().trim();
    if (trimmed === "") {
      setInvalid(false);
      if (day() !== undefined) setDay(undefined);
      return;
    }
    const parsed = parseDateInput(asciiDigits(trimmed), locale);
    if (
      parsed === undefined ||
      !inBounds(
        parsed,
        local.min as CalendarDate | undefined,
        local.max as CalendarDate | undefined,
      )
    ) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setDay(parsed);
    setText(formatDate(locale, parsed));
  };

  const pick = (next: CalendarValue): void => {
    if (!isCalendarDay(next)) return;
    setDay(next);
    setText(formatDate(locale, next));
    setInvalid(false);
    setOpen(false);
  };

  return (
    <div
      ref={(element: HTMLElement) => {
        root = element;
      }}
      data-slot="date-picker"
      class={cn("relative flex w-full max-w-xs gap-2", local.class as string | undefined)}
    >
      <Input
        id={local.id as string | undefined}
        name={local.name as string | undefined}
        data-slot="date-picker-input"
        inputmode="numeric"
        autocomplete="off"
        placeholder={(local.placeholder as string | undefined) ?? "MM/DD/YYYY"}
        value={text()}
        disabled={local.disabled === true}
        aria-invalid={invalid() || local.invalid === true ? "true" : undefined}
        onInput={(event: Event) => {
          setText((event.currentTarget as HTMLInputElement).value);
          setInvalid(false);
        }}
        onBlur={commitText}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitText();
          }
        }}
        {...rest}
      />
      <Popover open={open()} onOpenChange={setOpen}>
        <PopoverTrigger
          as={Button}
          variant="outline"
          size="icon"
          aria-label={
            (local.triggerLabel as string | undefined) ?? t("datePicker.open", "Open calendar")
          }
          data-slot="date-picker-trigger"
          disabled={local.disabled === true}
        >
          <CalendarGlyph />
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="end">
          {/* The calendar is built when the popover opens, so its selection starts from the field's day and
              stays its own until it closes: a controlled value that is sometimes undefined would warn. */}
          <Calendar
            mode="single"
            locale={locale}
            dir={direction()}
            defaultValue={day()}
            min={local.min as CalendarDate | undefined}
            max={local.max as CalendarDate | undefined}
            defaultMonth={day() ?? (local.min as CalendarDate | undefined)}
            onValueChange={pick}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { DatePicker };
