import {
  type Accessor,
  onCleanup,
  splitProps,
  untrack,
  useEffect,
  useSignal,
} from "@shadow-js/core";
import {
  type ComboboxContentProps,
  type ComboboxEmptyProps,
  type ComboboxFilterItem,
  type ComboboxGroupProps,
  type ComboboxInputProps,
  type ComboboxItemProps,
  Combobox as ComboboxPrimitive,
  type ComboboxSeparatorProps,
  createPartContext,
  type DialogProps,
  normalizeSearchText,
  useControllableState,
} from "@shadow-js/primitives";
import type { ComponentProps, JSX, JsxChild } from "@shadow-js/web";
import { Show } from "@shadow-js/web";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchIcon } from "@/components/ui/icons";
import { useUiStrings } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/** What an item tells the command about itself, so the shared filter and `onSelect` can find it. */
interface ItemMeta {
  /** Whether the application gave a `value` (it is then what the search matches, as in cmdk). */
  readonly explicit: () => boolean;
  readonly keywords: () => readonly string[];
  readonly select: () => void;
}

/** Where `CommandInput` hands its controlled `value` and change callback to the command. */
interface SearchSource {
  value?: (() => string | undefined) | undefined;
  change?: ((text: string) => void) | undefined;
}

interface CommandContextValue {
  readonly label: Accessor<string | undefined>;
  readonly source: SearchSource;
  /** Tells the command that `source` changed (the input registered itself). */
  readonly touch: () => void;
  readonly register: (value: string, meta: ItemMeta) => () => void;
  /** A value for an item that has none, unique within this command. */
  readonly nextValue: () => string;
  /** Forwards Escape from the list to the application. */
  readonly escape: (event: KeyboardEvent) => void;
}

const commandContext = createPartContext<CommandContextValue>("Command");

/**
 * The score function of {@link CommandProps.filter}: a number above `0` keeps the item.
 * @since 1.0.0 * @see {@link CommandProps}
 */
export type CommandFilter = (value: string, search: string, keywords?: readonly string[]) => number;

/**
 * Props of {@link Command}: the attributes of a `div` plus the palette options.
 * @see {@link Command}
 * @since 1.0.0
 */
