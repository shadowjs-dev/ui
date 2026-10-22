import { type Accessor, onMount, splitProps, useMemo, useSignal } from "@shadow-js/core";
import {
  createPartContext,
  mergeElementProps,
  PasswordToggleField,
  useBaseId,
} from "@shadow-js/primitives";
import { type ComponentProps, For, type JSX, Show } from "@shadow-js/web";
import { useUiStrings } from "@/lib/ui-strings";
import { type ClassValue, cn } from "@/lib/utils";

/**
 * Props of {@link PasswordInput}: the attributes of an `input`, which go to the input, plus the
 * visibility options below. `disabled` disables both the input and the toggle. `class` styles the
 * wrapper, so its width is the width of the field.
 * @since 1.0.0
 * @see {@link PasswordInput}
 */
export type PasswordInputProps = Omit<ComponentProps<"input">, "children"> & {
  /**
   * Controlled visibility: `true` shows the password as text. Clicks on the toggle only report the
   * change through `onVisibleChange`.
   * @default none (uncontrolled)
   */
  readonly visible?: boolean | undefined;
  /**
   * Whether the password is shown at first, when uncontrolled.
   * @default false
   */
  readonly defaultVisible?: boolean | undefined;
  /**
   * Called with the new visibility when the user shows or hides the password.
   * @default none
   */
  readonly onVisibleChange?: ((visible: boolean) => void) | undefined;
  /**
   * The accessible name of the toggle, in the page's language. The name stays the same while the
   * password is shown.
   * @default "Show password"
   */
  readonly toggleLabel?: string | undefined;
  /**
   * Shows "Caps Lock is on" under the field while the password is hidden, the field has focus and Caps
   * Lock is on, so a mistyped password is not a mystery. The hint is a polite status and the input's
   * `aria-describedby` names it while it shows. Turn it off with `false`.
   * @default true
   */
  readonly capsLockHint?: boolean | undefined;
  /**
   * The slot under the field: a {@link PasswordStrength}, or your own part that reads the field with
   * {@link usePasswordInput}.
   * @default none
   */
  readonly children?: JSX.Element | undefined;
};

/** The props as the implementation sees them. */
type Loose = {
  readonly class?: ClassValue;
  readonly id?: string | undefined;
  readonly visible?: boolean | undefined;
  readonly defaultVisible?: boolean | undefined;
  readonly onVisibleChange?: ((visible: boolean) => void) | undefined;
  readonly toggleLabel?: string | undefined;
  readonly capsLockHint?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly children?: JSX.Element;
  readonly [prop: string]: unknown;
};

/** An eye: the password is hidden, the toggle offers to show it. Inline SVG, as the icons are. */
function EyeIcon(props: ComponentProps<"svg">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={cn("size-4", local.class)}
      {...rest}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** An eye with a slash: the password is shown, the toggle offers to hide it. Inline SVG. */
function EyeOffIcon(props: ComponentProps<"svg">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={cn("size-4", local.class)}
      {...rest}
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

/** `autocorrect` is an iOS Safari attribute that the JSX types do not list. @internal */
const SAFARI_ATTRIBUTES: Readonly<Record<string, string>> = { autocorrect: "off" };

/** What a password field shares with the parts inside it. @internal */
interface PasswordInputContextValue {
  readonly value: Accessor<string>;
  readonly visible: Accessor<boolean>;
  /** Adds an element id to the input's `aria-describedby` while the part is mounted. */
  readonly describe: (id: string) => () => void;
}

const passwordInputContext = createPartContext<PasswordInputContextValue>("PasswordInput");

/**
 * What {@link usePasswordInput} returns: the password typed so far and whether it is shown.
 * @see {@link usePasswordInput}
 * @since 1.0.0
 */
export interface PasswordInputState {
  /** The password in the field, as typed (or the controlled `value`). Empty on the server. */
  readonly value: Accessor<string>;
  /** Whether the password is shown as text. */
  readonly visible: Accessor<boolean>;
}

/**
 * Reads the field that the calling part sits in, to build your own parts for the strength meter slot:
 * a list of rules that turn green, a count of characters. Call it inside a {@link PasswordInput}.
 *
 * @returns Accessors of the typed value and the visibility.
 * @throws Error when called outside a {@link PasswordInput}.
 * @example
 * import { PasswordInput, usePasswordInput } from "@/components/ui/password-input";
 *
 * function Length() {
 *   const field = usePasswordInput();
 *   return <p>{field.value().length} characters</p>;
 * }
 *
 * export function Signup() {
 *   return (
 *     <PasswordInput aria-label="Password" autocomplete="new-password">
 *       <Length />
 *     </PasswordInput>
 *   );
 * }
 * @see {@link PasswordStrength}
 * @since 1.0.0
 */
function usePasswordInput(): PasswordInputState {
  const context = passwordInputContext.use("usePasswordInput");
  return { value: context.value, visible: context.visible };
}

/** Passwords that rate as the weakest whatever their length. @internal */
const COMMON = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "11111111",
  "00000000",
  "password",
  "password1",
  "qwertyui",
  "qwertyuiop",
  "iloveyou",
  "letmein1",
]);

