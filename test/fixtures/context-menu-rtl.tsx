import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type RtlProps = {
  onSelect?: (event: Event) => void;
};

/** A context menu with Arabic text inside a right-to-left document. */
export function Rtl(props: RtlProps) {
  return (
    <div dir="rtl">
      <ContextMenu dir="rtl">
        <ContextMenuTrigger
          as="div"
          class="flex h-40 w-72 items-center justify-center rounded-md border border-dashed"
          data-testid="trigger"
        >
          منطقة النقر
        </ContextMenuTrigger>
        <ContextMenuContent data-testid="content">
          <ContextMenuLabel data-testid="label">حسابي</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem onSelect={props.onSelect} data-testid="profile">
              الملف الشخصي
              <ContextMenuShortcut data-testid="shortcut">Ctrl+P</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onSelect={props.onSelect} data-testid="billing">
              الفوترة
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem defaultChecked={false} data-testid="check">
            إظهار الإشارات المرجعية
          </ContextMenuCheckboxItem>
          <ContextMenuRadioGroup defaultValue="top">
            <ContextMenuRadioItem value="top" data-testid="top">
              أعلى
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="bottom" data-testid="bottom">
              أسفل
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
