import { AspectRatio } from "@/components/ui/aspect-ratio";

export function Demo(props: { ratio?: number }) {
  return (
    <AspectRatio ratio={props.ratio} data-testid="box" style={{ "max-width": "10rem" }}>
      <img alt="Cover" src="https://example.test/cover.jpg" class="size-full object-cover" />
    </AspectRatio>
  );
}

export function Custom() {
  return <AspectRatio data-testid="box" ratio={16 / 9} class="rounded-lg bg-muted" id="b" />;
}
