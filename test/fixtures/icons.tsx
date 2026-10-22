import * as Icons from "@/components/ui/icons";

export const names = Object.keys(Icons).sort();

const lookup: Record<string, (props: Icons.IconProps) => unknown> = { ...Icons };

export function All() {
  return (
    <div>
      {names.map((name) => (
        <span data-name={name}>{lookup[name]?.({}) as Node}</span>
      ))}
    </div>
  );
}

export function Sized() {
  return (
    <div>
      <Icons.CheckIcon data-testid="small" />
      <Icons.CheckIcon
        data-testid="big"
        class="size-6 text-primary"
        aria-label="Done"
        aria-hidden="false"
      />
    </div>
  );
}
