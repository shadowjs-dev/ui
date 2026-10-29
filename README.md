<p align="center"><img src="https://raw.githubusercontent.com/shadowjs-dev/ui/main/.github/banner.png" alt="ShadowJS" width="100%"></p>

# @shadow-js/ui

[![npm](https://img.shields.io/npm/v/@shadow-js/ui.svg)](https://www.npmjs.com/package/@shadow-js/ui)
[![CI](https://github.com/shadowjs-dev/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/shadowjs-dev/ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](https://github.com/shadowjs-dev/ui/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.12-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue.svg)](https://www.typescriptlang.org/)

shadcn/ui for ShadowJS 1.0.0. The same model: you do not install components, you **copy them into your
project** and own them. They are styled with Tailwind v4 and the shadcn token set (`bg-background`,
`text-muted-foreground`, `ring-ring`, ...), themed with CSS variables, dark mode with a `.dark` class, and
they get their keyboard, focus and ARIA behavior from [`@shadow-js/primitives`](https://primitives.shadowjs.net).
## Install

`@shadow-js/ui` is the `shadow-ui` command plus a few shared helpers. Run it with `npx`; nothing needs to be
installed first. The project needs `@shadow-js/core`, `@shadow-js/web` and (for the components)
`@shadow-js/primitives`, a bundler (Vite with `@shadow-js/vite`, or Dusk) and Tailwind v4.

```bash
npx @shadow-js/ui init
```

`init` is safe to re-run: an existing file is kept unless you pass `--overwrite`. The exception is
`components.json`: when `--base-color` or `--css` changes its value, the file is rewritten in the standard layout
(its aliases stay; other keys are dropped).

| It does | Where |
| --- | --- |
| writes `components.json` (framework, stylesheet, base color, aliases) | project root |
| writes the theme stylesheet (base color variables, the Tailwind v4 token mapping, the animation utilities) | `shadow-ui.css`, next to your stylesheet |
| adds `@import "./shadow-ui.css";` after your Tailwind import (asks first, or `--yes`) | your stylesheet |
| writes `cn()` (clsx + tailwind-merge) | `@/lib/utils` |
| installs `clsx` and `tailwind-merge` (plus `tailwindcss` and `@tailwindcss/vite` when missing) with the package manager your lockfile indicates (the `packageManager` field wins, npm is the default) | terminal |
| prints what is left to do by hand (tsconfig alias, Vite alias, `ThemeProvider`) | terminal |

Options: `--base-color neutral|zinc|slate|stone|gray`, `--css src/styles.css`, `--yes`, `--overwrite`,
`--dry-run`, `--skip-install`, `--version` (the version of the installed package). `--base-color` and `--css` apply on
every run: with a `components.json` already there, `init` updates those two keys (your aliases stay) and regenerates the
theme only while it is still the file `init` wrote; `--overwrite` replaces everything. The Vite alias and Tailwind plugin
steps (also on Dusk) are printed only while `vite.config.*` lacks them. Without a terminal every question counts as
"no", so pass `--yes` in scripts.

## Quick start

```bash
npx @shadow-js/ui add button dialog
```

```tsx title="src/edit-profile.tsx" run mount="EditProfile"
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditProfile() {
  return (
    <Dialog>
      <DialogTrigger as={Button} variant="outline">
        Edit profile
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx title="edit-profile.test.tsx" test
import { cleanup, render, userEvent } from "@shadow-js/testing/dom";
import { afterEach, expect, it } from "vitest";
import { EditProfile } from "./src/edit-profile";

afterEach(cleanup);

it("opens a dialog named by its title, from a trigger that is a Button", () => {
  const view = render(() => <EditProfile />);
  const trigger = view.getByRole("button", { name: "Edit profile" });
  expect(trigger.getAttribute("data-slot")).toBe("dialog-trigger");
  expect(trigger.className).toContain("border");
  userEvent.click(trigger);
  const dialog = view.getByRole("dialog", { name: "Edit profile" });
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  userEvent.keyboard("{Escape}");
  expect(view.queryByRole("dialog")).toBeNull();
});
```

## The CLI

```bash
shadow-ui init            # components.json, lib/utils and the theme (see Install)
shadow-ui add <name...>   # copy components and everything they import (transitively)
shadow-ui add --all
shadow-ui list            # the registry; * marks components already in your project
shadow-ui diff [name...]  # your copy vs the registry, as a unified diff (exit 1 if it differs)
shadow-ui remove <name...> [--force]
shadow-ui completion <bash|zsh|fish>   # print a tab-completion script (see below)
```

`add` resolves `registryDependencies` (`alert-dialog` brings `button`, `dialog` brings `icons`; every component
brings `utils`), rewrites the imports in the copied files to **your** aliases from `components.json`, writes only
inside the project (an alias or `--path` that points outside is refused, symbolic links are resolved first), and
installs the npm packages the files import that your `package.json` lacks: other packages at the exact versions the
registry pins, and `@shadow-js/core`, `@shadow-js/web` and `@shadow-js/primitives` (for components built on a
primitive) without a version.

| Flag | Meaning |
| --- | --- |
| `--overwrite` / `-o` | replace files that differ from the registry. `--yes` alone never does this |
| `--dry-run` | print the plan and the diffs, change nothing, install nothing |
| `--yes` / `-y` | answer yes to "install packages?" and "edit your stylesheet?" |
| `--skip-install` | print the install command instead of running it |
| `--path <dir>` | `add`: write `ui` components to `<dir>` instead of the configured alias |
| `--all` / `-a` | `add`: every component |
| `--force` | `remove`: even when another component in your project imports it, or a file differs from the registry (you edited it) |
| `--cwd <dir>` | run in another directory |
| `--json` | every command: print one JSON document on stdout instead of words, and ask nothing (see "Output for scripts") |
| `--base-color <color>` | `init`: `neutral` (default), `zinc`, `slate`, `stone` or `gray` |
| `--css <file>` | `init`: the stylesheet that imports Tailwind |

`ls` and `rm` are aliases of `list` and `remove`. `shadow-ui help` (or `-h`) prints the usage, `-v` prints the
version, and `shadow-ui` with no command prints the usage and exits with code 1.

`shadow-ui completion` prints a script that completes the commands and the long flags. Install it once:
`source <(shadow-ui completion bash)` in bash (or save the output as `shadow-ui` in your bash-completion directory),
save `shadow-ui completion zsh` as `_shadow-ui` in a directory on your `$fpath` (zsh), or run
`shadow-ui completion fish > ~/.config/fish/completions/shadow-ui.fish` (fish). The script lists the flags, not
component names.

### Output for scripts

`--json` works on every command (and before it: `shadow-ui --json list`). It prints one JSON document on stdout, and
nothing else there: the progress lines are in `data`, warnings and errors also go to stderr, an installer's own output
goes to stderr, and nothing is asked (a file that differs is kept unless you pass `--overwrite`, as with `--yes`). The
exit code is the same with and without `--json`.

```json
{
  "schema": 1,
  "command": "shadow-ui add",
  "ok": true,
  "data": {
    "dryRun": false,
    "requested": ["dialog"],
    "dependencies": ["utils", "button"],
    "files": [
      { "path": "src/lib/utils.ts", "action": "unchanged" },
      { "path": "src/components/ui/button.tsx", "action": "create" },
      { "path": "src/components/ui/dialog.tsx", "action": "create" }
    ],
    "installs": [{ "status": "skipped", "manager": "npm", "packages": ["clsx@2.1.1"], "command": "npm install clsx@2.1.1" }]
  },
  "warnings": []
}
```

`ok` is true exactly when the exit code is 0. A failure adds `error: { "code": "SHADOW_UI_...", "message": "..." }`,
and `data` still holds what is known (a kept file with its diff, the components that differ). Aliases are named by their
command: `ls` is `shadow-ui list`, `rm` is `shadow-ui remove`.

| Command | `data` |
| --- | --- |
| `init` | `dryRun`, `config` (`baseColor`, `css`), `files` (`path`, `action`: `create`, `update`, `unchanged`, `kept` or `skipped`), `installs`, `nextSteps` |
| `add` | `dryRun`, `requested`, `dependencies` (what came with them), `files` (`path`, `action`: `create`, `unchanged`, `overwrite`, `kept` or `differs` for a dry run, plus the `diff` of a file that differs), `installs` |
| `list` | `initialized` (is there a `components.json`), `items` (`name`, `type`, `description`, `installed`) |
| `diff` | `components` (`name`, `path`, `status`: `up-to-date`, `differs` with its `diff`, or `missing`), `checked`, `differing` |
| `remove` | `dryRun`, `removed` (`name`, `path`), `kept` (`name`, `path`: edited files), `blocked` (`name`, `usedBy`) |
| `completion` | `shell`, `script` |
| `--help`, `--version` | `usage`, `version` |

`installs` lists each package-manager call as `status` (`installed`, `skipped`, `dry-run` or `failed`), `manager`, `packages` and
`command`. The error codes: `SHADOW_UI_UNKNOWN_COMMAND`, `SHADOW_UI_UNKNOWN_OPTION`, `SHADOW_UI_INVALID_OPTION`,
`SHADOW_UI_MISSING_COMMAND`, `SHADOW_UI_INVALID_SHELL`, `SHADOW_UI_INVALID_BASE_COLOR`, `SHADOW_UI_NO_PROJECT` (no
`package.json`), `SHADOW_UI_NO_CONFIG` (run `init` first), `SHADOW_UI_NO_COMPONENTS`, `SHADOW_UI_UNKNOWN_COMPONENT`,
`SHADOW_UI_INVALID_NAME`, `SHADOW_UI_REGISTRY_CONFLICT`, `SHADOW_UI_INVALID_FILE`, `SHADOW_UI_UNSAFE_PATH`,
`SHADOW_UI_FILES_DIFFER` (`add` or `remove` kept a file), `SHADOW_UI_DIFFERS` (`diff` found a difference), `SHADOW_UI_IN_USE`
(`remove` refused), `SHADOW_UI_INSTALL_FAILED`, `SHADOW_UI_FAILED` and `SHADOW_UI_UNEXPECTED`.

```bash
# Fail a CI step when a copied component drifted from the registry, and say which files.
shadow-ui diff --json | jq -r '.data.components[] | select(.status == "differs") | .path'
# The components you have not added yet.
shadow-ui list --json | jq -r '.data.items[] | select(.installed | not) | .name'
```

A file that differs is shown as a diff and kept (exit code 1) unless you pass `--overwrite` or answer yes to the
prompt. The registry ships inside this package: no network is needed except for installing npm packages.

## Project setup

`init` prints these when they are missing. TypeScript needs the alias and so does the bundler.

```jsonc
// tsconfig.json
{ "compilerOptions": { "jsx": "preserve", "jsxImportSource": "@shadow-js/web", "paths": { "@/*": ["./src/*"] } } }
```

In `vite.config.ts` add `resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } }` and
`tailwindcss()` from `@tailwindcss/vite` next to the ShadowJS plugin (`shadow()`, or `dusk()` in a Dusk app).
A Dusk app needs both too: Dusk adds neither the `@` alias nor Tailwind, so `init` prints both steps for it when they
are missing. For a new stylesheet, Dusk defaults to `src/app.css`. The entry stylesheet:

```css
/* src/index.css */
@import "tailwindcss";
@import "./shadow-ui.css";
```

Server-rendered pages hydrate. A dialog that is open at render time is server-rendered too: its portal markup goes to
the end of `<body>`, and hydration adopts it.
## Theming

Colors are CSS variables in `:root` and `.dark`; Tailwind v4 maps them with `@theme inline`, so `bg-primary`
works and a theme change is a variable change. The generated `shadow-ui.css` contains:

- the variables of your base color (`neutral` default; `zinc`, `slate`, `stone`, `gray`; each also ships as
  `@shadow-js/ui/themes/<base>.css` with the same variable set),
- the radius scale (`--radius` drives `rounded-sm|md|lg|xl`),
- `@custom-variant dark (&:is(.dark, .dark *))` and the base layer (`border-border`, `bg-background`),
- the animation utilities (`animate-in`, `fade-in-0`, `zoom-in-95`, `slide-in-from-top-2`, `animate-accordion-down`...),
  a small stand-in for `tw-animate-css`, collapsed under `prefers-reduced-motion`.

Prefer imports over copies? `@import "@shadow-js/ui/theme.css"; @import "@shadow-js/ui/animations.css";` after
Tailwind does the same from the package for the `neutral` base color (import `@shadow-js/ui/themes/<base>.css` after
`theme.css` for another one). Change the look by editing the variables:

```css
:root { --radius: 0.5rem; --primary: oklch(0.55 0.2 260); --primary-foreground: oklch(0.98 0 0); }
.dark { --primary: oklch(0.7 0.15 260); }
```

Chart tokens (`--chart-1` to `--chart-5`) and sidebar tokens (`--sidebar*`) are included.

## Dark mode

Dark mode is the `dark` class on `<html>` (or a `data-*` attribute). Two pieces, both optional: a provider that
keeps the choice, and a script in `<head>` that applies it before the first paint. With `attribute="data-theme"`, the
stylesheet's dark styles (`@custom-variant dark` and the `.dark` variables) must select `[data-theme=dark]` instead.

```tsx title="src/mode-toggle.tsx" run mount="App"
import { ThemeProvider, useTheme } from "@shadow-js/ui";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`Theme: ${theme()}`}
      onClick={() => setTheme(resolvedTheme() === "dark" ? "light" : "dark")}
    >
      {resolvedTheme() === "dark" ? "Dark" : "Light"}
    </Button>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
      <ModeToggle />
    </ThemeProvider>
  );
}
```

```tsx title="mode-toggle.test.tsx" test
import { fakeColorScheme } from "@docs/fixtures";
import { cleanup, render, userEvent } from "@shadow-js/testing/dom";
import { afterEach, beforeEach, expect, it } from "vitest";
import { App } from "./src/mode-toggle";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
});
afterEach(cleanup);

it("starts from the system, toggles the html class and remembers the choice", () => {
  const system = fakeColorScheme(false);
  const view = render(() => <App />);
  const button = view.getByRole("button");
  expect(document.documentElement.classList.contains("light")).toBe(true);
  userEvent.click(button);
  expect(button.getAttribute("aria-label")).toBe("Theme: dark");
  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(window.localStorage.getItem("my-app-theme")).toBe("dark");
  system.restore();
});
```

`ThemeProvider` persists the choice in `localStorage`, follows `prefers-color-scheme` while the theme is
`"system"`, syncs between tabs, and is SSR-safe: it touches nothing before it has mounted, so `resolvedTheme()`
is `undefined` on the server and on the first client render (hydration never mismatches). If the browser blocks
`localStorage`, the choice still applies for the current page.

**No flash**: `themeScript()` returns a dependency-free ES5 script as text; put it in a `<script>` in `<head>` and the
theme is applied before first paint. `themeScriptTag({ nonce, ...options })` returns it wrapped in a `<script nonce>` tag for servers
that build their own document. Pass the same `storageKey`, `defaultTheme`, `attribute` (`"class"` or a `data-*` name such as `"data-theme"`)
and `enableSystem` to the script and the provider.

```ts title="src/theme-head.ts" typecheck
import { themeScript, themeScriptTag } from "@shadow-js/ui";

export const inline = themeScript({ defaultTheme: "system" }); // JavaScript text
export const tag = themeScriptTag({ nonce: "abc123", storageKey: "my-app-theme" }); // a ready <script nonce="abc123">
```

In Dusk, the metadata API does not put scripts in `<head>`. Use `createHandler`'s `document.head` option instead: it can
be a function that receives the request event, so `document: { head: (event) => themeScriptTag({ nonce: event.nonce }) }`
puts the nonce of that response on the script.
## Components

Every component below is `shadow-ui add <name>`. Item names are kebab-case; exports keep shadcn's names.
`as` replaces `asChild`.

<!-- COMPONENTS-TABLE:start -->
| Item | What it is | Exports | Also adds |
| --- | --- | --- | --- |
| `accordion` | A vertically stacked set of interactive headings that each reveal a section of content. | Accordion, AccordionContent, AccordionItem, AccordionTrigger | `icons` |
| `alert` | Displays a callout for user attention. | Alert, AlertAction, AlertDescription, AlertTitle, alertVariants |  |
| `alert-dialog` | A modal dialog that interrupts the user with important content and expects a response. | AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, ... | `button` |
| `aspect-ratio` | Displays content within a desired ratio. | AspectRatio |  |
| `attachment` | A file or an image with its media, name, details, upload state and actions, for composers, threads and upload lists. | Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, ... | `button` |
| `avatar` | User images with fallbacks, size variants, status badges and overlapping groups. | Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage, ... |  |
| `badge` | Displays a badge or a component that looks like a badge. | Badge, badgeVariants |  |
| `breadcrumb` | Displays the path to the current resource using a hierarchy of links. | Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, ... | `icons`, `ui-strings` |
| `bubble` | A framed message bubble for chat text, short structured output, quoted replies, suggestions and reactions. | Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleVariants |  |
| `button` | Displays a button or a component that looks like a button. | Button, buttonVariants |  |
| `button-group` | Buttons and inputs that sit together as one control, with the inner corners square and the borders joined. | ButtonGroup, ButtonGroupSeparator, ButtonGroupText |  |
| `calendar` | A month grid to pick one day, several days or a range, with a keyboard grid, locale names and month and year navigation. | Calendar, CalendarDayCell, CalendarLabels, isCalendarDay | `button`, `icons`, `ui-strings` |
| `card` | Displays a card with header, content, and footer. | Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, ... |  |
| `carousel` | Slides with buttons, arrow keys, indicators, drag and opt-in autoplay, on native scroll-snap; no carousel library. | Carousel, CarouselApi, CarouselContent, CarouselEvent, CarouselIndicators, CarouselItem, ... | `button`, `icons`, `ui-strings` |
| `chart` | Themeable SVG line, area, bar, pie, donut and radial charts with axes, a keyboard-navigable tooltip and legend, and a table for screen readers. | ChartActivePoint, ChartArea, ChartBar, ChartConfig, ChartContainer, ChartDatum, ... | `chart-scale`, `ui-strings` |
| `chart-scale` | Pure functions for charts: scales, nice ticks, line, area and arc paths, pie angles, stacking and decimation. | ChartCurve, ChartPoint, PieAngle, PieAngleOptions, arcPath, areaPath, ... |  |
| `checkbox` | A control that allows the user to toggle between checked, unchecked and indeterminate. | Checkbox | `icons` |
| `code-block` | Code, terminal output, logs and diffs, with an optional header, line numbers, wrapping and a copy button. | CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockFooter, CodeBlockHeader, ... | `button`, `icons`, `ui-strings` |
| `collapsible` | An interactive component which expands/collapses a panel. | Collapsible, CollapsibleContent, CollapsibleTrigger |  |
| `combobox` | An input with a filtered list of options, with single or multiple (chips) selection. | Combobox, ComboboxChip, ComboboxChipRemove, ComboboxChips, ComboboxChipsInput, ComboboxClear, ... | `icons`, `ui-strings` |
| `command` | A command palette: a search field and a filtered, keyboard-navigable list of commands, inline or in a dialog. | Command, CommandDialog, CommandEmpty, CommandFilter, CommandGroup, CommandInput, ... | `dialog`, `icons`, `ui-strings` |
| `context-menu` | Displays a menu to the user, such as a set of actions or functions, triggered by a right click or long press. | ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ... | `icons` |
| `data-table` | A data table over @shadow-js/table: sortable headers, pagination, column visibility and selection state. | DataTable, DataTableColumnHeader, DataTablePagination, DataTablePaginationLabels, DataTableViewOptions | `button`, `dropdown-menu`, `table`, `ui-strings` |
| `date-picker` | A date text field with a calendar in a popover; typed dates follow the locale and are checked against the limits. | DatePicker | `button`, `calendar`, `input`, `popover`, `ui-strings` |
| `dialog` | A window overlaid on the primary window, rendering the content underneath inert. | Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, ... | `icons`, `ui-strings` |
| `direction` | A provider that sets the reading direction (left to right or right to left) for the components below it, and a hook that reads it. | DirectionProvider, useDirection |  |
| `drawer` | A bottom sheet for mobile: drag the grip to snap it between heights or dismiss it, with the keyboard as well; it is a dialog. | Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerDirection, DrawerFooter, ... | `ui-strings` |
| `dropdown-menu` | Displays a menu to the user, such as a set of actions or functions, triggered by a button. | DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, ... | `icons` |
| `empty` | An empty-state block: media, title, description and the next action. | Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle |  |
| `field` | Form field layout: a label, a control, a description and an error, wired to one control with the ids a form needs. | Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, ... |  |
| `form` | Accessible form wiring for any form library: a Form root, field ids, labels, descriptions, error messages and an error summary. | Form, FormApiLike, FormControl, FormDescription, FormErrorSummary, FormField, ... | `label`, `ui-strings` |
| `hover-card` | For sighted users to preview content available behind a link. | HoverCard, HoverCardContent, HoverCardTrigger |  |
| `icons` | The inline SVG icons the components use (check, chevrons, close, search...). Replace with your icon library if you prefer. | AlignCenterIcon, AlignLeftIcon, AlignRightIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ... |  |
| `input` | A form input field. | Input |  |
| `input-group` | A text control with addons (text, icons, buttons) on its sides, sharing one border and focus ring. | InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea |  |
| `input-otp` | A one-time code with custom character patterns, digit normalization, paste, autofill and RTL keyboard navigation. | InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS, ... | `ui-strings` |
| `item` | A row of media, content and actions, in a group, that can be a link. | Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ... |  |
| `kbd` | Used to display textual user input from keyboard. | Kbd, KbdGroup |  |
| `label` | Renders an accessible label associated with controls. | Label |  |
| `marker` | An inline note in a conversation: a status update, a system message, a bordered row or a labeled separator. | Marker, MarkerContent, MarkerIcon, markerVariants |  |
| `menubar` | A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands. | Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, ... | `icons` |
| `message` | One message in a conversation: the avatar, the alignment, a header, the content and a footer of actions. | Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader, ... |  |
| `message-scroller` | A chat transcript scroller that keeps the reader's place while a reply streams: anchored turns, following the newest text, history loading and a jump button. | MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport, ... | `icons`, `ui-strings` |
| `native-select` | The browser's own select, styled like an input, with its picker and keyboard support. | NativeSelect, NativeSelectOptGroup, NativeSelectOption | `icons` |
| `navigation-menu` | Site navigation with flyout content, keyboard arrows between triggers, Escape to close and focus return. | NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, ... | `icons` |
| `pagination` | Pagination with page navigation, next and previous links. | Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationItems, PaginationLink, ... | `button`, `icons`, `ui-strings` |
| `password-input` | A password field with a show and hide button, a strength meter slot and a Caps Lock hint, built on the PasswordToggleField primitive. | PasswordInput, PasswordInputState, PasswordStrength, scorePassword, usePasswordInput | `ui-strings` |
| `popover` | Displays rich content in a portal, triggered by a button. | Popover, PopoverAnchor, PopoverClose, PopoverContent, PopoverDescription, PopoverHeader, ... |  |
| `progress` | A compact or composable progress bar with a track, indicator, visible label and value. | Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue |  |
| `questionnaire` | A multi-step form of single-choice, multiple-choice, free-text and skippable questions, one at a time, with progress, validation and keyboard shortcuts. | Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireDescription, QuestionnaireError, ... | `button`, `ui-strings` |
| `radio-group` | A set of checkable buttons, known as radio buttons, where no more than one can be checked at a time. | RadioGroup, RadioGroupItem | `icons` |
| `resizable` | Panels with draggable handles: pointer and keyboard resizing with bounds, an optional saved layout, and right-to-left support. | ResizableHandle, ResizablePanel, ResizablePanelGroup, resizeSizes | `icons`, `ui-strings` |
| `scroll-area` | A scrollable region with thin custom scrollbars, a draggable thumb and keyboard scrolling. | ScrollArea, ScrollBar |  |
| `select` | Displays a list of options for the user to pick from, triggered by a button. | Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, ... | `icons` |
| `separator` | Visually or semantically separates content. | Separator |  |
| `sheet` | Extends the Dialog component to display content that complements the main content of the screen. | Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, ... | `icons`, `ui-strings` |
| `sidebar` | A composable, collapsible sidebar that becomes a sheet on mobile, with menus, groups, tooltips and a Ctrl/Cmd+B shortcut. | SIDEBAR_COOKIE_NAME, Sidebar, SidebarContent, SidebarContextValue, SidebarCookieOptions, SidebarFooter, ... | `button`, `icons`, `input`, `separator`, `sheet`, `skeleton`, `tooltip`, `ui-strings`, `use-mobile` |
| `skeleton` | Use to show a placeholder while content is loading. | Skeleton |  |
| `slider` | An input where the user selects a value, or a range, from within a given range. | Slider |  |
| `spinner` | An indicator that can be used to show a loading state. | Spinner | `icons`, `ui-strings` |
| `switch` | A control that allows the user to toggle between checked and not checked. | Switch |  |
| `table` | A responsive table component. | Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, ... |  |
| `tabs` | A set of layered sections of content, known as tab panels, that are displayed one at a time. | Tabs, TabsContent, TabsList, TabsTrigger |  |
| `textarea` | A multi-line text field that grows with its content. | Textarea |  |
| `toast` | Toast stores (useToast in components, createToaster in module code) and the Toaster that shows their notifications, after Sonner. | ExternalToast, ToastAction, ToastAddOptions, ToastApi, ToastPosition, ToastPromiseContent, ... | `button`, `icons`, `ui-strings` |
| `toggle` | A two-state button that can be either on or off. | Toggle, toggleVariants |  |
| `toggle-group` | A set of two-state buttons that can be toggled on or off. | ToggleGroup, ToggleGroupItem | `toggle` |
| `tooltip` | A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it. | Tooltip, TooltipContent, TooltipProvider, TooltipTrigger |  |
| `trace` | A list of lines for the steps an agent takes: reasoning, tool calls, sources, plans and tasks, each with an icon, a title and a status, and optionally expandable. | Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, ... | `collapsible`, `icons` |
| `ui-strings` | Translates the built-in words of the kit (Close, Next, Page n of m): a provider and a hook that read a pack such as the Arabic one. | UiStringValues, UiStringsCatalog, UiStringsProvider, UiTranslate, formatUiString, useUiLocale, ... |  |
| `use-highlighted-code` | Syntax highlighting for code blocks with Shiki: a hook for the browser and an async function for the server, one element per line. | HighlightedLine, HighlightedToken, highlightCode, useHighlightedCode |  |
| `use-mobile` | A hook that tells whether the viewport is narrower than 768px. Used by the sidebar. | useIsMobile |  |
| `utils` | The cn() helper: clsx plus tailwind-merge. Every component imports it. | ClassValue, cn |  |
<!-- COMPONENTS-TABLE:end -->

## Conventions

- **`class`, not `className`.** It merges with the component's classes through `cn()`: your classes win
  (`<Button class="px-8">` replaces `px-4`).
- **`as` instead of `asChild`.** Parts people render as something else take `as`: a tag name or a component
  (`<DialogTrigger as={Button} variant="outline">`, `<DropdownMenuItem as="a" href="/profile">`,
  `<BreadcrumbLink as={Link} href="/docs">`). Handlers compose (yours runs first and can `preventDefault()`).
- **`data-slot`** on every element, for styling hooks (`[data-slot=card-title]`).
- **Controlled and uncontrolled**: `open`/`defaultOpen`/`onOpenChange`, `value`/`defaultValue`/`onValueChange`,
  `checked`/`defaultChecked`/`onCheckedChange`.
- **Components run once.** Read props where they are used (`local.x` inside JSX or a closure); do not branch on
  props with an early `return`, use `<Show>` or a conditional inside the JSX.
- **Icons** are inline SVG from the `icons` item (the Lucide shapes); swap in any icon library by editing the
  imports.
- **Variants** use `class-variance-authority`: `buttonVariants`, `badgeVariants`, `toggleVariants`,
  `alertVariants` and `sidebarMenuButtonVariants` are exported so links and other elements can look the same.

## Differences from shadcn/ui

The components read shadcn's token names (`--background`, `--primary`, `--radius`, ...), so a `globals.css` that
defines the same variables keeps working. In your own code: `className` becomes `class`,
`asChild` becomes `as`, `forwardRef` is gone (`ref` is a plain prop), `useState` becomes `useStore`, `lucide-react`
becomes the `icons` item, `next-themes` becomes `ThemeProvider`/`useTheme`, `sonner` becomes the `toast` item, and
the `--radix-*` CSS variables in custom classes become `--primitives-*` (`transform-origin`, `anchor-width`,
`available-height`, `accordion-content-height`). Item by item:

| Component | Difference from shadcn/ui |
| --- | --- |
| `button`, `badge` | `as` replaces `asChild`. `button` sizes: `default`, `xs`, `sm`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg`. `Button` does not set `type`, so inside a form it submits unless you pass `type="button"`. |
| `input`, `textarea`, `label` | Plain elements; `Label` wraps the Label primitive (`htmlFor`). `aria-invalid` styles the field. |
| `checkbox`, `switch`, `radio-group`, `toggle`, `toggle-group`, `slider`, `progress` | State hooks are the primitives' `data-state` values (`checked` or `unchecked` for checkbox, switch and radio, plus `indeterminate` for checkbox; `on` or `off` for toggles; `loading`, `complete` or `indeterminate` for progress), and `forced-colors:` variants keep state visible in high contrast. `Slider` takes `value`/`defaultValue` arrays. |
| `select` | `SelectTrigger` takes `size` (`sm` or `default`); `SelectContent` takes `position`: `"popper"` (the default here; Radix defaults to item-aligned) or `"item-aligned"`, which puts the chosen item over the trigger and costs nothing when unused. Long lists scroll with scroll buttons that a finger stops when it lifts. With a `name` it takes part in native forms. |
| `combobox` | An item of its own on the Combobox primitive (`ComboboxInput`, `ComboboxContent`, `ComboboxItem`, chips for `multiple`). A `defaultValue` shows its label before the list was ever opened (the closed list's items report their text); `itemToString` is for server rendering and late items. Home and End jump to the first and last option once one is highlighted. |
| `command` | A command palette on the Combobox primitive in its `inline` mode (the list is plain markup right below the field, never a popup). `CommandItem` takes `onSelect`, `value`, `keywords`; `Command` takes `shouldFilter`, `filter` (a `CommandFilter` score function) and `loop`. Home and End jump to the first and last item. The highlighted item is not exposed as `value`/`onValueChange`; `CommandInput` `value` is the search text. |
| `form` | Not react-hook-form. `Form` is the provider counterpart: a `form` wired to the object `useForm` from `@shadow-js/forms` returns (any object with `fieldAt` and `handleSubmit` fits), so a `FormField` takes its field by `name`. Without it `FormField` takes any `{ value, error, touched, onInput, onBlur }` object (each member a value or an accessor). `FormControl` merges `id`, `aria-describedby`, `aria-invalid`, `disabled`, `ref` and the field's handlers into the element you pass with `as`, and `render` also gets `setValue` and `field`. `FormErrorSummary` lists the problems of a failed submit with links to the controls and takes focus (shadcn has none). A submit marks every field touched, and the kit shows an error once the field is touched or the form was submitted. |
| `dialog`, `alert-dialog`, `sheet` | `showCloseButton` on `DialogContent`/`SheetContent`. `DialogTrigger as={Button}` replaces `asChild`. `Sheet` sides: `top`, `bottom`, `left`, `right` (the physical edges) and `start`, `end` (flip in RTL). `alert-dialog` focuses `Cancel` first and ignores outside presses. |
| `popover`, `hover-card`, `tooltip` | `PopoverClose`, `PopoverHeader/Title/Description` added (a popover needs an accessible name). `Tooltip` wraps itself in a zero-delay provider only when none is above it. `HoverCard` takes `delay` (shadcn's name for `openDelay`; it is a root prop, the delays live on the root), and `HoverCardContent` takes `side` (`bottom` by default). |
| `field` | `FieldError` takes `errors` (a validator's `{ message }` entries): one message is shown as text, several as a list, a repeated message once. An empty list hides the error. |
| `input-group` | `InputGroupButton` takes `size` (`xs` by default, `sm`, `icon-xs`, `icon-sm`) and `variant` (`ghost` by default, then the Button item's variants), as shadcn does. Its classes come from this item, not from `button`. |
| `dropdown-menu`, `context-menu`, `menubar` | Items take `as`, `inset` and `variant="destructive"`. An uncontrolled checkbox or radio item resets when the menu closes (the items unmount): use `checked` / `value` for state you keep. |
| `tabs`, `accordion`, `collapsible` | `accordion` and `collapsible` heights animate with `animate-accordion-down/up` and `animate-collapsible-down/up` from `animations.css`. `TabsList` takes `variant` (`default`, or `line` for a transparent list with an underline under the selected tab). |
| `resizable` | `ResizablePanelGroup` takes `direction` or shadcn's `orientation` (`direction` wins when both are given). |
| `toggle-group` | `ToggleGroup` takes `spacing` (default `0`: the items are connected; any other value puts a gap between them, in spacing units). In a vertical connected group the ends round their top and bottom corners. |
| `pagination` | Built on the Pagination primitive: `PaginationItems` renders the page list from `pageCount`/`page` (siblings, ellipsis); `PaginationItem` renders the `li` and its link together. |
| `breadcrumb`, `card`, `alert`, `table`, `separator`, `skeleton`, `aspect-ratio`, `kbd`, `spinner` | `class` replaces `className`. `BreadcrumbLink` takes `as` (use your router's link). `Separator` is decorative by default. |
| `avatar` | There is no avatar primitive: the item tracks the image's load state itself (fallback on the server, until load, and on error; optional `delayMs`). |
| `toast` | Sonner-like calls (`toast.success/error/warning/info/loading/promise/dismiss`) from `useToast()` in components under a `<Toaster />`, or from `createToaster()` in module code. Each toaster has its own store unless it is given one. On the Toast primitive. Not sonner: no stacked-card animation. |
| `sidebar` | `side="start" \| "end"` or shadcn's `"left" \| "right"`. State is remembered only when asked: `cookieName="sidebar_state"` writes shadcn's cookie (`sidebarCookie` and `readSidebarCookie` serve it from a server), `storageKey` uses `localStorage`. `SidebarProvider isMobile` overrides detection (`useIsMobile`, the `use-mobile` item). Mobile shows the sidebar in a `sheet`. The trigger has `aria-expanded`, and an off-canvas sidebar that is collapsed makes its header, content and footer `inert`. |
| `chart` | No Recharts: SVG line, area, bar, pie, donut and radial charts (`ChartLine`, `ChartArea`, `ChartBar`, `ChartPie`, `ChartRadial`) inside a `ChartContainer`. `ChartTooltip`, `ChartTooltipContent`, `ChartLegend` and `ChartLegendContent` are children of a chart, with `children` instead of a `content` prop. Colors are one CSS color per series (`--chart-1` to `--chart-5` by default), without a `theme` pair. The scales and paths are the `chart-scale` item. |
| `password-input` | Not in shadcn. A show/hide toggle, a strength meter slot (`PasswordStrength`, `scorePassword`, `usePasswordInput`), a Caps Lock hint and `autocapitalize`, `spellcheck` and `autocorrect` turned off. |
| `icons`, `utils` | Inline SVG replaces `lucide-react`; `cn()` is shadcn's `lib/utils`. |
| `ui-strings` | Not in shadcn. `UiStringsProvider` and `useUiStrings` give the built-in words of the components (Close, Next, Page n of m) to a language pack; see "Translating the kit". |

## Translating the kit

The components carry a few words of their own ("Close", "Next", "Page 2 of 9", "Toggle Sidebar", the names of the
calendar buttons). Each has an English default in its source. To change the language of the whole app, wrap it in
`UiStringsProvider` (the `ui-strings` item) with a pack; a prop such as `labels` or `toggleLabel` on a component still
wins over the provider.

| Pack | Import | What it is |
| --- | --- | --- |
| English | `@shadow-js/ui/locales/en` | The defaults, as a catalog of messages. |
| Arabic | `@shadow-js/ui/locales/ar` | The same keys in Arabic, with the six Arabic plural cases. |

A pack is plain data (a nested object of strings in the ICU MessageFormat of `@shadow-js/i18n`: `{name}`, `{n, number}`,
`{n, plural, ...}`), so it also drops into a `createI18n` catalog. A test checks that every key of the English pack exists
in the Arabic pack with the same arguments and that every plural has the cases of its language.

```tsx title="src/arabic-app.tsx" typecheck
import ar from "@shadow-js/ui/locales/ar";
import type { JSX } from "@shadow-js/web";
import { UiStringsProvider } from "@/lib/ui-strings";

export function ArabicApp(props: { children: JSX.Element }): JSX.Element {
  return (
    <UiStringsProvider strings={ar} locale="ar">
      <div dir="rtl" lang="ar">
        {props.children}
      </div>
    </UiStringsProvider>
  );
}
```

The Arabic pack was reviewed by a native Arabic speaker. Words differ between regions, so have your own audience check the wording that matters to your product.

## Registry format

`registry.json` (also importable as `@shadow-js/ui/registry.json`) is the machine-readable index the CLI and the
documentation read. One entry per item:

```jsonc
{
  "name": "dialog", "type": "ui", "title": "Dialog", "description": "...",
  "files": [{ "path": "registry/dialog/dialog.tsx", "type": "ui" }],
  "registryDependencies": ["icons", "utils"],              // other items it imports
  "dependencies": { },                                     // npm packages (exact versions); button has class-variance-authority
  "exports": ["Dialog", "DialogContent", "..."],           // the API, for documentation
  "primitives": ["Dialog", "..."],                         // what it imports from @shadow-js/primitives
  "tailwind": { "tokens": ["background", "accent", "..."], "animations": true }
}
```

It is generated from the files (`node scripts/build-registry.mjs`) and a test fails when it is stale. Item types:
`ui` (goes to `aliases.ui`), `lib` (`aliases.lib`; `utils` goes to `aliases.utils`), `hook` (`aliases.hooks`).
Sources import each other through the canonical aliases (`@/components/ui/button`, `@/lib/utils`,
`@/hooks/use-mobile`), which the CLI rewrites to yours.

## Accessibility, RTL, forced colors, reduced motion

- Roles, names, `aria-*` relationships, focus management, keyboard maps and typeahead come from the primitives
  and follow the WAI-ARIA Authoring Practices; the components add looks and never change the semantics. You provide
  the names: a `Label` or `aria-label` for every control, a title in every dialog.
- **RTL**: classes are logical (`ms-*`, `pe-*`, `start-*`, `text-start`, `border-s`), directional icons flip with
  `rtl:rotate-180`, and the primitives flip arrow keys and placement with `dir="rtl"`. A test fails on physical
  `left/right` utilities, except for `Sheet` with `side="left"` or `"right"`.
- **Forced colors**: custom-drawn state (checkbox, radio, switch, slider, progress, toggle, menu highlight)
  has `forced-colors:` variants so state stays visible in Windows high contrast mode.
- **Reduced motion**: the animation utilities collapse to ~0ms under `prefers-reduced-motion: reduce`.

## API

The package exports the helpers the components share and the theme provider. Components are not exported; they are
copied.

```ts title="src/ui-api.ts" typecheck
import {
  applyTheme,
  type ClassValue,
  cn,
  cva,
  DEFAULT_STORAGE_KEY,
  isTheme,
  readStoredTheme,
  resolveTheme,
  ThemeProvider,
  themeScript,
  themeScriptTag,
  useTheme,
  type VariantProps,
  writeStoredTheme,
} from "@shadow-js/ui";

export type Cx = ClassValue;
export type Variants = VariantProps<ReturnType<typeof cva>>;
export const helpers = [cn, cva, applyTheme, isTheme, readStoredTheme, resolveTheme, writeStoredTheme];
export const theme = [ThemeProvider, useTheme, themeScript, themeScriptTag, DEFAULT_STORAGE_KEY];
```

| Export | Signature |
| --- | --- |
| `cn(...inputs)` | `(...ClassValue[]) => string`; clsx + tailwind-merge |
| `cva`, `VariantProps` | re-exported from `class-variance-authority` |
| `ThemeProvider` | props `defaultTheme`, `storageKey`, `attribute`, `enableSystem`, `disableTransitionOnChange`, `children` |
| `useTheme()` | `{ theme(), resolvedTheme(), systemTheme(), setTheme(theme \| (prev) => theme) }` |
| `themeScript(options)` | the no-flash inline script text |
| `themeScriptTag({ nonce, ...options })` | the same wrapped in a `<script nonce>` tag |
| `resolveTheme(theme, systemPrefersDark, enableSystem)` / `applyTheme(root, resolved, attribute)` | the pure parts |
| `isTheme`, `readStoredTheme`, `writeStoredTheme`, `DEFAULT_STORAGE_KEY` | storage helpers and the default key (`"shadow-ui-theme"`) |

CSS exports: `@shadow-js/ui/theme.css`, `@shadow-js/ui/animations.css`, `@shadow-js/ui/themes/<base>.css`.
Locale packs (data only): `@shadow-js/ui/locales/en`, `@shadow-js/ui/locales/ar`.
Everything is documented with TSDoc in the sources.

## Links

- [`@shadow-js/primitives`](https://primitives.shadowjs.net): the headless behavior under every component
- [`@shadow-js/forms`](https://forms.shadowjs.net): fields for the `form` item

## Dependencies

- Runtime `@shadow-js/table` `1.0.0`: imported only as types by the data-table item (`registry/data-table/data-table.tsx`).
- Runtime `class-variance-authority` `0.7.1`: `cva` and `VariantProps` (`src/index.ts`).
- Runtime `clsx` `2.1.1` and `tailwind-merge` `3.7.0`: class merging behind `cn` (`registry/utils/utils.ts`).
- Peers: `@shadow-js/core`, `@shadow-js/primitives`, and `@shadow-js/web` `^1.0.0`: the behavior and rendering under each component.

## Types

- Names from the root: `cn`, `cva`, `ClassValue`, `VariantProps`, `RegistryItem`.
- Type tests in `test-types/` are compile-time checks; `npm run typecheck:types` runs them.

## Support

- Node.js `>=22.12.0`. ESM only: use `import`; `require` is not supported.
- Browsers: current evergreen releases.
- Versioning: every `@shadow-js/*` package releases together at one version. Upgrade them as one set.
- Documentation: [ShadowJS documentation](https://shadowjs.net).

## Using, changing and contributing

- **Use the package** (a person or a coding agent that builds with it): this README, and [SKILL.md](SKILL.md), the short page an agent reads first.
- **Change the package** (fix a bug, add a feature): [AGENTS.md](AGENTS.md) says how the repository is laid out, how to implement and test a change, and how a pull request is reviewed. It is written for people and coding agents alike.
- **Take part**: [CONTRIBUTING.md](CONTRIBUTING.md) is the short guide; [SECURITY.md](SECURITY.md) is for vulnerabilities.
