import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";

export function Demo(props: { size?: "default" | "sm" | "lg"; dir?: "ltr" | "rtl" }) {
  return (
    <AvatarGroup aria-label="Reviewers" dir={props.dir}>
      <Avatar size={props.size}>
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge aria-label="Available" />
      </Avatar>
      <Avatar size={props.size}><AvatarFallback>GH</AvatarFallback></Avatar>
      <AvatarGroupCount aria-label="Three more reviewers">+3</AvatarGroupCount>
    </AvatarGroup>
  );
}
