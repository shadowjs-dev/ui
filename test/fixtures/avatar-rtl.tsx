import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";

export function Rtl() {
  return (
    <div dir="rtl">
      <AvatarGroup data-testid="group" aria-label="المراجعون">
        <Avatar data-testid="first">
          <AvatarFallback>سا</AvatarFallback>
        </Avatar>
        <Avatar data-testid="second">
          <AvatarFallback>عم</AvatarFallback>
        </Avatar>
        <AvatarGroupCount data-testid="count" aria-label="ثلاثة آخرون">
          +٣
        </AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}
