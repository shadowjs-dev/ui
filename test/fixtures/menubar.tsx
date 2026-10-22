import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

interface DemoProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: "ltr" | "rtl";
  loop?: boolean;
  onNewTab?: (event: Event) => void;
  contentProps?: Record<string, unknown>;
  barClass?: string;
}

/** A bar with three menus: File (items, sub), Edit (checkbox, radios, destructive), View (disabled). */
export function Demo(props: DemoProps) {
  return (
    <div>
      <button type="button" data-testid="before">
        before
      </button>
      <Menubar
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        dir={props.dir}
        loop={props.loop}
        class={props.barClass}
        data-testid="bar"
      >
        <MenubarMenu value="file">
          <MenubarTrigger data-testid="file">File</MenubarTrigger>
          <MenubarContent data-testid="file-content" {...props.contentProps}>
            <MenubarLabel inset data-testid="label">
              Document
            </MenubarLabel>
            <MenubarGroup>
              <MenubarItem onSelect={props.onNewTab} data-testid="new-tab">
                New Tab <MenubarShortcut data-testid="shortcut">Ctrl+T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled data-testid="disabled">
                New Incognito Window
              </MenubarItem>
              <MenubarItem as="a" href="/print" data-testid="link">
                Print
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator data-testid="separator" />
            <MenubarSub>
              <MenubarSubTrigger data-testid="sub-trigger">Share</MenubarSubTrigger>
              <MenubarSubContent data-testid="sub-content">
                <MenubarItem data-testid="email">Email link</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger data-testid="edit">Edit</MenubarTrigger>
          <MenubarContent data-testid="edit-content">
            <MenubarCheckboxItem checked data-testid="check">
              Always show bookmarks
            </MenubarCheckboxItem>
            <MenubarRadioGroup value="andy">
              <MenubarRadioItem value="andy" data-testid="andy">
                Andy
              </MenubarRadioItem>
              <MenubarRadioItem value="benoit" data-testid="benoit">
                Benoit
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarItem variant="destructive" data-testid="delete">
              Delete
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger disabled data-testid="view">
            View
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Zoom</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <button type="button" data-testid="after">
        after
      </button>
    </div>
  );
}
