import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DemoProps {
  src?: string | undefined;
  delayMs?: number;
  onStatus?: (status: string) => void;
  onLoad?: () => void;
  onError?: () => void;
}

export function Demo(props: DemoProps) {
  return (
    <Avatar data-testid="avatar" class="size-12">
      <AvatarImage
        src={props.src}
        alt="Ada Lovelace"
        onLoadingStatusChange={props.onStatus}
        onLoad={props.onLoad}
        onError={props.onError}
        class="rounded-full"
      />
      <AvatarFallback delayMs={props.delayMs} class="text-xs">
        AL
      </AvatarFallback>
    </Avatar>
  );
}
