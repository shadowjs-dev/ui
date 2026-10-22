import type { BadgeProps } from "@/components/ui/badge";
import type { ButtonProps } from "@/components/ui/button";
import type { CalendarProps } from "@/components/ui/calendar";
import type {
  ChartPolarProps,
  ChartSeriesProps,
  ChartTooltipContentProps,
} from "@/components/ui/chart";
import type { DialogContentExtraProps } from "@/components/ui/dialog";
import type { FormApiLike, FormControlRenderProps } from "@/components/ui/form";
import type { PasswordInputProps, PasswordStrengthProps } from "@/components/ui/password-input";
import type { SelectContentProps, SelectTriggerProps } from "@/components/ui/select";
import type { SidebarProviderProps } from "@/components/ui/sidebar";
import type { TabsListOwnProps } from "@/components/ui/tabs";
import type { UiStringsProviderProps, UiTranslate } from "@/lib/ui-strings";
import type { Equal, Expect } from "./support";

export type ButtonVariantCheck = Expect<
  Equal<
    NonNullable<ButtonProps["variant"]>,
    "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  >
>;

export type ButtonSizeCheck = Expect<
  Equal<
    NonNullable<ButtonProps["size"]>,
    "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
  >
>;

export type BadgeVariantCheck = Expect<
  Equal<
    NonNullable<BadgeProps["variant"]>,
    "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
  >
>;

export type SelectTriggerSizeCheck = Expect<
  Equal<NonNullable<SelectTriggerProps["size"]>, "sm" | "default">
>;

export type SelectContentPositionCheck = Expect<
  Equal<NonNullable<SelectContentProps["position"]>, "popper" | "item-aligned">
>;

export type TabsListVariantCheck = Expect<
  Equal<NonNullable<TabsListOwnProps["variant"]>, "default" | "line">
>;

export type DialogCloseButtonCheck = Expect<
  Equal<NonNullable<DialogContentExtraProps["showCloseButton"]>, boolean>
>;

export type CalendarCaptionCheck = Expect<
  Equal<NonNullable<CalendarProps["captionLayout"]>, "label" | "dropdown">
>;

export type CalendarYearRangeCheck = Expect<Equal<NonNullable<CalendarProps["yearRange"]>, number>>;

// The polymorphic `as` prop changes the element, so anchor attributes such as href become valid.
export const buttonAsLink: ButtonProps<"a"> = { as: "a", href: "/docs", variant: "link" };

// @ts-expect-error "primary" is not a button variant
export const invalidButtonVariant: ButtonProps = { variant: "primary" };

// @ts-expect-error "huge" is not a button size
export const invalidButtonSize: ButtonProps = { size: "huge" };

// @ts-expect-error badges have no size prop
export const badgeWithSize: BadgeProps = { size: "sm" };

// @ts-expect-error "lg" is not a select trigger size
export const invalidSelectSize: SelectTriggerProps = { size: "lg" };

// @ts-expect-error "fixed" is not a select content position
export const invalidSelectPosition: SelectContentProps = { position: "fixed" };

// @ts-expect-error "pill" is not a tabs list variant
export const invalidTabsVariant: TabsListOwnProps = { variant: "pill" };

// @ts-expect-error showCloseButton takes a boolean, not a string
export const invalidCloseButton: DialogContentExtraProps = { showCloseButton: "yes" };

// @ts-expect-error "month" is not a calendar caption layout
export const invalidCaptionLayout: CalendarProps = { captionLayout: "month" };

export type TooltipIndicatorCheck = Expect<
  Equal<NonNullable<ChartTooltipContentProps["indicator"]>, "dot" | "line" | "dashed">
>;

export type ChartCurveCheck = Expect<
  Equal<NonNullable<ChartSeriesProps["curve"]>, "linear" | "monotone" | "step">
>;

export type ChartGridCheck = Expect<Equal<NonNullable<ChartSeriesProps["grid"]>, boolean | "both">>;

export type ChartInnerRadiusCheck = Expect<
  Equal<ChartPolarProps["innerRadius"], number | undefined>
>;

export type SidebarCookieCheck = Expect<
  Equal<SidebarProviderProps["cookieName"], string | undefined>
>;

export type PasswordHintCheck = Expect<
  Equal<PasswordInputProps["capsLockHint"], boolean | undefined>
>;

export type StrengthScoreCheck = Expect<
  Equal<ReturnType<NonNullable<PasswordStrengthProps["evaluate"]>>, 0 | 1 | 2 | 3 | 4>
>;

export type RenderSetValueCheck = Expect<
  Equal<FormControlRenderProps["setValue"], (value: unknown) => void>
>;

export type StringsTranslateCheck = Expect<
  Equal<
    UiTranslate,
    (key: string, fallback: string, values?: Readonly<Record<string, string | number>>) => string
  >
>;

// A provider takes a pack, or a translate function, or both.
export const arabicProvider: UiStringsProviderProps = {
  strings: { dialog: { close: "x" } },
  locale: "ar",
};

// @ts-expect-error a form needs fieldAt and handleSubmit
export const incompleteForm: FormApiLike = { handleSubmit: () => undefined };