export type CommandProps = ComponentProps<"div"> & {
  /** Accessible name of the palette, given to the search field. Not shown. @default none */
  readonly label?: string | undefined;
  /**
   * Hides the items that do not match the search. Set `false` when you filter the list yourself.
   * @default true
   */
  readonly shouldFilter?: boolean | undefined;
  /**
   * Scores an item for the search: above `0` shows it, `0` hides it. Receives the item's `value`
   * (its text when it has none) and its `keywords`. Without it every word of the search must occur
   * in the value or the keywords, ignoring case and accents.
   * @default none (the word match described above)
   */
  readonly filter?: CommandFilter | undefined;
  /**
   * Wraps arrow-key navigation from the last item to the first and back.
   * @default false
   */
  readonly loop?: boolean | undefined;
  /**
   * Called when Escape is pressed in the palette. Calling `preventDefault()` on the event tells a
   * surrounding overlay that it was handled. {@link CommandDialog} closes itself when it was not.
   * @default none
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
};

/** The text a resolved child stands for, without reading anything but what is already there. */
function textOf(child: unknown): string {
  if (typeof child === "string") return child;
  if (typeof child === "number") return String(child);
  if (Array.isArray(child)) return child.map(textOf).join("");
  if (typeof child === "function") return textOf((child as () => unknown)());
  if (typeof Node !== "undefined" && child instanceof Node) return child.textContent ?? "";
  return "";
}

/** The words of `search` that must all occur in `haystack` (both normalized). */
function matchesEveryWord(haystack: string, search: string): boolean {
  const words = normalizeSearchText(search).split(/\s+/u);
  const text = normalizeSearchText(haystack);
  return words.every((word) => word === "" || text.includes(word));
}

/**
 * A command palette: a search field and a filtered, keyboard-navigable list of commands. The list is
 * always open and sits right below the field, with no popup. Use it inline on a page, or in a
 * {@link CommandDialog} for a palette opened with a shortcut.
 *
 * Keyboard and ARIA: the search field keeps focus. It is a `role="combobox"` with
 * `aria-autocomplete="list"` and `aria-activedescendant`, and it is named by the `label` prop
 * (give one; it is not shown). The list is a `role="listbox"` named by the field, and each command is
 * a `role="option"`. The first enabled command is highlighted as the search changes. ArrowDown and
 * ArrowUp move the highlight and skip disabled commands; Home and End jump to the first and last one.
 * Enter runs the highlighted command's `onSelect`, and the search text stays. Escape does not clear
 * the search: it is passed to `onEscapeKeyDown`, and {@link CommandDialog} closes on it.
 *
 * shadcn/ui differences: the prop is `class`, not `className`, every part has a `data-slot`
 * (`command-input`, `command-list`, `command-item` and so on), and the `filter` function has the same
 * `(value, search, keywords)` signature as the cmdk filter.
 *
 * @param props The palette props: see {@link CommandProps}.
 * @returns The palette.
 * @example
 * import {
 *   Command,
 *   CommandEmpty,
 *   CommandGroup,
 *   CommandInput,
 *   CommandItem,
 *   CommandList,
 * } from "@/components/ui/command";
 *
 * export function Palette() {
 *   return (
 *     <Command label="Command palette">
 *       <CommandInput placeholder="Type a command or search..." />
 *       <CommandList>
 *         <CommandEmpty>No results found.</CommandEmpty>
 *         <CommandGroup heading="Suggestions">
 *           <CommandItem onSelect={() => console.log("calendar")}>Calendar</CommandItem>
 *         </CommandGroup>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * @see {@link CommandDialog}
 * @see {@link CommandInput}
 * @since 1.0.0
 */
function Command(props: CommandProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "label",
    "shouldFilter",
    "filter",
    "loop",
    "onEscapeKeyDown",
  ]);
  const [typed, setTyped] = useSignal("");
  const [version, setVersion] = useSignal(0);
  const items = new Map<string, ItemMeta>();
  const source: SearchSource = {};
  let generated = 0;
  // The controlled `value` of the input wins over what was typed; `version` re-reads it once the
  // input has registered.
  const search = (): string => {
    version();
    return source.value?.() ?? typed();
  };
  const context: CommandContextValue = {
    label: () => local.label,
    source,
    touch: () => setVersion((count) => count + 1),
    register(value, meta) {
      items.set(value, meta);
      return () => {
        if (items.get(value) === meta) items.delete(value);
      };
    },
    nextValue: () => {
      generated += 1;
      return `command-item-${generated}`;
    },
    escape: (event) => local.onEscapeKeyDown?.(event),
  };
  const filter = (item: ComboboxFilterItem, query: string): boolean => {
    const meta = items.get(item.value);
    const keywords = meta?.keywords() ?? [];
    const text = meta?.explicit() === false ? item.label : item.value;
    if (local.filter !== undefined) return local.filter(text, query, keywords) > 0;
    return matchesEveryWord([text, ...keywords].join(" "), query);
  };
  return (
    <div
      data-slot="command"
      class={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        local.class,
      )}
      {...rest}
    >
      <commandContext.Provider value={context}>
        <ComboboxPrimitive
          inline
          value={null}
          onValueChange={(value) => {
            // The palette keeps no selection: picking an item runs its handler.
            if (value !== null) items.get(value)?.select();
          }}
          inputValue={search()}
          onInputValueChange={(text, details) => {
            // Picking an item or leaving the field would rewrite the text; the search stays.
            if (details.reason !== "input" && details.reason !== "clear") return;
            setTyped(text);
            source.change?.(text);
          }}
          autoHighlight
          loop={local.loop}
          shouldFilter={local.shouldFilter}
          filter={filter}
        >
          {local.children}
        </ComboboxPrimitive>
      </commandContext.Provider>
    </div>
  );
}

/**
 * Props of {@link CommandDialog}: the dialog's props plus the palette's title, description and
 * options.
 * @see {@link CommandDialog}
 * @since 1.0.0
 */
export type CommandDialogProps = DialogProps & {
  /**
   * Accessible title of the dialog. It is visually hidden.
   * @default "Command Palette"
   */
  readonly title?: string | undefined;
  /**
   * Accessible description of the dialog. It is visually hidden.
   * @default "Search for a command to run..."
   */
  readonly description?: string | undefined;
  /**
   * Shows the close button in the corner of the dialog.
   * @default true
   */
  readonly showCloseButton?: boolean | undefined;
  /** Classes of the dialog panel. @default none */
  readonly class?: string | undefined;
  /** Props of the {@link Command} inside the dialog. @default none */
  readonly commandProps?: CommandProps | undefined;
};

