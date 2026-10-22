import { Separator } from "@/components/ui/separator";

export function Demo(props: {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}) {
  return (
    <div>
      <Separator
        data-testid="sep"
        orientation={props.orientation}
        decorative={props.decorative}
      />
    </div>
  );
}

export function Custom() {
  return <Separator data-testid="sep" class="bg-red-500 my-4" />;
}
