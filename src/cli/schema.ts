/**
 * The shapes the CLI reads: the registry index (`registry.json`) and the project's
 * `components.json`, with validators that turn untrusted JSON into typed values or a clear error.
 * @packageDocumentation
 */

/**
 * Where an item's files are written: `ui` components, `lib` helpers, `hook` hooks.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export type RegistryItemType = "ui" | "lib" | "hook";

/**
 * One file of a registry item: where it lives in the package and where it is copied to.
 * @since 1.0.0
 */
export interface RegistryFile {
  /** Path inside the package, `registry/<name>/<file>`. */
  readonly path: string;
  /** Where the file is copied: `ui` (components), `lib` (helpers) or `hook` (hooks). */
  readonly type: RegistryItemType;
}

/**
 * One installable registry item, as listed in `registry.json`.
 * @since 1.0.0
 */
export interface RegistryItem {
  /** Kebab-case id: `button`, `dropdown-menu`. */
  readonly name: string;
  /**
   * Where the files go: `ui` to the components alias, `lib` to the lib alias (`utils` to the utils
   * alias), `hook` to the hooks alias.
   */
  readonly type: RegistryItemType;
  /** The display name of the item, such as `Dropdown Menu`. */
  readonly title: string;
  /** One sentence on what the item is; `shadow-ui list` prints it. */
  readonly description: string;
  /** The files to copy, each under the item's own `registry/<name>/` folder. */
  readonly files: readonly RegistryFile[];
  /** Other registry items this one imports, by name. `add` copies them first. */
  readonly registryDependencies: readonly string[];
  /** Third-party npm packages (name -> exact version) the files import. */
  readonly dependencies: Readonly<Record<string, string>>;
  /** Names the item's files export. Documentation metadata: the CLI does not read it. */
  readonly exports: readonly string[];
  /** Names the files import from `@shadow-js/primitives`. */
  readonly primitives: readonly string[];
  /** Tailwind facts about the files. */
  readonly tailwind: {
    /** Theme color tokens the files use, such as `background` or `primary`. */
    readonly tokens: readonly string[];
    /** Whether the files need the animation utilities from `animations.css`. */
    readonly animations: boolean;
  };
}

/**
 * The parsed `registry.json`: the registry's name and version, the framework packages and every item.
 * @since 1.0.0
 */
export interface RegistryIndex {
  /** The package the registry belongs to, `@shadow-js/ui`. */
  readonly name: string;
  /** The registry version. `shadow-ui --version` prints the package version and uses this as the fallback. */
  readonly version: string;
  /** The `@shadow-js/*` packages `add` installs when an item uses `@shadow-js/primitives`. */
  readonly frameworkDependencies: readonly string[];
  /** Every installable item, in registry order. */
  readonly items: readonly RegistryItem[];
}

/**
 * The base colors `init` can generate.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export type BaseColor = "neutral" | "zinc" | "slate" | "stone" | "gray";

/**
 * The base colors, in documentation order.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const BASE_COLORS: readonly BaseColor[] = ["neutral", "zinc", "slate", "stone", "gray"];

/**
 * Import aliases a project uses for copied components.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface ComponentsAliases {
  readonly components: string;
  readonly ui: string;
  readonly lib: string;
  readonly utils: string;
  readonly hooks: string;
}

/**
 * The project's `components.json`.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface ComponentsConfig {
  readonly framework: "vite" | "dusk" | "unknown";
  readonly tailwind: {
    /** The stylesheet that imports Tailwind, relative to the project root. */
    readonly css: string;
    readonly baseColor: BaseColor;
  };
  readonly aliases: ComponentsAliases;
}

/**
 * The default aliases (shadcn's).
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const DEFAULT_ALIASES: ComponentsAliases = {
  components: "@/components",
  ui: "@/components/ui",
  lib: "@/lib",
  utils: "@/lib/utils",
  hooks: "@/hooks",
};

/** Registry item names are kebab-case; nothing else may reach a file path. */
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A file name inside `registry/<name>/`. */
const FILE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Whether `name` is a valid registry item name.
 *
 * @param name Any string.
 * @returns `true` for kebab-case names such as `dropdown-menu`.
 * @example
 * isValidItemName("../etc/passwd"); // false
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function isValidItemName(name: string): boolean {
  return NAME_PATTERN.test(name);
}

/**
 * Thrown for malformed registry or configuration data.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export class SchemaError extends Error {
  /** The stable code `--json` prints. */
  readonly code = "SHADOW_UI_INVALID_FILE";

  constructor(message: string) {
    super(message);
    this.name = "SchemaError";
  }
}