/**
 * Rates a password from `0` (very weak) to `4` (strong) with a rule of thumb: length counts first (8, 12
 * and 16 characters), and a mix of at least three kinds of characters (lowercase or other letters,
 * uppercase letters, digits, symbols) adds one more level. A password shorter than 8 characters, and a
 * very common one, is `0`. Characters are counted as people see them, so an emoji is one. It is a hint,
 * not a guarantee: for real checks use a library such as zxcvbn and pass it as `evaluate`.
 *
 * @param password The password.
 * @returns The level, from `0` to `4`.
 * @example
 * import { scorePassword } from "@/components/ui/password-input";
 *
 * export const level = scorePassword("Abcdefghijkl123!"); // 4
 * @see {@link PasswordStrength}
 * @since 1.0.0
 */
function scorePassword(password: string): 0 | 1 | 2 | 3 | 4 {
  const length = [...password].length;
  if (length < 8 || COMMON.has(password.toLowerCase())) return 0;
  const kinds = [/[\p{Ll}\p{Lo}\p{Lm}]/u, /[\p{Lu}\p{Lt}]/u, /\p{Nd}/u, /[^\p{L}\p{Nd}]/u].filter(
    (kind) => kind.test(password),
  ).length;
  const base = length < 12 ? 1 : length < 16 ? 2 : 3;
  return Math.min(4, base + (kinds >= 3 ? 1 : 0)) as 1 | 2 | 3 | 4;
}

/**
 * Props of {@link PasswordStrength}: the attributes of the wrapper `div`, plus how to rate and name the
 * levels.
 * @see {@link PasswordStrength}
 * @since 1.0.0
 */
export interface PasswordStrengthProps extends ComponentProps<"div"> {
  /**
   * Rates the password from `0` to `4`. Use it to plug in a stronger checker.
   * @default scorePassword
   */
  readonly evaluate?: ((password: string) => 0 | 1 | 2 | 3 | 4) | undefined;
  /**
   * The words for the five levels, from the weakest to the strongest.
   * @default the UI strings password.level.0 to password.level.4 ("Very weak" to "Strong")
   */
  readonly labels?: readonly string[] | undefined;
  /**
   * The accessible name of the meter.
   * @default the UI string password.strength ("Password strength")
   */
  readonly label?: string | undefined;
}

/**
 * The strength meter for the slot of a {@link PasswordInput}: four bars that fill with the level of the
 * password, and the level as text. Put it inside the field.
 *
 * Keyboard and ARIA: not interactive. The bars are a `role="meter"` named "Password strength", with
 * `aria-valuemin` 0, `aria-valuemax` 4, `aria-valuenow` and, once something is typed, `aria-valuetext`
 * (the level word). The word is also shown in a polite status that the input's `aria-describedby` names,
 * so the level is read when the field is focused and announced when it changes. An empty field shows
 * level 0 and no word. The bars have forced-colors styles, and the color change is not the only cue: the
 * number of filled bars and the word say the same.
 *
 * @param props See {@link PasswordStrengthProps}.
 * @returns The meter.
 * @throws Error when rendered outside a {@link PasswordInput}.
 * @example
 * import { PasswordInput, PasswordStrength } from "@/components/ui/password-input";
 *
 * export function NewPassword() {
 *   return (
 *     <PasswordInput aria-label="New password" autocomplete="new-password">
 *       <PasswordStrength />
 *     </PasswordInput>
 *   );
 * }
 * @see {@link scorePassword}
 * @see {@link usePasswordInput}
 * @since 1.0.0
 */
