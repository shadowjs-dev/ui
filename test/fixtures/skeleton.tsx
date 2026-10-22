import { Skeleton } from "@/components/ui/skeleton";

export function Demo() {
  return (
    <div aria-busy="true">
      <Skeleton data-testid="line" class="h-4 w-[250px]" />
      <Skeleton data-testid="avatar" class="size-12 rounded-full" />
    </div>
  );
}