/**
 * A {@link Command} in a modal dialog, for a palette opened with a keyboard shortcut or a button.
 * Escape closes the dialog unless `commandProps.onEscapeKeyDown` prevents it. When the dialog closes,
 * focus returns to the element that had focus when it opened, if it is still in the page.
 *
 * @param props The dialog props: see {@link CommandDialogProps}.
 * @returns The dialog, rendered in a portal while it is open.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { Button } from "@/components/ui/button";
 * import {
 *   CommandDialog,
 *   CommandEmpty,
 *   CommandInput,
 *   CommandItem,
 *   CommandList,
 * } from "@/components/ui/command";
 *
 * export function PaletteButton() {
 *   const [open, setOpen] = useSignal(false);
 *   return (
 *     <>
 *       <Button variant="outline" onClick={() => setOpen(true)}>
 *         Open palette
 *       </Button>
 *       <CommandDialog open={open()} onOpenChange={setOpen}>
 *         <CommandInput placeholder="Type a command or search..." />
 *         <CommandList>
 *           <CommandEmpty>No results found.</CommandEmpty>
 *           <CommandItem>Calendar</CommandItem>
 *         </CommandList>
 *       </CommandDialog>
 *     </>
 *   );
 * }
 * @see {@link Command}
 * @see {@link CommandDialogProps}
 * @since 1.0.0
 */
function CommandDialog(props: CommandDialogProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "title",
    "description",
    "children",
    "class",
    "showCloseButton",
    "commandProps",
    "open",
    "defaultOpen",
    "onOpenChange",
  ]);
  const t = useUiStrings();
  const [open, setOpen] = useControllableState<boolean>({
    value: () => local.open,
    defaultValue: () => local.defaultOpen === true,
    onChange: () => local.onOpenChange,
    name: "CommandDialog open",
  });
  // A palette is usually opened by a shortcut, with no trigger for the dialog to give focus back to.
  let opener: HTMLElement | undefined;
  return (
    <Dialog open={open()} onOpenChange={setOpen} {...rest}>
      <DialogContent
        class={cn("overflow-hidden p-0", local.class)}
        showCloseButton={local.showCloseButton}
        onOpenAutoFocus={() => {
          const active = document.activeElement;
          opener = active instanceof HTMLElement ? active : undefined;
        }}
        onCloseAutoFocus={(event: Event) => {
          if (opener?.isConnected !== true) return;
          event.preventDefault();
          opener.focus();
        }}
      >
        <DialogHeader class="sr-only">
          <DialogTitle>{local.title ?? t("command.title", "Command Palette")}</DialogTitle>
          <DialogDescription>
            {local.description ?? t("command.description", "Search for a command to run...")}
          </DialogDescription>
        </DialogHeader>
        <Command
          {...local.commandProps}
          onEscapeKeyDown={(event) => {
            local.commandProps?.onEscapeKeyDown?.(event);
            if (!event.defaultPrevented) setOpen(false);
          }}
          class={cn(
            "[&_[data-slot=command-group-heading]]:px-2 [&_[data-slot=command-group-heading]]:font-medium [&_[data-slot=command-group-heading]]:text-muted-foreground [&_[data-slot=command-group]:not([hidden])_~[data-slot=command-group]]:pt-0 [&_[data-slot=command-group]]:px-2 [&_[data-slot=command-input-wrapper]]:h-12 [&_[data-slot=command-input-wrapper]_svg]:size-5 [&_[data-slot=command-input]]:h-12 [&_[data-slot=command-item]]:px-2 [&_[data-slot=command-item]]:py-3 [&_[data-slot=command-item]_svg]:size-5",
            local.commandProps?.class,
          )}
        >
          {local.children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Props of {@link CommandInput}: the attributes of an `input` plus a controlled search text.
 * @see {@link CommandInput}
 * @since 1.0.0
 */
export type CommandInputProps = Omit<ComboboxInputProps, "value"> & {
  /** Controlled search text. The search is uncontrolled when it is not set. @default none */
  readonly value?: string | undefined;
  /** Called with the new search text whenever the user types. @default none */
  readonly onValueChange?: ((search: string) => void) | undefined;
};

/**
 * The search field of a {@link Command}, with a search icon. It keeps focus while the arrow keys move
 * through the list. Pass `value` and `onValueChange` to control the search text from your own state.
 * Its `aria-label` comes from the `label` of the {@link Command}.
 *
 * @param props The field props: see {@link CommandInputProps}. `class` goes to the `input`.
 * @returns The search field.
 * @throws Error when rendered outside a {@link Command}.
 * @example
 * import { useSignal } from "@shadow-js/core";
 * import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
 *
 * export function Search() {
 *   const [search, setSearch] = useSignal("");
 *   return (
 *     <Command label="Search">
 *       <CommandInput placeholder="Search..." value={search()} onValueChange={setSearch} />
 *       <CommandList>
 *         <CommandItem>Calendar</CommandItem>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * @see {@link Command}
 * @since 1.0.0
 */
function CommandInput(props: CommandInputProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "value", "onValueChange"]);
  const command = commandContext.use("CommandInput");
  command.source.value = () => local.value;
  command.source.change = (text) => local.onValueChange?.(text);
  useEffect(() => {
    // The first render happened before this input registered its controlled value.
    untrack(command.touch);
    onCleanup(() => {
      command.source.value = undefined;
      command.source.change = undefined;
    });
  });
  return (
    <div data-slot="command-input-wrapper" class="flex h-9 items-center gap-2 border-b px-3">
      <SearchIcon class="size-4 shrink-0 opacity-50" />
      <ComboboxPrimitive.Input
        data-slot="command-input"
        aria-label={command.label()}
        class={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent disabled:cursor-not-allowed disabled:opacity-50",
          local.class,
        )}
        {...rest}
      />
    </div>
  );
}

