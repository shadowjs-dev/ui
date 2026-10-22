# AGENTS.md: working on ui

This file is for anyone who changes this repository, people and coding agents alike. It says how the repository is laid out, how to implement
and test a change, and how a pull request is reviewed. To **use** the released package, read [README.md](README.md) and [SKILL.md](SKILL.md)
instead; to take part in the project, read [CONTRIBUTING.md](CONTRIBUTING.md).

Copy-in components built on the primitives, with a CLI, Tailwind v4, and left-to-right and right-to-left layouts.

## What is in this repository

| Package | Folder | What it is | Documentation |
| --- | --- | --- | --- |
| `@shadow-js/ui` | `.` | shadcn-style components you add to your project with a CLI, styled with Tailwind v4 | https://ui.shadowjs.net |

The repository is the package: `@shadow-js/ui`. Source and issues:
https://github.com/shadowjs-dev/ui. Every package of the project has the same version number.

## Set up

You need Node.js 22.12 or newer and npm (pnpm and Yarn are not used).

```sh
npm install
npm run check   # lint, build, type check and every test
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run lint` | Biome: lint and format check (`npx biome check --write <path>` fixes what it can) |
| `npm run build` | builds the package with tsdown |
| `npm run typecheck` | TypeScript 7 in strict mode, tests included |
| `npm test` | unit, DOM and server tests (Vitest) |
| `npx vitest run <path>` | one test file |
| `npm run test:gc` | memory and leak tests |
| `npm run test:perf` | wall-clock budgets; run alone, never in parallel with other work |
| `npm run check` | all of the above; a change is ready when it passes |

## Layout

- `.github/`: workflows, issue and pull request templates, code owners.
- `build/`: the shared tsdown preset every package build uses.
- `registry/`: the components, one folder each, with their styles and metadata.
- `scripts/`: build and release scripts; `release.mjs` is run by the workflows.
- `src/`: the source of the package; one folder per concern, `index.ts` re-exports the public API. Folders: `cli/`, `locales/`, `theme/`.
- `styles/`: shared styles of the components.
- `test/`: the tests; one file per behavior, each test named by an invariant id such as `[ROUTER-12]`.
- `test-types/`: type-level tests: what the package promises to the compiler of its users.
- `types/`: ambient declarations shared with the build.
- `CHANGELOG.md`: what each release changed.
- `biome.json`: lint and format rules.
- `package.json`: the manifest; `version` is changed only by a release.
- `tsconfig.json`: type check of the source.
- `tsconfig.test-types.json`: type check of `test-types/`.
- `tsdown.config.mjs`: the build.
- `vitest.config.ts`: the test projects (unit, DOM, server, gc, perf).
- `vitest.setup.ts`: test setup: an unasserted `console.warn` or `console.error` fails a test.

## How to implement a change

1. **Find where the behavior lives.** Search `test/` and `src/` for the name of the behavior or its invariant id, then read the source the tests exercise. The invariants below say what must stay true.
2. **Write the failing test first.** A bug fix reproduces the bug; a feature states the behavior it promises. Name the test with an invariant id in square brackets, the way the neighboring tests do, then the behavior in words. The test asserts what the code does and is never skipped, marked as todo or marked as an expected failure.
3. **Make it pass with the smallest change** that keeps the invariants. Match the code around it.
4. **Keep the surface honest.** A public symbol has TSDoc (summary, parameters, return value, an example and `@since`). An error says what happened and how to fix it. User-visible behavior gets a documentation update and a line under `## Unreleased` in CHANGELOG.md.
5. **Run `npm run check`** and read its output; do not report a change as done without it passing.

### Rules every change keeps

- No `any`, `@ts-ignore` or non-null assertion. Use `unknown` and narrow.
- Compare indices, lengths and counts explicitly (`=== undefined`, `=== -1`, `> 0`), never by truthiness.
- No empty `catch`: every catch rethrows, passes the error to the owner's handler, or reports it. Every "set the current X" register is restored in `finally`.
- User callbacks run untracked unless the API says otherwise. No stack parsing, no `fn.name` sniffing, no flags stamped on user functions.
- Traversals whose depth the user controls are iterative. Caches, queues and recursion are bounded, and a test hits the bound.
- Code meant for development only sits behind `__DEV__`. No import-time side effects and no module-level mutable state beyond the registers the core owns (bounded caches and `WeakMap`s excepted).
- No sleeps in tests (flush the scheduler); a `console.warn` or `console.error` that a test does not assert fails the test. Property tests use `fast-check` with a fixed seed.
- Files are kebab-case, tests are `*.test.ts`, internals live in `src/internal/`. American English in code, comments and documentation. Comments explain why, not what.
- The reactive core and the DOM renderer have no runtime dependencies.

## Pull requests

