import { readFileSync } from "node:fs";
import { defineConfig } from "tsdown";
import { createConfig } from "./build/tsdown-preset.mjs";

// The library (cn, cva, ThemeProvider, themeScript): the shared dev/prod browser builds.
// The locale packs are data: each is its own entry, so an app imports only the language it uses.
const library = createConfig({
  packageDir: import.meta.dirname,
  entries: {
    index: "src/index.ts",
    "locales/en": "src/locales/en.ts",
    "locales/ar": "src/locales/ar.ts",
  },
});

const pkg = JSON.parse(readFileSync(`${import.meta.dirname}/package.json`, "utf8"));

// The CLI: one Node ESM file with a shebang. It has no framework dependency. `--version` prints the
// version of this package, injected here (the registry file carries its own, older number).
const cli = {
  entry: { cli: "src/cli/bin.ts" },
  format: "esm",
  platform: "node",
  target: "node22",
  outDir: "dist",
  clean: false,
  dts: false,
  sourcemap: false,
  banner: "#!/usr/bin/env node",
  define: { __VERSION__: JSON.stringify(pkg.version) },
};

export default defineConfig([...library, cli]);