/**
 * Props of {@link CommandList}: the attributes of the list element.
 * @see {@link CommandList}
 * @since 1.0.0
 */
export type CommandListProps = ComboboxContentProps;

/**
 * The scrollable list of results: a `role="listbox"` named by the search field. It is always
 * rendered in place, and it scrolls when the results are taller than `max-h-[300px]`, the default
 * height limit.
 *
 * @param props The list props: see {@link CommandListProps}.
 * @returns The list.
 * @throws Error when rendered outside a {@link Command}.
 * @example
 * import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
 *
 * export function Results() {
 *   return (
 *     <Command>
 *       <CommandInput placeholder="Search..." />
 *       <CommandList class="max-h-72">
 *         <CommandItem>Calendar</CommandItem>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * @see {@link Command}
 * @since 1.0.0
 */
function CommandList(props: CommandListProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "onEscapeKeyDown"]);
  const command = commandContext.use("CommandList");
  return (
    <ComboboxPrimitive.Content
      data-slot="command-list"
      class={cn("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", local.class)}
      onEscapeKeyDown={(event: KeyboardEvent) => {
        local.onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) command.escape(event);
      }}
      {...rest}
    />
  );
}

/**
 * The message shown in the list while the search matches nothing.
 *
 * @param props The message props: the attributes of the rendered `div`.
 * @returns The message, or nothing while there are matches.
 * @throws Error when rendered outside a {@link Command}.
 * @example
 * import { Command, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";
 *
 * export function Empty() {
 *   return (
 *     <Command>
 *       <CommandInput placeholder="Search..." />
 *       <CommandList>
 *         <CommandEmpty>No results found.</CommandEmpty>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * @see {@link CommandList}
 * @since 1.0.0
 */
function CommandEmpty(props: ComboboxEmptyProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ComboboxPrimitive.Empty
      data-slot="command-empty"
      class={cn("py-6 text-center text-sm", local.class)}
      {...rest}
    />
  );
}

/**
 * Props of {@link CommandGroup}: the attributes of a `div` plus the visible `heading`.
 * @see {@link CommandGroup}
 * @since 1.0.0
 */
export type CommandGroupProps = ComboboxGroupProps & {
  /** The heading above the items. It names the group for assistive technology. @default none */
  readonly heading?: JsxChild | undefined;
};

/**
 * A group of commands under an optional visible `heading`. The heading names the group for assistive
 * technology. The group hides itself while the search matches none of its items.
 *
 * @param props The group props: see {@link CommandGroupProps}.
 * @returns The group.
 * @throws Error when rendered outside a {@link Command}.
 * @example
 * import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
 *
 * export function Settings() {
 *   return (
 *     <Command>
 *       <CommandInput placeholder="Search..." />
 *       <CommandList>
 *         <CommandGroup heading="Settings">
 *           <CommandItem>Profile</CommandItem>
 *         </CommandGroup>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * @see {@link CommandItem}
 * @since 1.0.0
 */
function CommandGroup(props: CommandGroupProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "heading", "children"]);
  return (
    <ComboboxPrimitive.Group
      data-slot="command-group"
      class={cn("overflow-hidden p-1 text-foreground", local.class)}
      {...rest}
    >
      <Show when={local.heading !== undefined}>
        <ComboboxPrimitive.Label
          as="div"
          data-slot="command-group-heading"
          class="px-2 py-1.5 text-xs font-medium text-muted-foreground"
        >
          {local.heading}
        </ComboboxPrimitive.Label>
      </Show>
      {local.children}
    </ComboboxPrimitive.Group>
  );
}

