import { splitProps } from "@shadow-js/core";
import {
  type CalendarDate,
  Calendar as CalendarPrimitive,
  type CalendarProps as CalendarPrimitiveProps,
  type CalendarValue,
  useCalendar,
} from "@shadow-js/primitives";
import type { JSX } from "@shadow-js/web";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/**
 * Props of {@link Calendar}: every prop of the primitive (`mode`, `value`, `onValueChange`, `min`,
 * `max`, `disabled`, `locale`, `weekStartsOn`, `defaultMonth`, `today`, `dir`, `timeZone`), plus the props this
 * component adds: `captionLayout`, `yearRange` and `labels`. With `captionLayout="dropdown"` a month
 * select and a year select replace the caption.
 * @since 1.0.0
 * @see {@link Calendar}
 */
export type CalendarProps = CalendarPrimitiveProps & {
  /**
   * `"label"` shows the month name in the caption. `"dropdown"` shows a month select and a year
   * select instead.
   * @default "label"
   */
  readonly captionLayout?: "label" | "dropdown" | undefined;
  /**
   * How many years on either side of the shown year the year select lists.
   * @default 10
   */
  readonly yearRange?: number | undefined;
  /** The names of the controls, for a language other than English. See {@link CalendarLabels}. */
  readonly labels?: CalendarLabels | undefined;
};

/**
 * The names of the calendar's controls, for a language other than English. Each name is optional,
 * and the English default is used for any name you leave out.
 * @since 1.0.0
 * @see {@link CalendarProps}
 */
export interface CalendarLabels {
  /**
   * The accessible name of the previous-month button.
   * @default "Previous month"
   */
  readonly previousMonth?: string | undefined;
  /**
   * The accessible name of the next-month button.
   * @default "Next month"
   */
  readonly nextMonth?: string | undefined;
  /**
   * The accessible name of the month select in the dropdown layout.
   * @default "Month"
   */
  readonly month?: string | undefined;
  /**
   * The accessible name of the year select in the dropdown layout.
   * @default "Year"
   */
  readonly year?: string | undefined;
}

/** The month names of a locale, from `Intl` (January first). @internal */
function monthNames(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
  return Array.from({ length: 12 }, (_, index) =>
    format.format(new Date(Date.UTC(2000, index, 15))),
  );
}

/** The previous and next month buttons and the caption (or the selects). @internal */
function CalendarHeader(props: {
  readonly layout: "label" | "dropdown";
  readonly yearRange: number;
  readonly labels: CalendarLabels | undefined;
}): JSX.Element {
  const calendar = useCalendar("Calendar");
  const t = useUiStrings();
  const shown = calendar.month;
  const months = monthNames(calendar.locale);
  const years = (): number[] => {
    const center = shown().year;
    return Array.from(
      { length: props.yearRange * 2 + 1 },
      (_, index) => center - props.yearRange + index,
    );
  };
  const jumpTo = (year: number, month: number): void => {
    const current = shown();
    calendar.navigate((year - current.year) * 12 + (month - current.month));
  };
  return (
    <div data-slot="calendar-header" class="relative flex items-center justify-center pt-1">
      <Button
        data-slot="calendar-previous"
        variant="outline"
        size="icon"
        class="absolute start-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        aria-label={props.labels?.previousMonth ?? t("calendar.previousMonth", "Previous month")}
        onClick={() => calendar.navigate(-1)}
        disabled={!calendar.canGoPrevious()}
      >
        <ChevronLeftIcon class="rtl:-scale-x-100" />
      </Button>
      {props.layout === "dropdown" ? (
        <div data-slot="calendar-dropdowns" class="flex items-center gap-1 text-sm font-medium">
          <select
            aria-label={props.labels?.month ?? t("calendar.month", "Month")}
            data-slot="calendar-month-select"
            class="h-7 rounded-md border border-input bg-transparent px-2 text-sm"
            value={String(shown().month)}
            onChange={(event: Event) =>
              jumpTo(shown().year, Number((event.currentTarget as HTMLSelectElement).value))
            }
          >
            {months.map((name, index) => (
              <option value={index + 1}>{name}</option>
            ))}
          </select>
          <select
            aria-label={props.labels?.year ?? t("calendar.year", "Year")}
            data-slot="calendar-year-select"
            class="h-7 rounded-md border border-input bg-transparent px-2 text-sm"
            value={String(shown().year)}
            onChange={(event: Event) =>
              jumpTo(Number((event.currentTarget as HTMLSelectElement).value), shown().month)
            }
          >
            {years().map((year) => (
              <option value={year}>{year}</option>
            ))}
          </select>
          <div
            id={calendar.captionId()}
            aria-live="polite"
            data-slot="calendar-caption"
            class="sr-only"
          >
            {calendar.caption()}
          </div>
        </div>
      ) : (
        <div
          id={calendar.captionId()}
          aria-live="polite"
          data-slot="calendar-caption"
          class="text-sm font-medium"
        >
          {calendar.caption()}
        </div>
      )}
      <Button
        data-slot="calendar-next"
        variant="outline"
        size="icon"
        class="absolute end-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        aria-label={props.labels?.nextMonth ?? t("calendar.nextMonth", "Next month")}
        onClick={() => calendar.navigate(1)}
        disabled={!calendar.canGoNext()}
      >
        <ChevronRightIcon class="rtl:-scale-x-100" />
      </Button>
    </div>
  );
}

