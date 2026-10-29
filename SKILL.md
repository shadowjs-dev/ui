---
name: shadowjs-ui
description: "Work with @shadow-js/ui. shadcn-style components you add to your project with a CLI, styled with Tailwind v4. Use when a project imports it, or when asked to add, configure or debug it."
---

# @shadow-js/ui

Version 1.0.3. shadcn-style components you add to your project with a CLI, styled with Tailwind v4.

## Where to read more

- @shadow-js/ui: https://ui.shadowjs.net
- Source and issues: https://github.com/shadowjs-dev/ui
- The package README is the full reference for options and behavior; read it before changing a configuration.

## Install

```sh
npm install @shadow-js/ui @shadow-js/core @shadow-js/primitives @shadow-js/web
```

## Peer dependencies

| Package | Range | Required |
| --- | --- | --- |
| `@shadow-js/core` | `^1.0.3` | yes |
| `@shadow-js/primitives` | `^1.0.3` | yes |
| `@shadow-js/web` | `^1.0.3` | yes |

## Import paths

Import only from these paths. Never from `dist` or `src`: files that are not listed here are private and change without notice.

- `@shadow-js/ui`
- `@shadow-js/ui/locales/en`
- `@shadow-js/ui/locales/ar`

## Quick start

```bash
npx @shadow-js/ui add button dialog
```

## Working rules

- Run `npm run check` before proposing a change; it lints, builds, type-checks and tests.
- Keep a public change documented: TSDoc on every exported symbol, and a CHANGELOG entry.
- To change this repository rather than use the package, read AGENTS.md: the layout, the commands, the rules and how a pull request is reviewed.