function PasswordStrength(props: PasswordStrengthProps): JSX.Element {
  const field = passwordInputContext.use("PasswordStrength");
  const t = useUiStrings();
  const [local, rest] = splitProps(props, ["class", "evaluate", "labels", "label"]);
  const textId = `${useBaseId()()}-strength`;
  onMount(() => field.describe(textId));
  const score = useMemo((): 0 | 1 | 2 | 3 | 4 => {
    const evaluate = local.evaluate as ((password: string) => 0 | 1 | 2 | 3 | 4) | undefined;
    return field.value() === "" ? 0 : (evaluate ?? scorePassword)(field.value());
  });
  const word = (): string => {
    if (field.value() === "") return "";
    const given = local.labels as readonly string[] | undefined;
    if (given?.[score()] !== undefined) return given[score()] as string;
    switch (score()) {
      case 0:
        return t("password.level.0", "Very weak");
      case 1:
        return t("password.level.1", "Weak");
      case 2:
        return t("password.level.2", "Fair");
      case 3:
        return t("password.level.3", "Good");
      default:
        return t("password.level.4", "Strong");
    }
  };
  return (
    <div
      data-slot="password-strength"
      data-score={score()}
      class={cn("group/strength mt-2 grid gap-1.5", local.class)}
      {...rest}
    >
      <div
        role="meter"
        aria-label={
          (local.label as string | undefined) ?? t("password.strength", "Password strength")
        }
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score()}
        aria-valuetext={word() === "" ? undefined : word()}
        class="flex gap-1"
      >
        <For each={[1, 2, 3, 4]}>
          {(level) => (
            <span
              data-slot="password-strength-segment"
              data-active={field.value() !== "" && score() >= level ? "true" : "false"}
              class="h-1.5 flex-1 rounded-full bg-muted transition-colors motion-reduce:transition-none data-[active=true]:bg-destructive group-data-[score=2]/strength:data-[active=true]:bg-chart-4 group-data-[score=3]/strength:data-[active=true]:bg-primary group-data-[score=4]/strength:data-[active=true]:bg-primary forced-colors:data-[active=true]:bg-[Highlight]"
            />
          )}
        </For>
      </div>
      <p
        data-slot="password-strength-label"
        id={textId}
        role="status"
        aria-live="polite"
        class="min-h-4 text-xs text-muted-foreground"
      >
        {word()}
      </p>
    </div>
  );
}

/**
 * A password field with a button that shows and hides the password. The input is a `password`
 * field until the toggle shows it as text, and the icon changes with the state. It is built on the
 * `PasswordToggleField` primitive, which owns the visibility and the toggle's ARIA. Name the input
 * with a {@link Label} whose `htmlFor` points at the input's `id`.
 *
 * Children are the strength meter slot: put a {@link PasswordStrength}, or your own part that calls
 * {@link usePasswordInput}, inside, and it is placed under the field. A Caps Lock hint appears under the
 * field when it helps (see `capsLockHint`).
 *
 * Keyboard and ARIA: Tab reaches the toggle, which is a `button` with `type="button"`, so it never
 * submits a form. Enter or Space flips the visibility. The toggle has `aria-pressed` (true while the
 * password is shown) and `aria-controls`, which names the input. Its name is "Show password" unless
 * you pass `toggleLabel`, and it keeps that name while the password is shown. The input has no name
 * of its own: give it a label through `id` and `htmlFor`, or pass `aria-label`. `autocomplete`
 * defaults to `current-password`; pass `new-password` on a sign-up form. The input also turns off
 * `autocapitalize`, `spellcheck` and `autocorrect`, which would capitalize the first letter or send the
 * word to a spelling service; pass your own values to change them. The words of the toggle, the hint
 * and the meter come from the UI strings provider unless a prop sets them.
 *
 * The component does not store the password or send it anywhere: it only switches the input between
 * `password` and `text`, and keeps the typed text in memory for the meter. A form around the field
 * submits the value when the input has a `name`, as it does for any input.
 *
 * @param props The input's attributes, plus `visible`, `defaultVisible`, `onVisibleChange`,
 * `toggleLabel` and `capsLockHint`. `class` styles the wrapper. `children` is the slot.
 * @returns The wrapper `div` with the input and the toggle inside.
 * @example
 * import { Label } from "@/components/ui/label";
 * import { PasswordInput, PasswordStrength } from "@/components/ui/password-input";
 *
 * <div>
 *   <Label htmlFor="password">Password</Label>
 *   <PasswordInput id="password" name="password" autocomplete="new-password">
 *     <PasswordStrength />
 *   </PasswordInput>
 * </div>
 * @since 1.0.0
 * @see {@link PasswordInputProps}
 */