1. **Open an issue first** for anything that adds or changes public API, behavior, supported platforms or dependencies. A small fix needs no issue.
2. **Fork, then branch from `main`** (`fix/<topic>`, `feat/<topic>`, `docs/<topic>`). One concern per pull request.
3. **Commit in small steps** with a message that says what changed and why: a short type prefix (`fix:`, `feat:`, `docs:`, `test:`, `chore:`), then the subject. Commit under your own identity; do not add trailers or notes about tools.
4. **Open the pull request against `main`** and fill in the template: what changes, why, and the checks you ran. The CI workflow (`.github/workflows/ci.yml`) runs lint, build, type check and all tests; it must be green.
5. **Review.** A maintainer (see `.github/CODEOWNERS`) reviews every pull request. Expect questions about the test, the public surface and the error messages. Push fixes to the same branch; the pull request is squash-merged.
6. **Releases are not part of a pull request.** Do not change `version`, `.github/workflows/release.yml` or `scripts/release.mjs`, and do not create tags or publish. A maintainer releases by renaming `## Unreleased` in the changelog to the version and pushing a version that is not yet on npm to `main`; the workflow publishes it with provenance.

Security problems never go in a public issue or pull request: follow [SECURITY.md](SECURITY.md).

## Architecture and invariants

What each package keeps true. A change that breaks one of these is a bug in the change.

This package is the shadcn/ui replacement for ShadowJS:
copy-paste-owned components (the **registry**), Tailwind v4 theming, a CLI that copies components
into a project, and a few library helpers. The headless behavior (keyboard, focus, ARIA) always
comes from `@shadow-js/primitives`; components here only add looks.

### Layout
```
registry/<name>/<name>.tsx   one registry item per folder (+ optional .css); item.json = metadata
registry/<name>/item.json    { "title", "description", "type"?: "ui" | "lib" | "hook" }  (written LAST)
registry.json                GENERATED by `node scripts/build-registry.mjs` (never edit by hand)
tsconfig.registry.json       GENERATED alongside it: the `paths` for the copied-in import aliases
styles/                      theme.css, theme-core.css, themes/<base>.css (generated), animations.css
src/                         library (cn, cva, ThemeProvider, themeScript), the CLI (src/cli) and the locale packs (src/locales: data only)
scripts/                     build-registry.mjs, build-themes.mjs (plain ESM, `.d.mts` for tests)
test/                        *.dom.test.ts (happy-dom), *.test.ts (node); test/fixtures/*.tsx; test/support
```

### Registry component rules (these files are copied into user projects)
1. **Imports**: only `@shadow-js/core`, `@shadow-js/web` (types and `Show`/`For`...),
   `@shadow-js/primitives` (root only, named imports), `class-variance-authority`, and the project
   aliases `@/components/ui/<item>`, `@/hooks/<item>`, `@/lib/<item>` (`utils`, `ui-strings`, `chart-scale`). No relative imports, no other
   package (the build script fails on an unknown one). `cn` comes from `@/lib/utils`.
2. **Shape**: `function Name(props: ...): JSX.Element` with TSDoc (summary, `@example`,
   `@since 1.0.0`), one `export { A, B }` list at the end, shadcn's export names
   (`Dialog`, `DialogTrigger`, `buttonVariants`...). Every rendered element has shadcn's
   `data-slot="<kebab-name>"`. Props types are exported (`export type XProps`) when a user would
   want to extend them.
3. **Props**: never destructure props (it still works through the compiler, but `splitProps` keeps
   intent explicit and types exact). `const [local, rest] = splitProps(props, ["class", ...])`,
   then `class={cn("base", local.class)} {...rest}`. Optional props are declared
   `readonly x?: T | undefined` (`exactOptionalPropertyTypes`). `class` (not `className`).
4. **Primitive wrappers**: type the props with the primitive's exported `XProps` types.
   Parts people render as something else (Trigger, Close, Cancel, Action, menu Items, links) are
   generic and polymorphic so `as={Button}` replaces shadcn's `asChild`:
   ```tsx
   type Loose = { readonly as?: PolymorphicTarget; readonly class?: ClassValue; readonly [prop: string]: unknown };
   function DialogTrigger<T extends PolymorphicTarget = "button">(props: DialogTriggerProps<T>): JSX.Element {
     return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;   // or splitProps(props as unknown as Loose, [...])
   }
   ```
   Other parts may use the default-target props type (non-generic). Never reimplement keyboard,
   focus, ARIA, positioning or presence: if a primitive lacks something, report it under
   "Needed from other packages" instead of working around it.
