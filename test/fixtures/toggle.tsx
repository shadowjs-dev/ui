import { Toggle, toggleVariants } from "@/components/ui/toggle";

type Props = Record<string, unknown>;

export function Demo(props: Props) {
  return (
    <Toggle aria-label="Bold" {...props}>
      B
    </Toggle>
  );
}

export function Variants() {
  return (
    <div>
      <Toggle aria-label="Default">D</Toggle>
      <Toggle aria-label="Outline" variant="outline">
        O
      </Toggle>
      <Toggle aria-label="Small" size="sm">
        S
      </Toggle>
      <Toggle aria-label="Large" size="lg">
        L
      </Toggle>
      <Toggle aria-label="Custom" class="h-12 bg-red-500">
        C
      </Toggle>
    </div>
  );
}

export function Reactive(props: { variant: "default" | "outline" }) {
  return (
    <Toggle aria-label="Reactive" variant={props.variant}>
      R
    </Toggle>
  );
}

export function Styled() {
  return (
    <a href="/x" class={toggleVariants({ variant: "outline", size: "lg" })}>
      Link
    </a>
  );
}
