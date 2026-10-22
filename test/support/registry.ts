/** A small synthetic registry for CLI tests, so they do not depend on the shipped items. */
import { createRegistrySource, type RegistrySource } from "../../src/cli/registry-source";
import type { RegistryIndex, RegistryItem } from "../../src/cli/schema";

export function item(
  name: string,
  options: {
    readonly deps?: readonly string[];
    readonly packages?: Readonly<Record<string, string>>;
    readonly type?: "ui" | "lib" | "hook";
    readonly files?: readonly string[];
    readonly primitives?: readonly string[];
    readonly animations?: boolean;
  } = {},
): RegistryItem {
  const type = options.type ?? "ui";
  return {
    name,
    type,
    title: name,
    description: `The ${name} item.`,
    files: (options.files ?? [`${name}.tsx`]).map((file) => ({
      path: `registry/${name}/${file}`,
      type,
    })),
    registryDependencies: options.deps ?? [],
    dependencies: options.packages ?? {},
    exports: [name],
    primitives: options.primitives ?? [],
    tailwind: { tokens: [], animations: options.animations === true },
  };
}

export function indexOf(...items: RegistryItem[]): RegistryIndex {
  return {
    name: "@shadow-js/ui",
    version: "9.9.9",
    frameworkDependencies: ["@shadow-js/core", "@shadow-js/primitives", "@shadow-js/web"],
    items,
  };
}

/** A source whose files are the given map (path -> text); stylesheets are tiny stand-ins. */
export function sourceOf(
  index: RegistryIndex,
  files: Readonly<Record<string, string>>,
): RegistrySource {
  const styles: Record<string, string> = {
    "styles/theme-core.css": "/* core */\n@theme inline {}\n",
    "styles/animations.css": "/* animations */\n@utility animate-in {}\n",
    "styles/themes/neutral.css": ":root { --radius: 1rem; }\n",
    "styles/themes/zinc.css": ":root { --radius: 2rem; }\n",
    "styles/themes/slate.css": ":root {}\n",
    "styles/themes/stone.css": ":root {}\n",
    "styles/themes/gray.css": ":root {}\n",
  };
  return createRegistrySource(index, (path) => files[path] ?? styles[path]);
}