function PasswordInput(props: PasswordInputProps): JSX.Element {
  const [local, rest] = splitProps(props as unknown as Loose, [
    "class",
    "id",
    "visible",
    "defaultVisible",
    "onVisibleChange",
    "toggleLabel",
    "capsLockHint",
    "disabled",
    "children",
  ]);
  const t = useUiStrings();
  const [typed, setTyped] = useSignal("");
  const [shown, setShown] = useSignal(local.defaultVisible === true);
  const [caps, setCaps] = useSignal(false);
  const [described, setDescribed] = useSignal<readonly string[]>([]);
  const baseId = useBaseId()();
  const hintId = `${baseId}-caps-lock`;
  let element: HTMLInputElement | undefined;
  const visible = (): boolean => local.visible ?? shown();
  const value = (): string => (typeof rest["value"] === "string" ? rest["value"] : typed());
  const showHint = (): boolean => local.capsLockHint !== false && caps() && !visible();
  const update = (event: KeyboardEvent): void => {
    setCaps(event.getModifierState?.("CapsLock") === true);
  };
  onMount(() => {
    if (element === undefined) return undefined;
    const input = element;
    setTyped(input.value);
    // A form reset puts the default value back after the event, with no `input` event of its own.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reset = (): void => {
      clearTimeout(timer);
      timer = setTimeout(() => setTyped(input.value), 0);
    };
    input.form?.addEventListener("reset", reset);
    return () => {
      clearTimeout(timer);
      input.form?.removeEventListener("reset", reset);
    };
  });
  const describedBy = (): string | undefined => {
    const ids = [
      rest["aria-describedby"] as string | undefined,
      ...described(),
      showHint() ? hintId : undefined,
    ].filter((id) => id !== undefined && id !== "");
    return ids.length === 0 ? undefined : ids.join(" ");
  };
  const handlers = mergeElementProps(
    {
      onInput: (event: Event) => setTyped((event.target as HTMLInputElement).value),
      onKeyDown: update,
      onKeyUp: update,
      onBlur: () => setCaps(false),
      ref: (node: HTMLInputElement) => {
        element = node;
      },
    },
    rest,
  );
  return (
    <passwordInputContext.Provider
      value={{
        value,
        visible,
        describe: (id) => {
          setDescribed((ids) => [...ids, id]);
          return () => setDescribed((ids) => ids.filter((known) => known !== id));
        },
      }}
    >
      <PasswordToggleField
        data-slot="password-input"
        class={cn("relative w-full", local.class)}
        visible={local.visible}
        defaultVisible={local.defaultVisible}
        onVisibleChange={(next: boolean) => {
          setShown(next);
          local.onVisibleChange?.(next);
        }}
        disabled={local.disabled}
      >
        <PasswordToggleField.Input
          autocapitalize="none"
          spellcheck={false}
          {...SAFARI_ATTRIBUTES}
          {...handlers}
          aria-describedby={describedBy()}
          data-slot="password-input-field"
          id={local.id}
          class="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent ps-3 pe-10 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40 motion-reduce:transition-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent"
        />
        <PasswordToggleField.Toggle
          data-slot="password-input-toggle"
          aria-label={local.toggleLabel ?? t("password.show", "Show password")}
          class="group absolute end-0 top-0 flex h-9 w-10 items-center justify-center rounded-e-md text-muted-foreground outline-none transition-[color,box-shadow] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none forced-colors:text-[ButtonText] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent"
        >
          <EyeIcon class="group-data-[state=visible]:hidden" />
          <EyeOffIcon class="hidden group-data-[state=visible]:block" />
        </PasswordToggleField.Toggle>
        <Show when={showHint()}>
          <p
            data-slot="password-input-caps-lock"
            id={hintId}
            role="status"
            class="mt-2 text-xs text-muted-foreground"
          >
            {t("password.capsLock", "Caps Lock is on")}
          </p>
        </Show>
        {local.children}
      </PasswordToggleField>
    </passwordInputContext.Provider>
  );
}

export { PasswordInput, PasswordStrength, scorePassword, usePasswordInput };