/**
 * A line between groups of commands. It is decorative, and hidden while the user is searching.
 *
 * @param props The separator props: the attributes of the rendered `div`.
 * @returns The separator.
 * @throws Error when rendered outside a {@link Command}.
 * @example
 * import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
 *
 * export function Sections() {
 *   return (
 *     <Command>
 *       <CommandInput placeholder="Search..." />
 *       <CommandList>
 *         <CommandGroup>
 *           <CommandItem>Calendar</CommandItem>
 *         </CommandGroup>
 *         <CommandSeparator />
 *         <CommandGroup>
 *           <CommandItem>Settings</CommandItem>
 *         </CommandGroup>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * @see {@link CommandGroup}
 * @since 1.0.0
 */
function CommandSeparator(props: ComboboxSeparatorProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ComboboxPrimitive.Separator
      data-slot="command-separator"
      class={cn("-mx-1 h-px bg-border", local.class)}
      {...rest}
    />
  );
}

/**
 * Props of {@link CommandItem}: the attributes of a `div` plus `value`, `keywords` and `onSelect`.
 * @see {@link CommandItem}
 * @since 1.0.0
 */
export type CommandItemProps = Omit<ComboboxItemProps, "value" | "onSelect"> & {
  /**
   * What the search matches and what `onSelect` receives. It must be unique in the palette.
   * @default the text of the item
   */
  readonly value?: string | undefined;
  /**
   * Extra words the search matches, such as synonyms.
   * @default []
   */
  readonly keywords?: readonly string[] | undefined;
  /**
   * Called with the item's value when it is picked by a click or by Enter.
   * @default none
   */
  readonly onSelect?: ((value: string) => void) | undefined;
};

/**
 * One command of a {@link Command}. Picking it, by a click or by Enter while it is highlighted, calls
 * `onSelect`. The highlighted item has `data-highlighted`; a disabled item cannot be highlighted or
 * picked. Its text is what the search matches, unless it has an explicit `value`.
 *
 * @param props The item props: see {@link CommandItemProps}.
 * @returns The command, or nothing while the search rejects it.
 * @throws Error when rendered outside a {@link Command}.
 * @example
 * import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
 *
 * export function Calendar() {
 *   return (
 *     <Command>
 *       <CommandInput placeholder="Search..." />
 *       <CommandList>
 *         <CommandItem value="calendar" keywords={["date"]} onSelect={(value) => console.log(value)}>
 *           Calendar
 *         </CommandItem>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * @see {@link CommandShortcut}
 * @since 1.0.0
 */
function CommandItem(props: CommandItemProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "value", "keywords", "onSelect", "children"]);
  const command = commandContext.use("CommandItem");
  const generated = command.nextValue();
  // Resolved once: the primitive reads the text of its children to label the item, and building
  // rich children twice would claim the same server nodes twice while hydrating.
  const content: JsxChild = untrack(() => local.children);
  const label = (): string | undefined => {
    const text = textOf(content).trim();
    return text === "" ? undefined : text;
  };
  const value = (): string => local.value ?? generated;
  const meta: ItemMeta = {
    explicit: () => local.value !== undefined,
    keywords: () => local.keywords ?? [],
    select: () => {
      const text = local.value ?? label() ?? "";
      untrack(() => local.onSelect?.(text));
    },
  };
  // Registered while rendering: the item's own visibility is computed before any effect runs.
  let release = untrack(() => command.register(value(), meta));
  useEffect(() => {
    const current = value();
    release();
    release = command.register(current, meta);
  });
  onCleanup(() => release());
  return (
    <ComboboxPrimitive.Item
      data-slot="command-item"
      value={value()}
      label={label()}
      class={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground forced-colors:data-highlighted:bg-[Highlight] forced-colors:data-highlighted:text-[HighlightText] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        local.class,
      )}
      {...rest}
    >
      {content}
    </ComboboxPrimitive.Item>
  );
}

/**
 * The keyboard shortcut hint at the end of a {@link CommandItem}. It is part of the item's text, so
 * the search matches it too.
 *
 * @param props The hint props: the attributes of the rendered `span`, and `children` (the shortcut).
 * @returns The shortcut hint.
 * @example
 * import { Command, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
 *
 * export function Shortcuts() {
 *   return (
 *     <Command>
 *       <CommandInput placeholder="Search..." />
 *       <CommandList>
 *         <CommandItem>
 *           Settings
 *           <CommandShortcut>Ctrl+S</CommandShortcut>
 *         </CommandItem>
 *       </CommandList>
 *     </Command>
 *   );
 * }
 * @see {@link CommandItem}
 * @since 1.0.0
 */
function CommandShortcut(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      data-slot="command-shortcut"
      class={cn("ms-auto text-xs tracking-widest text-muted-foreground", local.class)}
      {...rest}
    >
      {local.children}
    </span>
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
