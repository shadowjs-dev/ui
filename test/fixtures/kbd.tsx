import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function Demo() {
  return (
    <p>
      Press{" "}
      <KbdGroup data-testid="group">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>{" "}
      or <Kbd class="bg-red-500">Esc</Kbd>
    </p>
  );
}

/** A shortcut hint inside a button: its keys are part of the button's name from content. */
export function InButton() {
  return (
    <button type="button">
      Search{" "}
      <KbdGroup>
        <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
      </KbdGroup>
    </button>
  );
}