/** The weekday header and the weeks, as a grid. @internal */
function CalendarGrid(): JSX.Element {
  const calendar = useCalendar("Calendar");
  return (
    <table
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a calendar grid is the WAI-ARIA grid pattern on a real table
      role="grid"
      data-slot="calendar-grid"
      aria-labelledby={calendar.captionId()}
      aria-multiselectable={calendar.mode === "single" ? undefined : true}
      class="w-full border-collapse"
    >
      <thead>
        <tr>
          {calendar.weekdays().map((label) => (
            <th
              scope="col"
              abbr={label.long}
              class="w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground"
            >
              {label.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {calendar.weeks().map((week) => (
          <tr role="row" class="mt-2">
            {week.map((day: CalendarDate) => (
              <CalendarDayCell date={day} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * One day of the grid: the primitive's `gridcell` with this kit's look. It shows the day number and
 * styles the selection, the range, today, the days of another month and the focus ring. It is used
 * by {@link Calendar} for every day; use it directly only when you build your own grid.
 *
 * Keyboard and ARIA: the focused day is the only one in the tab order. Enter and Space select it,
 * and the arrow keys, PageUp and PageDown, and Home and End move the focus. It carries
 * `aria-selected`, `aria-disabled` and `aria-current="date"` for today.
 *
 * @param props - The day props: `date`, a `{ year, month, day }` value.
 * @returns The day cell element.
 * @example
 * ```tsx
 * import { CalendarDayCell } from "@/components/ui/calendar";
 *
 * export function March5() {
 *   return <CalendarDayCell date={{ year: 2026, month: 3, day: 5 }} />;
 * }
 * ```
 * @since 1.0.0
 * @see {@link Calendar}
 */
function CalendarDayCell(props: { readonly date: CalendarDate }): JSX.Element {
  return (
    <CalendarPrimitive.Day
      date={props.date}
      data-slot="calendar-day"
      class={cn(
        "relative size-8 p-0 text-center text-sm select-none outline-none",
        "[&>span]:flex [&>span]:size-8 [&>span]:items-center [&>span]:justify-center [&>span]:rounded-md [&>span]:font-normal",
        "data-[outside]:text-muted-foreground data-[disabled]:opacity-50 data-[today]:bg-accent data-[today]:text-accent-foreground",
        "data-[range=middle]:bg-accent data-[range=middle]:text-accent-foreground",
        "data-[selected]:bg-primary data-[selected]:text-primary-foreground",
        "focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        "forced-colors:data-[selected]:bg-[Highlight] forced-colors:data-[selected]:text-[HighlightText]",
      )}
    >
      <span>{props.date.day}</span>
    </CalendarPrimitive.Day>
  );
}

/**
 * A month of days to pick from: one day, several days, or a range (`mode`, default `"single"`).
 * It has month navigation, or a month and a year select with `captionLayout="dropdown"`, and it
 * follows the locale's names and week start. There is no date library: the dates are plain
 * `{ year, month, day }` values.
 *
 * Keyboard and ARIA: the days form a `role="grid"`, named by the caption in the default label
 * layout. Only the focused day is in the tab order. Left and Right move one day (swapped in
 * right-to-left layouts), Up and Down move a week, PageUp and PageDown move a month (with Shift, a
 * year), and Home and End move to the first and last day of the week. Enter and Space select the
 * focused day. Each day is a `gridcell` with `aria-selected` and `aria-disabled`. The caption is
 * `aria-live="polite"`, so a month change is announced. The previous and next buttons are named
 * "Previous month" and "Next month" unless you pass `labels`. A `mode` other than `"single"` sets
 * `aria-multiselectable` on the grid.
 *
 * Compared with shadcn/ui: the selection is `value` and `onValueChange` (not `selected` and
 * `onSelect`), and the dates are plain `{ year, month, day }` objects, not `Date` values. `class`
 * replaces `className`, and `labels` is a ShadowJS prop for the control names.
 *
 * @param props - The calendar props: see {@link CalendarProps}.
 * @returns The calendar element.
 * @example
 * ```tsx
 * import { Calendar } from "@/components/ui/calendar";
 *
 * export function Picker() {
 *   return (
 *     <Calendar
 *       mode="range"
 *       defaultMonth={{ year: 2026, month: 3 }}
 *       captionLayout="dropdown"
 *     />
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link CalendarProps}
 * @see {@link CalendarDayCell}
 * @see {@link isCalendarDay}
 */
function Calendar(props: CalendarProps): JSX.Element {
  const [local, rest] = splitProps(props as CalendarProps & { readonly class?: unknown }, [
    "class",
    "captionLayout",
    "yearRange",
    "labels",
  ]);
  return (
    <CalendarPrimitive
      data-slot="calendar"
      class={cn("group/calendar bg-background p-3", local.class as string | undefined)}
      {...rest}
    >
      <CalendarHeader
        layout={(local.captionLayout as "label" | "dropdown" | undefined) ?? "label"}
        yearRange={(local.yearRange as number | undefined) ?? 10}
        labels={local.labels as CalendarLabels | undefined}
      />
      <div class="mt-4">
        <CalendarGrid />
      </div>
    </CalendarPrimitive>
  );
}

/**
 * Narrows a {@link CalendarValue} to a single day. Use it in `onValueChange` of a single-day
 * calendar, where the value is one `{ year, month, day }` date.
 *
 * @param value - The selection to check.
 * @returns `true` when `value` is one day, so it can be used as a {@link CalendarDate}.
 * @example
 * ```tsx
 * import { useSignal } from "@shadow-js/core";
 * import type { CalendarDate } from "@shadow-js/primitives";
 * import { Calendar, isCalendarDay } from "@/components/ui/calendar";
 *
 * export function DatePick() {
 *   const [date, setDate] = useSignal<CalendarDate | undefined>(undefined);
 *   return (
 *     <Calendar
 *       value={date()}
 *       onValueChange={(value) => {
 *         if (isCalendarDay(value)) setDate(value);
 *       }}
 *     />
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Calendar}
 */
function isCalendarDay(value: CalendarValue): value is CalendarDate {
  return typeof value === "object" && value !== null && "day" in value;
}

export { Calendar, CalendarDayCell, isCalendarDay };
