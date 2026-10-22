import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const exact = (entries: [string, string][]) =>
  entries.map(([specifier, path]) => ({
    find: new RegExp(`^${specifier.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}$`),
    replacement: source(path),
  }));

// This repository's own packages are imported from source, so a test run needs no build.
const own: [string, string][] = [];
// The other ShadowJS packages come from node_modules, as the build an app would get: the browser development build for DOM and unit
// tests, the server development build for server tests. Naming the files keeps every package on one build, so there is one copy of core.
const fromClient: [string, string][] = [
  [
    "@shadow-js/primitives/password-toggle-field",
    "./node_modules/@shadow-js/primitives/dist/dev/password-toggle-field/index.js",
  ],
  [
    "@shadow-js/primitives/one-time-password",
    "./node_modules/@shadow-js/primitives/dist/dev/one-time-password/index.js",
  ],
  [
    "@shadow-js/primitives/navigation-menu",
    "./node_modules/@shadow-js/primitives/dist/dev/navigation-menu/index.js",
  ],
  [
    "@shadow-js/primitives/dropdown-menu",
    "./node_modules/@shadow-js/primitives/dist/dev/dropdown-menu/index.js",
  ],
  [
    "@shadow-js/primitives/alert-dialog",
    "./node_modules/@shadow-js/primitives/dist/dev/alert-dialog/index.js",
  ],
  [
    "@shadow-js/primitives/context-menu",
    "./node_modules/@shadow-js/primitives/dist/dev/context-menu/index.js",
  ],
  [
    "@shadow-js/primitives/number-field",
    "./node_modules/@shadow-js/primitives/dist/dev/number-field/index.js",
  ],
  [
    "@shadow-js/primitives/toggle-group",
    "./node_modules/@shadow-js/primitives/dist/dev/toggle-group/index.js",
  ],
  [
    "@shadow-js/primitives/collapsible",
    "./node_modules/@shadow-js/primitives/dist/dev/collapsible/index.js",
  ],
  [
    "@shadow-js/primitives/radio-group",
    "./node_modules/@shadow-js/primitives/dist/dev/radio-group/index.js",
  ],
  [
    "@shadow-js/primitives/scroll-area",
    "./node_modules/@shadow-js/primitives/dist/dev/scroll-area/index.js",
  ],
  [
    "@shadow-js/router/prefetch-report",
    "./node_modules/@shadow-js/router/dist/dev/features/prefetch-report.js",
  ],
  [
    "@shadow-js/forms/standard-schema",
    "./node_modules/@shadow-js/forms/dist/dev/standard-schema.js",
  ],
  [
    "@shadow-js/primitives/hover-card",
    "./node_modules/@shadow-js/primitives/dist/dev/hover-card/index.js",
  ],
  [
    "@shadow-js/primitives/pagination",
    "./node_modules/@shadow-js/primitives/dist/dev/pagination/index.js",
  ],
  [
    "@shadow-js/primitives/accordion",
    "./node_modules/@shadow-js/primitives/dist/dev/accordion/index.js",
  ],
  [
    "@shadow-js/primitives/separator",
    "./node_modules/@shadow-js/primitives/dist/dev/separator/index.js",
  ],
  ["@shadow-js/testing/auto-cleanup", "./node_modules/@shadow-js/testing/dist/dev/auto-cleanup.js"],
  ["@shadow-js/compiler/javascript", "./node_modules/@shadow-js/compiler/dist/dev/javascript.js"],
  ["@shadow-js/forms/submit-errors", "./node_modules/@shadow-js/forms/dist/dev/submit-errors.js"],
  [
    "@shadow-js/primitives/calendar",
    "./node_modules/@shadow-js/primitives/dist/dev/calendar/index.js",
  ],
  [
    "@shadow-js/primitives/checkbox",
    "./node_modules/@shadow-js/primitives/dist/dev/checkbox/index.js",
  ],
  [
    "@shadow-js/primitives/combobox",
    "./node_modules/@shadow-js/primitives/dist/dev/combobox/index.js",
  ],
  [
    "@shadow-js/primitives/progress",
    "./node_modules/@shadow-js/primitives/dist/dev/progress/index.js",
  ],
  ["@shadow-js/web/jsx-dev-runtime", "./node_modules/@shadow-js/web/dist/prod/jsx-dev-runtime.js"],
  [
    "@shadow-js/primitives/menubar",
    "./node_modules/@shadow-js/primitives/dist/dev/menubar/index.js",
  ],
  [
    "@shadow-js/primitives/popover",
    "./node_modules/@shadow-js/primitives/dist/dev/popover/index.js",
  ],
  [
    "@shadow-js/primitives/toolbar",
    "./node_modules/@shadow-js/primitives/dist/dev/toolbar/index.js",
  ],
  [
    "@shadow-js/primitives/tooltip",
    "./node_modules/@shadow-js/primitives/dist/dev/tooltip/index.js",
  ],
  [
    "@shadow-js/router/transitions",
    "./node_modules/@shadow-js/router/dist/dev/features/transitions.js",
  ],
  [
    "@shadow-js/router/link-status",
    "./node_modules/@shadow-js/router/dist/dev/features/link-status.js",
  ],
  ["@shadow-js/testing/playwright", "./node_modules/@shadow-js/testing/dist/dev/playwright.js"],
  ["@shadow-js/primitives/dialog", "./node_modules/@shadow-js/primitives/dist/dev/dialog/index.js"],
  ["@shadow-js/primitives/popper", "./node_modules/@shadow-js/primitives/dist/dev/popper/index.js"],
  ["@shadow-js/primitives/select", "./node_modules/@shadow-js/primitives/dist/dev/select/index.js"],
  ["@shadow-js/primitives/slider", "./node_modules/@shadow-js/primitives/dist/dev/slider/index.js"],
  ["@shadow-js/primitives/switch", "./node_modules/@shadow-js/primitives/dist/dev/switch/index.js"],
  ["@shadow-js/primitives/toggle", "./node_modules/@shadow-js/primitives/dist/dev/toggle/index.js"],
  ["@shadow-js/primitives/label", "./node_modules/@shadow-js/primitives/dist/dev/label/index.js"],
  ["@shadow-js/primitives/toast", "./node_modules/@shadow-js/primitives/dist/dev/toast/index.js"],
  ["@shadow-js/primitives/utils", "./node_modules/@shadow-js/primitives/dist/dev/utils.js"],
  [
    "@shadow-js/router/announcer",
    "./node_modules/@shadow-js/router/dist/dev/features/announcer.js",
  ],
  [
    "@shadow-js/router/not-found",
    "./node_modules/@shadow-js/router/dist/dev/features/not-found.js",
  ],
  ["@shadow-js/table/visibility", "./node_modules/@shadow-js/table/dist/dev/visibility.js"],
  ["@shadow-js/testing/matchers", "./node_modules/@shadow-js/testing/dist/dev/matchers.js"],
  ["@shadow-js/primitives/menu", "./node_modules/@shadow-js/primitives/dist/dev/menu/index.js"],
  ["@shadow-js/primitives/tabs", "./node_modules/@shadow-js/primitives/dist/dev/tabs/index.js"],
  ["@shadow-js/router/blockers", "./node_modules/@shadow-js/router/dist/dev/features/blockers.js"],
  ["@shadow-js/router/prefetch", "./node_modules/@shadow-js/router/dist/dev/features/prefetch.js"],
  ["@shadow-js/router/relative", "./node_modules/@shadow-js/router/dist/dev/features/relative.js"],
  ["@shadow-js/table/expanding", "./node_modules/@shadow-js/table/dist/dev/expanding.js"],
  ["@shadow-js/web/jsx-runtime", "./node_modules/@shadow-js/web/dist/prod/jsx-runtime.js"],
  ["@shadow-js/router/loaders", "./node_modules/@shadow-js/router/dist/dev/features/loaders.js"],
  ["@shadow-js/router/filters", "./node_modules/@shadow-js/router/dist/dev/features/filters.js"],
  ["@shadow-js/router/pending", "./node_modules/@shadow-js/router/dist/dev/features/pending.js"],
  ["@shadow-js/table/grouping", "./node_modules/@shadow-js/table/dist/dev/grouping.js"],
  ["@shadow-js/table/faceting", "./node_modules/@shadow-js/table/dist/dev/faceting.js"],
  ["@shadow-js/table/ordering", "./node_modules/@shadow-js/table/dist/dev/ordering.js"],
  ["@shadow-js/testing/routes", "./node_modules/@shadow-js/testing/dist/dev/routes.js"],
  ["@shadow-js/router/scroll", "./node_modules/@shadow-js/router/dist/dev/features/scroll.js"],
  ["@shadow-js/router/errors", "./node_modules/@shadow-js/router/dist/dev/features/errors.js"],
  ["@shadow-js/router/search", "./node_modules/@shadow-js/router/dist/dev/features/search.js"],
  ["@shadow-js/table/pinning", "./node_modules/@shadow-js/table/dist/dev/pinning.js"],
  ["@shadow-js/forms/server", "./node_modules/@shadow-js/forms/dist/dev/server.js"],
  ["@shadow-js/forms/arrays", "./node_modules/@shadow-js/forms/dist/dev/arrays.js"],
  ["@shadow-js/table/sizing", "./node_modules/@shadow-js/table/dist/dev/sizing.js"],
  ["@shadow-js/table/layout", "./node_modules/@shadow-js/table/dist/dev/layout.js"],
  ["@shadow-js/table/locale", "./node_modules/@shadow-js/table/dist/dev/locale.js"],
  ["@shadow-js/core/extend", "./node_modules/@shadow-js/core/dist/dev/extend/index.js"],
  ["@shadow-js/forms/async", "./node_modules/@shadow-js/forms/dist/dev/async.js"],
  ["@shadow-js/forms/dates", "./node_modules/@shadow-js/forms/dist/dev/dates.js"],
  ["@shadow-js/router/core", "./node_modules/@shadow-js/router/dist/dev/core/index.js"],
  ["@shadow-js/router/vite", "./node_modules/@shadow-js/router/dist/vite/index.js"],
  ["@shadow-js/router/head", "./node_modules/@shadow-js/router/dist/dev/features/head.js"],
  ["@shadow-js/testing/dom", "./node_modules/@shadow-js/testing/dist/dev/dom.js"],
  ["@shadow-js/core/store", "./node_modules/@shadow-js/core/dist/dev/store/index.js"],
  ["@shadow-js/forms/full", "./node_modules/@shadow-js/forms/dist/dev/full.js"],
  ["@shadow-js/primitives", "./node_modules/@shadow-js/primitives/dist/dev/index.js"],
  ["@shadow-js/table/full", "./node_modules/@shadow-js/table/dist/dev/full.js"],
  ["@shadow-js/web/server", "./node_modules/@shadow-js/web/dist/dev/server.js"],
  ["@shadow-js/web/extend", "./node_modules/@shadow-js/web/dist/dev/extend.js"],
  ["@shadow-js/compiler", "./node_modules/@shadow-js/compiler/dist/dev/index.js"],
  ["@shadow-js/testing", "./node_modules/@shadow-js/testing/dist/dev/index.js"],
  ["@shadow-js/web/hmr", "./node_modules/@shadow-js/web/dist/dev/hmr.js"],
  ["@shadow-js/router", "./node_modules/@shadow-js/router/dist/dev/index.js"],
  ["@shadow-js/forms", "./node_modules/@shadow-js/forms/dist/dev/index.js"],
  ["@shadow-js/table", "./node_modules/@shadow-js/table/dist/dev/index.js"],
  ["@shadow-js/core", "./node_modules/@shadow-js/core/dist/dev/index.js"],
  ["@shadow-js/web", "./node_modules/@shadow-js/web/dist/dev/index.js"],
];
const fromServer: [string, string][] = [
  [
    "@shadow-js/primitives/password-toggle-field",
    "./node_modules/@shadow-js/primitives/dist/server-dev/password-toggle-field/index.js",
  ],
  [
    "@shadow-js/primitives/one-time-password",
    "./node_modules/@shadow-js/primitives/dist/server-dev/one-time-password/index.js",
  ],
  [
    "@shadow-js/primitives/navigation-menu",
    "./node_modules/@shadow-js/primitives/dist/server-dev/navigation-menu/index.js",
  ],
  [
    "@shadow-js/primitives/dropdown-menu",
    "./node_modules/@shadow-js/primitives/dist/server-dev/dropdown-menu/index.js",
  ],
  [
    "@shadow-js/primitives/alert-dialog",
    "./node_modules/@shadow-js/primitives/dist/server-dev/alert-dialog/index.js",
  ],
  [
    "@shadow-js/primitives/context-menu",
    "./node_modules/@shadow-js/primitives/dist/server-dev/context-menu/index.js",
  ],
  [
    "@shadow-js/primitives/number-field",
    "./node_modules/@shadow-js/primitives/dist/server-dev/number-field/index.js",
  ],
  [
    "@shadow-js/primitives/toggle-group",
    "./node_modules/@shadow-js/primitives/dist/server-dev/toggle-group/index.js",
  ],
  [
    "@shadow-js/primitives/collapsible",
    "./node_modules/@shadow-js/primitives/dist/server-dev/collapsible/index.js",
  ],
  [
    "@shadow-js/primitives/radio-group",
    "./node_modules/@shadow-js/primitives/dist/server-dev/radio-group/index.js",
  ],
  [
    "@shadow-js/primitives/scroll-area",
    "./node_modules/@shadow-js/primitives/dist/server-dev/scroll-area/index.js",
  ],
  [
    "@shadow-js/router/prefetch-report",
    "./node_modules/@shadow-js/router/dist/dev/features/prefetch-report.js",
  ],
  [
    "@shadow-js/forms/standard-schema",
    "./node_modules/@shadow-js/forms/dist/dev/standard-schema.js",
  ],
  [
    "@shadow-js/primitives/hover-card",
    "./node_modules/@shadow-js/primitives/dist/server-dev/hover-card/index.js",
  ],
  [
    "@shadow-js/primitives/pagination",
    "./node_modules/@shadow-js/primitives/dist/server-dev/pagination/index.js",
  ],
  [
    "@shadow-js/primitives/accordion",
    "./node_modules/@shadow-js/primitives/dist/server-dev/accordion/index.js",
  ],
  [
    "@shadow-js/primitives/separator",
    "./node_modules/@shadow-js/primitives/dist/server-dev/separator/index.js",
  ],
  ["@shadow-js/testing/auto-cleanup", "./node_modules/@shadow-js/testing/dist/dev/auto-cleanup.js"],
  ["@shadow-js/compiler/javascript", "./node_modules/@shadow-js/compiler/dist/dev/javascript.js"],
  ["@shadow-js/forms/submit-errors", "./node_modules/@shadow-js/forms/dist/dev/submit-errors.js"],
  [
    "@shadow-js/primitives/calendar",
    "./node_modules/@shadow-js/primitives/dist/server-dev/calendar/index.js",
  ],
  [
    "@shadow-js/primitives/checkbox",
    "./node_modules/@shadow-js/primitives/dist/server-dev/checkbox/index.js",
  ],
  [
    "@shadow-js/primitives/combobox",
    "./node_modules/@shadow-js/primitives/dist/server-dev/combobox/index.js",
  ],
  [
    "@shadow-js/primitives/progress",
    "./node_modules/@shadow-js/primitives/dist/server-dev/progress/index.js",
  ],
  ["@shadow-js/web/jsx-dev-runtime", "./node_modules/@shadow-js/web/dist/prod/jsx-dev-runtime.js"],
  [
    "@shadow-js/primitives/menubar",
    "./node_modules/@shadow-js/primitives/dist/server-dev/menubar/index.js",
  ],
  [
    "@shadow-js/primitives/popover",
    "./node_modules/@shadow-js/primitives/dist/server-dev/popover/index.js",
  ],
  [
    "@shadow-js/primitives/toolbar",
    "./node_modules/@shadow-js/primitives/dist/server-dev/toolbar/index.js",
  ],
  [
    "@shadow-js/primitives/tooltip",
    "./node_modules/@shadow-js/primitives/dist/server-dev/tooltip/index.js",
  ],
  [
    "@shadow-js/router/transitions",
    "./node_modules/@shadow-js/router/dist/dev/features/transitions.js",
  ],
  [
    "@shadow-js/router/link-status",
    "./node_modules/@shadow-js/router/dist/dev/features/link-status.js",
  ],
  ["@shadow-js/testing/playwright", "./node_modules/@shadow-js/testing/dist/dev/playwright.js"],
  [
    "@shadow-js/primitives/dialog",
    "./node_modules/@shadow-js/primitives/dist/server-dev/dialog/index.js",
  ],
  [
    "@shadow-js/primitives/popper",
    "./node_modules/@shadow-js/primitives/dist/server-dev/popper/index.js",
  ],
  [
    "@shadow-js/primitives/select",
    "./node_modules/@shadow-js/primitives/dist/server-dev/select/index.js",
  ],
  [
    "@shadow-js/primitives/slider",
    "./node_modules/@shadow-js/primitives/dist/server-dev/slider/index.js",
  ],
  [
    "@shadow-js/primitives/switch",
    "./node_modules/@shadow-js/primitives/dist/server-dev/switch/index.js",
  ],
  [
    "@shadow-js/primitives/toggle",
    "./node_modules/@shadow-js/primitives/dist/server-dev/toggle/index.js",
  ],
  [
    "@shadow-js/primitives/label",
    "./node_modules/@shadow-js/primitives/dist/server-dev/label/index.js",
  ],
  [
    "@shadow-js/primitives/toast",
    "./node_modules/@shadow-js/primitives/dist/server-dev/toast/index.js",
  ],
  ["@shadow-js/primitives/utils", "./node_modules/@shadow-js/primitives/dist/server-dev/utils.js"],
  [
    "@shadow-js/router/announcer",
    "./node_modules/@shadow-js/router/dist/dev/features/announcer.js",
  ],
  [
    "@shadow-js/router/not-found",
    "./node_modules/@shadow-js/router/dist/dev/features/not-found.js",
  ],
  ["@shadow-js/table/visibility", "./node_modules/@shadow-js/table/dist/dev/visibility.js"],
  ["@shadow-js/testing/matchers", "./node_modules/@shadow-js/testing/dist/dev/matchers.js"],
  [
    "@shadow-js/primitives/menu",
    "./node_modules/@shadow-js/primitives/dist/server-dev/menu/index.js",
  ],
  [
    "@shadow-js/primitives/tabs",
    "./node_modules/@shadow-js/primitives/dist/server-dev/tabs/index.js",
  ],
  ["@shadow-js/router/blockers", "./node_modules/@shadow-js/router/dist/dev/features/blockers.js"],
  ["@shadow-js/router/prefetch", "./node_modules/@shadow-js/router/dist/dev/features/prefetch.js"],
  ["@shadow-js/router/relative", "./node_modules/@shadow-js/router/dist/dev/features/relative.js"],
  ["@shadow-js/table/expanding", "./node_modules/@shadow-js/table/dist/dev/expanding.js"],
  ["@shadow-js/web/jsx-runtime", "./node_modules/@shadow-js/web/dist/prod/jsx-runtime.js"],
  ["@shadow-js/router/loaders", "./node_modules/@shadow-js/router/dist/dev/features/loaders.js"],
  ["@shadow-js/router/filters", "./node_modules/@shadow-js/router/dist/dev/features/filters.js"],
  ["@shadow-js/router/pending", "./node_modules/@shadow-js/router/dist/dev/features/pending.js"],
  ["@shadow-js/table/grouping", "./node_modules/@shadow-js/table/dist/dev/grouping.js"],
  ["@shadow-js/table/faceting", "./node_modules/@shadow-js/table/dist/dev/faceting.js"],
  ["@shadow-js/table/ordering", "./node_modules/@shadow-js/table/dist/dev/ordering.js"],
  ["@shadow-js/testing/routes", "./node_modules/@shadow-js/testing/dist/dev/routes.js"],
  ["@shadow-js/router/scroll", "./node_modules/@shadow-js/router/dist/dev/features/scroll.js"],
  ["@shadow-js/router/errors", "./node_modules/@shadow-js/router/dist/dev/features/errors.js"],
  ["@shadow-js/router/search", "./node_modules/@shadow-js/router/dist/dev/features/search.js"],
  ["@shadow-js/table/pinning", "./node_modules/@shadow-js/table/dist/dev/pinning.js"],
  ["@shadow-js/forms/server", "./node_modules/@shadow-js/forms/dist/dev/server.js"],
  ["@shadow-js/forms/arrays", "./node_modules/@shadow-js/forms/dist/dev/arrays.js"],
  ["@shadow-js/table/sizing", "./node_modules/@shadow-js/table/dist/dev/sizing.js"],
  ["@shadow-js/table/layout", "./node_modules/@shadow-js/table/dist/dev/layout.js"],
  ["@shadow-js/table/locale", "./node_modules/@shadow-js/table/dist/dev/locale.js"],
  ["@shadow-js/core/extend", "./node_modules/@shadow-js/core/dist/server-dev/extend/index.js"],
  ["@shadow-js/forms/async", "./node_modules/@shadow-js/forms/dist/dev/async.js"],
  ["@shadow-js/forms/dates", "./node_modules/@shadow-js/forms/dist/dev/dates.js"],
  ["@shadow-js/router/core", "./node_modules/@shadow-js/router/dist/dev/core/index.js"],
  ["@shadow-js/router/vite", "./node_modules/@shadow-js/router/dist/vite/index.js"],
  ["@shadow-js/router/head", "./node_modules/@shadow-js/router/dist/dev/features/head.js"],
  ["@shadow-js/testing/dom", "./node_modules/@shadow-js/testing/dist/dev/dom.js"],
  ["@shadow-js/core/store", "./node_modules/@shadow-js/core/dist/server-dev/store/index.js"],
  ["@shadow-js/forms/full", "./node_modules/@shadow-js/forms/dist/dev/full.js"],
  ["@shadow-js/primitives", "./node_modules/@shadow-js/primitives/dist/server-dev/index.js"],
  ["@shadow-js/table/full", "./node_modules/@shadow-js/table/dist/dev/full.js"],
  ["@shadow-js/web/server", "./node_modules/@shadow-js/web/dist/server-dev/server.js"],
  ["@shadow-js/web/extend", "./node_modules/@shadow-js/web/dist/server-dev/extend.js"],
  ["@shadow-js/compiler", "./node_modules/@shadow-js/compiler/dist/dev/index.js"],
  ["@shadow-js/testing", "./node_modules/@shadow-js/testing/dist/dev/index.js"],
  ["@shadow-js/web/hmr", "./node_modules/@shadow-js/web/dist/dev/hmr.js"],
  ["@shadow-js/router", "./node_modules/@shadow-js/router/dist/dev/index.js"],
  ["@shadow-js/forms", "./node_modules/@shadow-js/forms/dist/dev/index.js"],
  ["@shadow-js/table", "./node_modules/@shadow-js/table/dist/dev/index.js"],
  ["@shadow-js/core", "./node_modules/@shadow-js/core/dist/server-dev/index.js"],
  ["@shadow-js/web", "./node_modules/@shadow-js/web/dist/server-dev/index.js"],
];

