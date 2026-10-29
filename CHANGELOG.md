# Changelog

## 1.0.3

### Fixed

- `shadow-ui init` checks every path (`components.json`, the theme file, the stylesheet, `lib/utils`) before it writes the first file, so a refused `--css ../outside.css` leaves the project untouched and a later `init` works.
- Alias mapping uses the most specific `paths` pattern (the longest prefix, as TypeScript does), so `@/components/*` wins over `@/*`.
- `paths` and `baseUrl` are read through `extends` (relative files, packages in `node_modules`, arrays), resolved from the config that declares them, with a bounded and cycle-safe chain.
- The package manager is found in parent folders too (`packageManager` field and lockfiles, nearest folder wins), so a package in a workspace no longer gets npm.
- `shadow-ui remove` keeps a file that differs from the registry (exit 1, named in the output and in `--json` as `kept`) unless `--force` is given.
- `ThemeProvider` treats a `storage` event with a null key (`localStorage.clear()` in another tab) as the theme being removed and goes back to the default theme.

## 1.0.2

### Fixed

- `Carousel` runs the `onPointerEnter`, `onPointerLeave`, `onFocusIn` and `onFocusOut` handlers you pass (they were dropped), takes `[handler, data]` tuples for its handlers and for `InputGroupAddon`'s `onClick`, and never starts autoplay with a `NaN` or infinite interval.
- A carousel whose slides come and go (a list that shrinks, is filtered or is replaced) counts only the slides that exist: the "n of N" names, the indicators, `scrollSnapList()` and the current index follow the list, and `reInit` fires once after the change settles.
- `ChartContainer` falls back to its default width for a `NaN` or infinite `initialWidth`, and a `ResizableHandle` that unmounts mid-drag stops listening to the pointer.
- `shadow-ui add` refuses to write through a dangling symbolic link that points outside the project, reads `package.json`, `components.json` and tsconfig files that start with a byte order mark, reports a tsconfig that is not JSON as an invalid file instead of crashing, and treats the end of input (Ctrl-D) at a prompt as "no" instead of exiting with code 13.
- `input-group` and `carousel` now import `callHandler` and `mergeElementProps` from `@shadow-js/primitives`; run `shadow-ui diff` to see the update for components you copied earlier.
- `shadow-ui add --path <dir>` writes the imports between the copied ui components as `./name` when `<dir>` is not the directory the `ui` alias names (they used to import from the alias, a directory that does not hold them); with the default directory nothing changes.
- `shadow-ui add` and `diff` keep at most 16 million array cells (64 MB) while diffing; two files that share almost nothing become one replacement instead of allocating gigabytes.
- `ResizablePanelGroup` follows its panels: a panel that mounts after the first render takes its place in document order and a share of the 100 percent, a panel that unmounts gives its share back, and the handles keep resizing the panels on both sides of them. A remembered layout is brought inside the panels' `minSize` and `maxSize` and scaled to sum to 100 (one with a negative, infinite or missing size is ignored).
- `ResizablePanelGroup`, `ResizablePanel` and `ResizableHandle` are tested to call a `ref` the application passes next to their own (they already did; the test pins it).
- `shadow-ui add` can no longer write outside the project through a dangling relative symlink inside a linked folder: the path guard resolves the link's target from the folder's real place, as the operating system does, instead of from the folder as written.

## 1.0.1

### Changed

- Released at 1.0.1 with the other packages, which share one version. No change to this package.

## 1.0.0

### Added

- Chat and agent items: `message-scroller` (a thread that follows new text, keeps the reader's place and jumps to the latest), `message`, `bubble`, `marker`, `attachment`, `trace`, `code-block` (with copy, line numbers and diff lines), `use-highlighted-code` (Shiki colors, loaded on first use), and `questionnaire` (a multi-step form, one question at a time). `direction` (`DirectionProvider`, `useDirection`) sets the reading direction for the components below it.
- `typeset.css` (`@shadow-js/ui/typeset.css`): one stylesheet for rendered text, with `typeset-docs` and `typeset-chat` presets, zero specificity and streaming-safe spacing. The `shimmer`, `scroll-fade-x` and `scroll-fade-y` utilities in `animations.css`.
- Fifty more icons in `icons`.
- A 73-item registry (it was 63). The registry's `tailwind.animations` flag also covers `shimmer` and `scroll-fade-*`.
- `--json` on every `shadow-ui` command, in one documented contract (schema 1: `schema`, `command`, `ok`, `data`, `warnings` and, on failure, `error: { code, message }` with a stable `SHADOW_UI_` code). `init`, `add`, `diff` and `remove` report their files (each with an action, and the diff of a file that differs), `installs` and next steps; `list --json` is now `data.items`. Stdout carries only the document, the package manager's output goes to stderr, nothing is asked, a command line that does not parse and an uncaught exception are documents too, and the exit codes are unchanged.
- InputOTP character patterns and digit/letter pattern constants, including reactive values, RTL navigation, normalized numerals and native form behavior.

- Chart: line, area, bar, pie, donut and radial charts as SVG, with axes, grid, stacking, smooth and stepped curves, a tooltip and legend API (`ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`), a roving tab stop with a live announcement, a table for screen readers, thinning above 5,000 points, reduced motion, locale digits and right-to-left mirroring. The scales and paths are the new `chart-scale` item.
- Form: the `Form` root over any form library object (the `@shadow-js/forms` form fits), `FormErrorSummary`, and `ref`, `onFocus`, `disabled` and `setValue` wiring in `FormControl`.
- Sidebar: `cookieName` with `sidebarCookie`, `readSidebarCookie` and `SIDEBAR_COOKIE_NAME`, `aria-expanded` on the trigger, and inert collapsed off-canvas content.
- Password input: a strength meter slot (`PasswordStrength`, `scorePassword`, `usePasswordInput`), a Caps Lock hint, and autocapitalize, spellcheck and autocorrect turned off.
- `ui-strings` item (`UiStringsProvider`, `useUiStrings`) and the data packs `@shadow-js/ui/locales/en` and `@shadow-js/ui/locales/ar` for the built-in words of the components. The Arabic pack needs a native speaker's review before release.
- A 63-item component registry with Tailwind themes and application-owned component source.
- A CLI for initializing projects and adding, comparing and removing registry components.
- Avatar size variants, status badges, overlapping groups and group counts.
- Composable progress track, indicator, label and value parts.
- Data-table column visibility menus with localized labels and keyboard control.
- Object-style toast add and close methods, with native action button props.