5. **Classes**: Tailwind v4, shadcn v4 ("new-york-v4") class lists with the token set
   (`bg-background text-foreground border-input ring-ring bg-primary text-primary-foreground muted
   accent destructive card popover sidebar...`). Every class must be a real Tailwind utility or a
   class from `styles/animations.css` (a test compiles all of them; a typo fails it).
   - Radix CSS variables map to ours: `--radix-*-content-transform-origin` -> `--primitives-transform-origin`,
     `--radix-*-trigger-width` -> `--primitives-anchor-width`, `--radix-*-content-available-height`
     -> `--primitives-available-height`, accordion/collapsible heights -> `--primitives-accordion-content-height`
     / `--primitives-collapsible-content-height`. Tailwind v4 syntax: `origin-(--primitives-transform-origin)`.
   - **RTL-safe**: logical utilities only (`ms-* me-* ps-* pe-* start-* end-* text-start text-end
     border-s border-e rounded-s rounded-e`); direction-dependent transforms and icons get `rtl:`
     flips (`rtl:rotate-180`, `rtl:-translate-x-1/2`); side-based popper classes use `data-[side=...]`.
   - **Forced colors**: custom-drawn state (checkbox, radio, switch, slider, progress, toggle on)
     adds `forced-colors:` variants so state stays visible (e.g. `forced-colors:data-[state=checked]:bg-[Highlight]`).
   - **Reduced motion**: animation comes from `animate-in/out` utilities, which `animations.css`
     switches off under `prefers-reduced-motion`; custom transitions add `motion-reduce:transition-none`.
   - Dark mode is the `dark:` variant (`.dark` class on `<html>`).
   - Need a keyframe or utility? Append it at the END of `styles/animations.css` under a comment
     naming your component (append only; never reorder or edit existing rules).
6. **Reactivity** (user code is compiled with forgiving reactivity ON, so tests compile the same way):
   read props where they are used (`local.x` inside JSX/closures), never branch on props with an
   early `return` (use `<Show>` or `{cond && <X/>}` inside the JSX), no module-level state.
7. **Types**: must compile under `tsconfig.registry.json` (strict, exactOptionalPropertyTypes,
   noUncheckedIndexedAccess, jsx preserve + jsxImportSource `@shadow-js/web`). No `any`,
   `@ts-ignore`, non-null assertions, empty `catch`. Casts only through `unknown` and only to the
   `Loose` shape above.
8. **Icons**: use `@/components/ui/icons` (inline SVG), never an icon package.
9. **Words**: every user-visible default string (an `aria-label`, an `sr-only` text, a status message) goes through
   `useUiStrings()` from `@/lib/ui-strings`: `t("dialog.close", "Close")`, with the English text as the second
   argument and `{name}` / plural arguments for values. The key must exist in `src/locales/en.ts` with the same text
   (a test reads every `t("key", "text")` call), and in `src/locales/ar.ts` with the same arguments and the six
   Arabic plural cases. A prop of the component (`labels`, `toggleLabel`) still wins over the provider. The pack
   files are data: no comments, no logic.
10. **Dependencies**: a registry item may use a third-party package only if it is in
   `package.json` (`dependencies`); `class-variance-authority` is the only one so far.

### Tests (write them first)
- One `test/<name>.dom.test.ts` per item + `test/fixtures/<name>.tsx` (an app using the item through
  its user-facing imports; fixtures are compiled for `dom` and `ssr` by `test/support/compile.ts`,
  which rewrites `@/components/ui/x` and `@shadow-js/primitives` to the generated files).
- Load with `await loadFixture<...>("dom" | "ssr", "<name>")`; render with `render` from
  `@shadow-js/testing` (`userEvent`, `fireEvent`, `cleanup`); `ssrAndHydrate`, `key`, `q`, `must`
  are in `test/support/dom.ts`. No sleeps: effects flush with `flushSync()` (userEvent already does).
- Invariant ids `[UI-<ABBR>-NN]` in every test name. Per component assert: role and ARIA wiring
  (names, labels, `aria-*`), `data-slot`, the classes of each variant/size/state, controlled and
  uncontrolled use, disabled, keyboard and pointer interaction through the primitives, `class`
  overrides winning (tailwind-merge), `rtl` where direction matters, and for every overlay /
  portal component an SSR -> hydrate parity test (the server markup's elements are the hydrated
  ones). Un-asserted `console.warn/error` fails a test.
- No `.skip` / `.only` / `.todo`. Run: `npx vitest run test/<name> --testTimeout=30000`.

### Checks (from the repo root)
- `node scripts/build-registry.mjs --lenient` regenerates registry.json and the paths
  (run it after adding or renaming an item; it is atomic, so parallel runs are safe).
- `npx tsc -p tsconfig.json` (library + CLI + tests, isolatedDeclarations) and
  `npx tsc -p tsconfig.registry.json` (registry + fixtures, user-project strictness).
- `npx biome check --write packages/ui`.
- `npx vitest run packages/ui --testTimeout=30000`.

### CLI (src/cli)
Pure functions (registry resolution, import rewriting, path safety, diffing, package-manager
detection) live apart from the command layer so they are tested without a filesystem. The command
layer takes its filesystem, prompt, install and output as parameters. Offline and deterministic: the
registry ships inside the package. Never write outside the project root; never overwrite without
`--overwrite` (or an explicit yes); registry names are validated (`^[a-z0-9]+(-[a-z0-9]+)*$`).

## Where to look next

- [README.md](README.md): what the package does and every option.
- [SKILL.md](SKILL.md): how to use the released package (install, import paths, a quick start).
- [CONTRIBUTING.md](CONTRIBUTING.md): the short guide to taking part.
- [CHANGELOG.md](CHANGELOG.md): what each release changed.
- [ShadowJS hub](https://github.com/shadowjs-dev/shadow): every repository of the project.