const define = { __DEV__: "true", __SERVER__: "false", __TEST__: "true", __VERSION__: '"0.0.0"' };
const serverDefine = { ...define, __SERVER__: "true" };
// Matched against the file path, not the specifier: every ShadowJS package in node_modules goes through Vite, so they all share one copy of core.
const inline = {
  deps: { inline: [/[/]node_modules[/]@shadow-js[/]/, /[/]node_modules[/]create-shadow-app[/]/] },
};
const client = { alias: exact([...own, ...fromClient]) };
const serverSide = { alias: exact([...own, ...fromServer]) };

export default defineConfig({
  test: {
    // A snapshot that is missing fails the test; it is never written silently.
    snapshotOptions: { updateSnapshot: "none" },
    projects: [
      {
        define,
        resolve: client,
        test: {
          name: "unit",
          environment: "node",
          server: inline,
          testTimeout: 30_000,
          hookTimeout: 30_000,
          include: ["test/**/*.test.ts"],
          exclude: [
            "**/*.dom.test.ts",
            "**/*.server.test.ts",
            "**/*.gc.test.ts",
            "**/*.perf.test.ts",
            "**/*.dist.test.ts",
            "**/node_modules/**",
          ],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        define,
        resolve: client,
        test: {
          name: "dom",
          environment: "happy-dom",
          server: inline,
          testTimeout: 30_000,
          include: ["test/**/*.dom.test.ts"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        define: serverDefine,
        resolve: serverSide,
        test: {
          name: "server",
          environment: "node",
          server: inline,
          include: ["test/**/*.server.test.ts"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        define,
        resolve: client,
        test: {
          name: "perf",
          environment: "happy-dom",
          server: inline,
          // Wall-clock budgets run alone, in their own invocation, so parallel correctness tests do not consume their frame.
          include: ["test/**/*.perf.test.ts"],
          fileParallelism: false,
          maxWorkers: 1,
          testTimeout: 30_000,
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        define,
        resolve: client,
        test: {
          name: "gc",
          environment: "node",
          server: inline,
          include: ["test/**/*.gc.test.ts"],
          execArgv: ["--expose-gc"],
          pool: "forks",
        },
      },
    ],
  },
});
