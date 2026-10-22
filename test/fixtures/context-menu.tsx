import { useSignal } from "@shadow-js/core";
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
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface DemoProps {
  disabled?: boolean;
  modal?: boolean;
  dir?: "ltr" | "rtl";
  onOpenChange?: (open: boolean) => void;
  onProfile?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  position?: string;
  defaultPosition?: string;
  onPositionChange?: (value: string) => void;
  contentClass?: string;
  itemClass?: string;
}

/** A complete dropdown: label, grouped items, a destructive one, a checkbox, radios and a submenu. */
export function Demo(props: DemoProps) {
  return (
    <div>
      <button type="button" data-testid="before">
        before
      </button>
      <ContextMenu modal={props.modal} dir={props.dir} onOpenChange={props.onOpenChange}>
        <ContextMenuTrigger
          as="div"
          disabled={props.disabled}
          class="flex h-40 w-72 items-center justify-center rounded-md border border-dashed"
          data-testid="trigger"
        >
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent class={props.contentClass} data-testid="content">
          <ContextMenuLabel inset data-testid="label">
            My Account
          </ContextMenuLabel>
          <ContextMenuSeparator data-testid="separator" />
          <ContextMenuGroup>
            <ContextMenuItem onSelect={props.onProfile} class={props.itemClass} data-testid="profile">
              Profile
              <ContextMenuShortcut data-testid="shortcut">Ctrl+P</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem inset data-testid="billing">
              Billing
            </ContextMenuItem>
            <ContextMenuItem disabled data-testid="disabled">
              Disabled
            </ContextMenuItem>
            <ContextMenuItem as="a" href="/settings" data-testid="link">
              Settings
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={props.checked}
            defaultChecked={props.defaultChecked}
            onCheckedChange={props.onCheckedChange}
            data-testid="check"
          >
            Show bookmarks
          </ContextMenuCheckboxItem>
          <ContextMenuRadioGroup
            value={props.position}
            defaultValue={props.defaultPosition}
            onValueChange={props.onPositionChange}
          >
            <ContextMenuRadioItem value="top" data-testid="top">
              Top
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="bottom" data-testid="bottom">
              Bottom
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger data-testid="sub-trigger">Invite users</ContextMenuSubTrigger>
            <ContextMenuSubContent data-testid="sub-content">
              <ContextMenuItem data-testid="email">Email</ContextMenuItem>
              <ContextMenuItem data-testid="message">Message</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem variant="destructive" onSelect={props.onDelete} data-testid="delete">
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <button type="button" data-testid="after">
        after
      </button>
    </div>
  );
}

/** The checkbox and the radio group hold their state outside the menu, so it survives closing. */
export function Stateful() {
  const [checked, setChecked] = useSignal(false);
  const [position, setPosition] = useSignal("top");
  return (
    <ContextMenu>
      <ContextMenuTrigger data-testid="trigger">Right click here</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuCheckboxItem checked={checked()} onCheckedChange={setChecked} data-testid="check">
          Show bookmarks
        </ContextMenuCheckboxItem>
        <ContextMenuRadioGroup value={position()} onValueChange={setPosition}>
          <ContextMenuRadioItem value="top" data-testid="top">
            Top
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="bottom" data-testid="bottom">
            Bottom
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
