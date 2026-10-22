import { useSignal } from "@shadow-js/core";
import { DatePicker } from "@/components/ui/date-picker";

export function Basic(props: Record<string, unknown>) {
  return (
    <div>
      <label for="due">Due</label>
      <DatePicker id="due" {...props} />
    </div>
  );
}

/**
 * The app owns the day: a button outside the field sets it, so the field must follow. The day starts
 * defined, because `undefined` means uncontrolled for every primitive (see useControllableState).
 */
export function Controlled() {
  const [due, setDue] = useSignal<{ year: number; month: number; day: number } | undefined>({
    year: 2026,
    month: 3,
    day: 5,
  });
  return (
    <div>
      <label for="due">Due</label>
      <DatePicker id="due" value={due()} onValueChange={setDue} />
      <button type="button" onClick={() => setDue({ year: 2026, month: 7, day: 4 })}>
        Set July 4
      </button>
    </div>
  );
}

/** The app marks the field invalid and clears it again, as a form does on submit and on typing. */
export function Invalidable() {
  const [invalid, setInvalid] = useSignal(false);
  return (
    <div>
      <label for="due">Due</label>
      <DatePicker id="due" invalid={invalid()} />
      <button type="button" onClick={() => setInvalid(!invalid())}>
        Toggle invalid
      </button>
    </div>
  );
}