function record(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SchemaError(`${where} must be an object`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, where: string): string {
  if (typeof value !== "string" || value === "") throw new SchemaError(`${where} must be a string`);
  return value;
}

function strings(value: unknown, where: string): string[] {
  if (!Array.isArray(value)) throw new SchemaError(`${where} must be an array`);
  return value.map((entry, index) => text(entry, `${where}[${index}]`));
}

function itemType(value: unknown, where: string): RegistryItemType {
  if (value === "ui" || value === "lib" || value === "hook") return value;
  throw new SchemaError(`${where} must be "ui", "lib" or "hook"`);
}

function parseItem(value: unknown, index: number): RegistryItem {
  const where = `items[${index}]`;
  const item = record(value, where);
  const name = text(item["name"], `${where}.name`);
  if (!isValidItemName(name)) throw new SchemaError(`${where}.name "${name}" is not a valid name`);
  const files = item["files"];
  if (!Array.isArray(files) || files.length === 0) {
    throw new SchemaError(`${where}.files must be a non-empty array`);
  }
  const dependencies = record(item["dependencies"], `${where}.dependencies`);
  const tailwind = record(item["tailwind"], `${where}.tailwind`);
  return {
    name,
    type: itemType(item["type"], `${where}.type`),
    title: text(item["title"], `${where}.title`),
    description: text(item["description"], `${where}.description`),
    files: files.map((file, fileIndex) => {
      const entry = record(file, `${where}.files[${fileIndex}]`);
      const path = text(entry["path"], `${where}.files[${fileIndex}].path`);
      const segments = path.split("/");
      const [root, folder, base] = segments;
      if (
        segments.length !== 3 ||
        root !== "registry" ||
        folder !== name ||
        base === undefined ||
        !FILE_PATTERN.test(base)
      ) {
        throw new SchemaError(
          `${where}.files[${fileIndex}].path "${path}" must be registry/${name}/<file>`,
        );
      }
      return { path, type: itemType(entry["type"], `${where}.files[${fileIndex}].type`) };
    }),
    registryDependencies: strings(item["registryDependencies"], `${where}.registryDependencies`),
    dependencies: Object.fromEntries(
      Object.entries(dependencies).map(([pkg, version]) => [
        pkg,
        text(version, `${where}.dependencies.${pkg}`),
      ]),
    ),
    exports: strings(item["exports"], `${where}.exports`),
    primitives: strings(item["primitives"], `${where}.primitives`),
    tailwind: {
      tokens: strings(tailwind["tokens"], `${where}.tailwind.tokens`),
      animations: tailwind["animations"] === true,
    },
  };
}

/**
 * Validates parsed `registry.json` data.
 *
 * @param value The parsed JSON.
 * @returns The typed index.
 * @throws SchemaError naming the first malformed field.
 * @example
 * const index = parseRegistryIndex(JSON.parse(readFileSync("registry.json", "utf8")));
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function parseRegistryIndex(value: unknown): RegistryIndex {
  const root = record(value, "registry");
  const items = root["items"];
  if (!Array.isArray(items)) throw new SchemaError("registry.items must be an array");
  const parsed = items.map(parseItem);
  const seen = new Set<string>();
  for (const item of parsed) {
    if (seen.has(item.name)) throw new SchemaError(`registry has two items named "${item.name}"`);
    seen.add(item.name);
  }
  return {
    name: text(root["name"], "registry.name"),
    version: text(root["version"], "registry.version"),
    frameworkDependencies: strings(root["frameworkDependencies"], "registry.frameworkDependencies"),
    items: parsed,
  };
}

/**
 * Validates parsed `components.json` data.
 *
 * @param value The parsed JSON.
 * @returns The typed configuration, with defaults for missing aliases.
 * @throws SchemaError naming the first malformed field.
 * @example
 * const config = parseComponentsConfig(JSON.parse(readFileSync("components.json", "utf8")));
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function parseComponentsConfig(value: unknown): ComponentsConfig {
  const root = record(value, "components.json");
  const tailwind = record(root["tailwind"], "components.json tailwind");
  const baseColor = tailwind["baseColor"] ?? "neutral";
  if (!BASE_COLORS.includes(baseColor as BaseColor)) {
    throw new SchemaError(
      `components.json tailwind.baseColor must be one of ${BASE_COLORS.join(", ")}`,
    );
  }
  const given =
    root["aliases"] === undefined ? {} : record(root["aliases"], "components.json aliases");
  const alias = (key: keyof ComponentsAliases): string => {
    const entry = given[key];
    if (entry === undefined) return DEFAULT_ALIASES[key];
    const aliasText = text(entry, `components.json aliases.${key}`);
    if (aliasText.includes("..") || /\s/.test(aliasText)) {
      throw new SchemaError(`components.json aliases.${key} "${aliasText}" is not a valid alias`);
    }
    return aliasText;
  };
  const framework = root["framework"];
  return {
    framework: framework === "vite" || framework === "dusk" ? framework : "unknown",
    tailwind: {
      css: text(tailwind["css"], "components.json tailwind.css"),
      baseColor: baseColor as BaseColor,
    },
    aliases: {
      components: alias("components"),
      ui: alias("ui"),
      lib: alias("lib"),
      utils: alias("utils"),
      hooks: alias("hooks"),
    },
  };
}
