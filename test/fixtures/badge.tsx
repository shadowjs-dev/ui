import { Badge, badgeVariants } from "@/components/ui/badge";

export function Variants() {
  return (
    <div>
      <Badge data-testid="default">Default</Badge>
      <Badge variant="secondary" data-testid="secondary">
        Secondary
      </Badge>
      <Badge variant="destructive" data-testid="destructive">
        Destructive
      </Badge>
      <Badge variant="outline" data-testid="outline">
        Outline
      </Badge>
      <Badge variant="ghost" data-testid="ghost">
        Ghost
      </Badge>
      <Badge variant="link" data-testid="link">
        Link
      </Badge>
      <Badge class="px-4 bg-red-500" data-testid="custom">
        Custom
      </Badge>
      <Badge data-testid="icon">
        <svg aria-hidden="true" viewBox="0 0 1 1" />
        With icon
      </Badge>
    </div>
  );
}

export function AsLink() {
  return (
    <Badge as="a" href="/new" variant="secondary">
      New
    </Badge>
  );
}

export function Reactive(props: { variant: "default" | "destructive" }) {
  return <Badge variant={props.variant}>Status</Badge>;
}

export function Styled() {
  return (
    <a href="/x" class={badgeVariants({ variant: "outline" })}>
      Styled link
    </a>
  );
}
