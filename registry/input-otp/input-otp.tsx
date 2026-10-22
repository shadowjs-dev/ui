import { splitProps, useMemo } from "@shadow-js/core";
import {
  createOneTimePasswordPattern,
  createPartContext,
  type Direction,
  OneTimePasswordField,
  type OneTimePasswordType,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/** What a code field shares with its slots, to name them. @internal */
interface InputOtpContextValue {
  readonly length: () => number;
  /** Whether the slots take digits (numeric, no pattern) rather than characters. */
  readonly digits: () => boolean;
}

const inputOtpContext = createPartContext<InputOtpContextValue>("InputOTP");

/**
 * A per-character digit pattern; Arabic-Indic and Persian digits normalize before matching.
 * @example
 * import { REGEXP_ONLY_DIGITS } from "@/components/ui/input-otp";
 * export const acceptsDigit = new RegExp(REGEXP_ONLY_DIGITS).test("7");
 * @since 1.0.0
 */
const REGEXP_ONLY_DIGITS: string = "^[0-9]+$";
/**
 * A per-character ASCII letter pattern, accepting uppercase and lowercase letters.
 * @example
 * import { REGEXP_ONLY_CHARS } from "@/components/ui/input-otp";
 * export const acceptsLetter = new RegExp(REGEXP_ONLY_CHARS).test("A");
 * @since 1.0.0
 */
const REGEXP_ONLY_CHARS: string = "^[a-zA-Z]+$";
/**
 * A per-character ASCII letter and digit pattern.
 * @example
 * import { REGEXP_ONLY_DIGITS_AND_CHARS } from "@/components/ui/input-otp";
 * export const acceptsCode = new RegExp(REGEXP_ONLY_DIGITS_AND_CHARS).test("A7");
 * @since 1.0.0
 */
const REGEXP_ONLY_DIGITS_AND_CHARS: string = "^[a-zA-Z0-9]+$";

/**
 * Props of {@link InputOTP}. The slots and separators are its children; the code is `value`
 * (controlled) or `defaultValue` (uncontrolled).
 * @since 1.0.0
 * @see {@link InputOTP}
 */
export interface InputOTPProps {
  /** Explicit reading direction for layout and arrow keys. @default undefined (inherited direction) */
  readonly dir?: Direction | undefined;
  /**
   * The number of slots, an integer from 1 to 64, fixed when the component mounts.
   * @default 6
   */
  readonly maxLength?: number | undefined;
  /**
   * Which characters a slot accepts: `"numeric"` for digits, `"alphanumeric"` for letters and digits.
   * @default "numeric"
   */
  readonly type?: OneTimePasswordType | undefined;
  /**
   * A regular expression source of at most 256 characters, matched against each normalized
   * character. Overrides `type` filtering; use the exported REGEXP constants for common codes.
   * This filters characters rather than validating the whole code. Custom patterns use text input mode.
   * @default undefined (use `type`)
   */
  readonly pattern?: string | undefined;
  /**
   * The code when controlled. Pair it with `onChange` to keep it up to date.
   * @default none (uncontrolled)
   */
  readonly value?: string | undefined;
  /**
   * The starting code when uncontrolled.
   * @default "" (empty)
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called with the whole code after every change: typing, deleting or pasting.
   * @default none
   */
  readonly onChange?: ((value: string) => void) | undefined;
  /**
   * Called once when every slot is filled, with the full code.
   * @default none
   */
  readonly onComplete?: ((value: string) => void) | undefined;
  /**
   * Disables every slot.
   * @default false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Submits the code with a surrounding form under this name.
   * @default none
   */
  readonly name?: string | undefined;
  /**
   * The slots ({@link InputOTPSlot}) and separators ({@link InputOTPSeparator}), in order.
   * @default none
   */
  readonly children?: unknown;
  /**
   * Classes of the wrapper that holds the slots. It is the same element as `class`.
   * @default none
   */
  readonly containerClassName?: string | undefined;
  /**
   * Classes of the wrapper that holds the slots. It is the same element as `containerClassName`.
   * @default none
   */
  readonly class?: string | undefined;
  /**
   * The name of the code field, for example "Verification code". The wrapper is named with it.
   * @default none
   */
  readonly "aria-label"?: string | undefined;
}

/**
 * A one-time code, one character per slot. Typing fills the slot and moves on; Backspace steps
 * back; the arrow keys, Home and End move between slots; a paste or an OS autofill fills them all.
 * Only the characters `type` or `pattern` accepts are kept. Arabic-Indic and Persian digits
 * normalize before matching. An edit scans at most its first 4,096 UTF-16 units; surrogate pairs
 * are refused instead of being split between slots.
 *
 * Keyboard and ARIA: the wrapper is a `role="group"`. Name it with `aria-label`, for example
 * "Verification code", because the slots on their own are only named "Digit 1 of 6". Each slot is
 * an `input` named "Digit n of N" (or "Character n of N" for alphanumeric) unless it has its own
 * `aria-label`. The first slot has `autocomplete="one-time-code"`, so the operating system can
 * offer to fill in a code it has received. Backspace clears the slot and steps back from an empty one; Delete clears
 * the slot; ArrowLeft and ArrowRight (swapped in right-to-left text) and Home and End move between
 * slots. `aria-invalid="true"` on a slot, which you pass, turns its border destructive.
 *
 * shadcn/ui differences: slots compose through JSX children and are native inputs. `type` is a
 * convenience when no `pattern` is supplied. `class` and `containerClassName` style the same root.
 *
 * @param props See {@link InputOTPProps}.
 * @returns The wrapper `div` with the slots and separators inside.
 * @example
 * import {
 *   InputOTP,
 *   InputOTPGroup,
 *   InputOTPSeparator,
 *   InputOTPSlot,
 * } from "@/components/ui/input-otp";
 *
 * const submit = (code: string): void => console.info("submit", code);
 *
 * <InputOTP maxLength={6} onComplete={submit} aria-label="Verification code">
 *   <InputOTPGroup>
 *     <InputOTPSlot index={0} />
 *     <InputOTPSlot index={1} />
 *     <InputOTPSlot index={2} />
 *   </InputOTPGroup>
 *   <InputOTPSeparator />
 *   <InputOTPGroup>
 *     <InputOTPSlot index={3} />
 *     <InputOTPSlot index={4} />
 *     <InputOTPSlot index={5} />
 *   </InputOTPGroup>
 * </InputOTP>
 * @since 1.0.0
 * @see {@link InputOTPSlot}
 */
function InputOTP(props: InputOTPProps): JSX.Element {
  const [local, rest] = splitProps(props as InputOTPProps & Record<string, unknown>, [
    "maxLength",
    "type",
    "pattern",
    "value",
    "defaultValue",
    "onChange",
    "onComplete",
    "disabled",
    "name",
    "children",
    "containerClassName",
    "class",
  ]);
  const filter = useMemo(() =>
    local.pattern === undefined ? undefined : createOneTimePasswordPattern(local.pattern as string),
  );
  const length = (): number => (local.maxLength as number | undefined) ?? 6;
  const digits = (): boolean =>
    ((local.type as OneTimePasswordType | undefined) ?? "numeric") === "numeric" &&
    local.pattern === undefined;
  return (
    <inputOtpContext.Provider value={{ length, digits }}>
      <OneTimePasswordField
        data-slot="input-otp"
        length={(local.maxLength as number | undefined) ?? 6}
        type={(local.type as OneTimePasswordType | undefined) ?? "numeric"}
        filter={filter()}
        value={local.value as string | undefined}
        defaultValue={local.defaultValue as string | undefined}
        onValueChange={local.onChange as ((value: string) => void) | undefined}
        onComplete={local.onComplete as ((value: string) => void) | undefined}
        disabled={local.disabled as boolean | undefined}
        name={local.name as string | undefined}
        class={cn(
          "flex items-center gap-2 has-disabled:opacity-50",
          local.containerClassName as string | undefined,
          local.class as string | undefined,
        )}
        {...rest}
      >
        {local.children as JSX.Element}
      </OneTimePasswordField>
    </inputOtpContext.Provider>
  );
}

/**
 * A row of slots, drawn with the kit's border, focus ring and radius on each one.
 *
 * Keyboard and ARIA: no keys and no role of its own; the slots inside keep theirs.
 *
 * @param props The `div` attributes; `class` adds to the classes.
 * @returns The group `div`.
 * @example
 * import { InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
 *
 * <InputOTPGroup>
 *   <InputOTPSlot index={0} />
 * </InputOTPGroup>
 * @since 1.0.0
 * @see {@link InputOTPSlot}
 */
function InputOTPGroup(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return <div data-slot="input-otp-group" class={cn("flex items-center", local.class)} {...rest} />;
}

/**
 * One character of an {@link InputOTP}, at `index` (counted from 0). It is a text `input` of its
 * own: its border and ring turn destructive while you pass `aria-invalid="true"`.
 *
 * Keyboard and ARIA: the keys are those of {@link InputOTP}. The slot is named "Digit n of N" (or
 * "Character n of N") unless you pass an `aria-label`.
 *
 * @param props The `input` attributes plus `index`, the position of the slot from 0. `class` adds to
 * the classes.
 * @returns The slot `input`.
 * @throws Error when rendered outside an {@link InputOTP}.
 * @example
 * import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
 *
 * <InputOTP maxLength={1} aria-label="PIN">
 *   <InputOTPSlot index={0} aria-invalid="true" />
 * </InputOTP>
 * @since 1.0.0
 * @see {@link InputOTP}
 */
function InputOTPSlot(props: ComponentProps<"input"> & { readonly index: number }): JSX.Element {
  const [local, rest] = splitProps(
    props as ComponentProps<"input"> & { readonly index: number; readonly class?: unknown },
    ["class", "index"],
  );
  const field = inputOtpContext.useOptional();
  const t = useUiStrings();
  // The name is "Digit n of N" or "Character n of N", in the language of the UI strings.
  const name = (): string | undefined => {
    if (field === undefined) return undefined;
    const values = { position: local.index + 1, total: field.length() };
    return field.digits()
      ? t("inputOtp.digit", "Digit {position} of {total}", values)
      : t("inputOtp.character", "Character {position} of {total}", values);
  };
  return (
    <OneTimePasswordField.Input
      data-slot="input-otp-slot"
      aria-label={name()}
      index={local.index}
      class={cn(
        "relative flex size-9 items-center justify-center border-y border-e border-input bg-transparent text-center text-sm shadow-xs transition-all outline-none first:rounded-s-md first:border-s last:rounded-e-md dark:bg-input/30",
        "focus:z-10 focus:border-ring focus:ring-[3px] focus:ring-ring/50 focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-transparent aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none forced-colors:focus:outline-[Highlight]",
        local.class as string | undefined,
      )}
      {...rest}
    />
  );
}

/**
 * A dot between two groups of slots.
 *
 * Keyboard and ARIA: a horizontal `role="separator"` with `aria-orientation="horizontal"`. It is not
 * focusable. The dot inside it is decorative and hidden from assistive technology.
 *
 * @param props The `div` attributes; `class` adds to the classes.
 * @returns The separator `div`.
 * @example
 * import { InputOTPSeparator } from "@/components/ui/input-otp";
 *
 * <InputOTPSeparator />
 * @since 1.0.0
 * @see {@link InputOTP}
 */
function InputOTPSeparator(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="input-otp-separator"
      class={cn("mx-1 flex w-4 items-center justify-center", local.class)}
      {...rest}
    >
      <span aria-hidden="true" class="size-1.5 rounded-full bg-muted-foreground" />
    </div>
  );
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
};
