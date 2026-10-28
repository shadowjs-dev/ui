# Changelog

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
