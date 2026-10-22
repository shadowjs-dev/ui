import { useSignal } from "@shadow-js/core";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DemoProps {
  open?: boolean;
  defaultOpen?: boolean;
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
      <DropdownMenu
        open={props.open}
        defaultOpen={props.defaultOpen}
        modal={props.modal}
        dir={props.dir}
        onOpenChange={props.onOpenChange}
      >
        <DropdownMenuTrigger as={Button} variant="outline" data-testid="trigger">
          Open
        </DropdownMenuTrigger>
        <DropdownMenuContent class={props.contentClass} data-testid="content">
          <DropdownMenuLabel inset data-testid="label">
            My Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator data-testid="separator" />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={props.onProfile} class={props.itemClass} data-testid="profile">
              Profile
              <DropdownMenuShortcut data-testid="shortcut">Ctrl+P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem inset data-testid="billing">
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem disabled data-testid="disabled">
              Disabled
            </DropdownMenuItem>
            <DropdownMenuItem as="a" href="/settings" data-testid="link">
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={props.checked}
            defaultChecked={props.defaultChecked}
            onCheckedChange={props.onCheckedChange}
            data-testid="check"
          >
            Show bookmarks
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup
            value={props.position}
            defaultValue={props.defaultPosition}
            onValueChange={props.onPositionChange}
          >
            <DropdownMenuRadioItem value="top" data-testid="top">
              Top
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom" data-testid="bottom">
              Bottom
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger data-testid="sub-trigger">Invite users</DropdownMenuSubTrigger>
            <DropdownMenuSubContent data-testid="sub-content">
              <DropdownMenuItem data-testid="email">Email</DropdownMenuItem>
              <DropdownMenuItem data-testid="message">Message</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem variant="destructive" onSelect={props.onDelete} data-testid="delete">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
    <DropdownMenu>
      <DropdownMenuTrigger data-testid="trigger">Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked={checked()} onCheckedChange={setChecked} data-testid="check">
          Show bookmarks
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value={position()} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top" data-testid="top">
            Top
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom" data-testid="bottom">
            Bottom
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
