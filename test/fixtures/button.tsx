import { useSignal } from "@shadow-js/core";
import { Button, buttonVariants } from "@/components/ui/button";

export function Variants() {
  return (
    <div>
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline" size="sm">
        Outline
      </Button>
      <Button variant="ghost" size="icon" aria-label="Menu">
        x
      </Button>
      <Button class="px-8 bg-red-500" data-testid="custom">
        Custom
      </Button>
      <Button disabled>Disabled</Button>
      <Button size="xs">Tiny</Button>
      <Button size="icon-xs" aria-label="Close">
        x
      </Button>
    </div>
  );
}

export function AsLink() {
  return (
    <Button as="a" href="/docs" variant="link">
      Docs
    </Button>
  );
}

export function Counter() {
  const [count, setCount] = useSignal(0);
  return <Button onClick={() => setCount((n) => n + 1)}>Clicked {count()}</Button>;
}

export function Reactive(props: { variant: "default" | "secondary" }) {
  return <Button variant={props.variant}>Go</Button>;
}

export function LinkStyled() {
  return (
    <a href="/x" class={buttonVariants({ variant: "outline", size: "lg" })}>
      Styled link
    </a>
  );
}
