import { useSignal } from "@shadow-js/core";
import { For } from "@shadow-js/web";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { CheckIcon } from "@/components/ui/icons";

interface PaletteProps {
  onSelect?: (value: string) => void;
  loop?: boolean;
  shouldFilter?: boolean;
  filter?: (value: string, search: string, keywords?: readonly string[]) => number;
  search?: string;
  onSearchChange?: (search: string) => void;
  class?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

/** A palette with two groups, a separator, keywords, a disabled item and an empty state. */
export function Palette(props: PaletteProps) {
  return (
    <Command
      label="Command palette"
      loop={props.loop}
      shouldFilter={props.shouldFilter}
      filter={props.filter}
      class={props.class}
      onEscapeKeyDown={props.onEscapeKeyDown}
      data-testid="command"
    >
      <CommandInput
        placeholder="Type a command or search..."
        value={props.search}
        onValueChange={props.onSearchChange}
      />
      <CommandList data-testid="list">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions" data-testid="suggestions">
          <CommandItem onSelect={props.onSelect}>Calendar</CommandItem>
          <CommandItem keywords={["smile", "face"]} onSelect={props.onSelect}>
            Search Emoji
          </CommandItem>
          <CommandItem disabled onSelect={props.onSelect}>
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandSeparator data-testid="separator" />
        <CommandGroup heading="Settings" data-testid="settings">
          <CommandItem value="profile" onSelect={props.onSelect}>
            <CheckIcon />
            <span>Open profile</span>
            <CommandShortcut>Ctrl+P</CommandShortcut>
          </CommandItem>
          <CommandItem value="billing" onSelect={props.onSelect}>
            Billing
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/** A palette whose search text lives in the application. */
export function Controlled() {
  const [search, setSearch] = useSignal("cal");
  return (
    <div>
      <p data-testid="search">{search()}</p>
      <Palette search={search()} onSearchChange={setSearch} />
    </div>
  );
}

interface DialogDemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (value: string) => void;
  showCloseButton?: boolean;
}

/** A palette in a dialog opened by a button. */
export function DialogDemo(props: DialogDemoProps) {
  const [open, setOpen] = useSignal(props.defaultOpen === true);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open palette</Button>
      <CommandDialog
        open={props.open ?? open()}
        onOpenChange={(next: boolean) => {
          setOpen(next);
          props.onOpenChange?.(next);
        }}
        showCloseButton={props.showCloseButton}
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={props.onSelect}>Calendar</CommandItem>
            <CommandItem onSelect={props.onSelect}>Search Emoji</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

/** Items from reactive data, to see added and removed items take part in the search. */
export function Dynamic() {
  const [names, setNames] = useSignal(["Alpha", "Beta"]);
  return (
    <div>
      <Button onClick={() => setNames((list) => [...list, "Gamma"])}>Add</Button>
      <Command label="Dynamic">
        <CommandInput />
        <CommandList>
          <CommandEmpty>Nothing</CommandEmpty>
          <CommandGroup heading="Names">
            <For each={names()}>{(name) => <CommandItem value={name}>{name}</CommandItem>}</For>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
