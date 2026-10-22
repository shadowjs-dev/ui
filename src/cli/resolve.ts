/**
 * Registry resolution: from the names a user typed to the ordered list of items to copy and the
 * npm packages they need. Pure: no filesystem, no network.
 * @packageDocumentation
 */
import { isValidItemName, type RegistryIndex, type RegistryItem } from "./schema";

/**
 * What `add` has to do for a set of requested items.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface ResolvedPlan {
  /** The names as requested, de-duplicated, in the order given. */
  readonly requested: readonly string[];
  /** Every item to copy, dependencies before the items that import them. */
  readonly items: readonly RegistryItem[];
  /** Third-party packages (name -> exact version) the items import. */
  readonly dependencies: Readonly<Record<string, string>>;
  /** Whether any item imports `@shadow-js/primitives`. */
  readonly usesPrimitives: boolean;
  /** Whether any item needs the classes from `animations.css`. */
  readonly usesAnimations: boolean;
}

/**
 * Thrown for an unknown or invalid item name, a `registryDependencies` entry that is not in the
 * registry, a dependency cycle, or conflicting versions of one npm package.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export class ResolveError extends Error {
  /** The stable code `--json` prints: `SHADOW_UI_UNKNOWN_COMPONENT`, `SHADOW_UI_INVALID_NAME` or `SHADOW_UI_REGISTRY_CONFLICT`. */
  readonly code: string;

  constructor(message: string, code = "SHADOW_UI_UNKNOWN_COMPONENT") {
    super(message);
    this.name = "ResolveError";
    this.code = code;
  }
}

/** Levenshtein distance, for "did you mean" hints. Names are short, so the plain table is fine. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j] ?? 0;
      row[j] = Math.min(
        above + 1,
        (row[j - 1] ?? 0) + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return row[b.length] ?? 0;
}

function suggestion(index: RegistryIndex, name: string): string {
  let best: string | undefined;
  let bestDistance = 3;
  for (const item of index.items) {
    const d = distance(name, item.name);
    if (d < bestDistance) {
      best = item.name;
      bestDistance = d;
    }
  }
  return best === undefined ? "" : ` Did you mean "${best}"?`;
}

/**
 * Finds an item by name.
 *
 * @param index The registry.
 * @param name The item name.
 * @returns The item, or `undefined` when there is none.
 * @example
 * findItem(index, "button")?.files;
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function findItem(index: RegistryIndex, name: string): RegistryItem | undefined {
  return index.items.find((item) => item.name === name);
}

/**
 * Resolves requested names to a copy plan: transitive `registryDependencies`, dependencies first,
 * each item once. The order is deterministic: depth-first, in the order of the request and of each
 * item's `registryDependencies`. Traversal is iterative, so a deep dependency chain cannot overflow
 * the stack.
 *
 * @param index The registry.
 * @param names Requested item names.
 * @returns The plan.
 * @throws ResolveError for an invalid or unknown name, a dependency missing from the registry, a
 *   cycle, or two versions of one npm package.
 * @example
 * resolveItems(index, ["dialog"]).items.map((item) => item.name); // ["utils", "icons", "dialog"]
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function resolveItems(index: RegistryIndex, names: readonly string[]): ResolvedPlan {
  const requested = [...new Set(names)];
  const ordered: RegistryItem[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();

  for (const root of requested) {
    if (!isValidItemName(root)) {
      throw new ResolveError(`"${root}" is not a valid component name.`, "SHADOW_UI_INVALID_NAME");
    }
    if (done.has(root)) continue;
    interface Frame {
      readonly item: RegistryItem;
      next: number;
    }
    const first = findItem(index, root);
    if (first === undefined) {
      throw new ResolveError(`Unknown component "${root}".${suggestion(index, root)}`);
    }
    const stack: Frame[] = [{ item: first, next: 0 }];
    visiting.add(root);
    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      if (frame === undefined) break;
      const dependency = frame.item.registryDependencies[frame.next];
      if (dependency === undefined) {
        stack.pop();
        visiting.delete(frame.item.name);
        if (!done.has(frame.item.name)) {
          done.add(frame.item.name);
          ordered.push(frame.item);
        }
        continue;
      }
      frame.next += 1;
      if (done.has(dependency)) continue;
      if (visiting.has(dependency)) {
        const chain = [...stack.map((entry) => entry.item.name), dependency].join(" -> ");
        throw new ResolveError(
          `Circular registry dependency: ${chain}`,
          "SHADOW_UI_REGISTRY_CONFLICT",
        );
      }
      const item = findItem(index, dependency);
      if (item === undefined) {
        throw new ResolveError(
          `"${frame.item.name}" depends on "${dependency}", which is not in the registry.`,
          "SHADOW_UI_REGISTRY_CONFLICT",
        );
      }
      visiting.add(dependency);
      stack.push({ item, next: 0 });
    }
  }

  const dependencies: Record<string, string> = {};
  for (const item of ordered) {
    for (const [name, version] of Object.entries(item.dependencies)) {
      const known = dependencies[name];
      if (known !== undefined && known !== version) {
        throw new ResolveError(
          `"${name}" is required at both ${known} and ${version}.`,
          "SHADOW_UI_REGISTRY_CONFLICT",
        );
      }
      dependencies[name] = version;
    }
  }
  return {
    requested,
    items: ordered,
    dependencies: Object.fromEntries(
      Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b)),
    ),
    usesPrimitives: ordered.some((item) => item.primitives.length > 0),
    usesAnimations: ordered.some((item) => item.tailwind.animations),
  };
}

/**
 * The items that import `name`, directly or not, among `candidates` (used by `remove` to refuse
 * deleting something another installed item needs).
 *
 * @param index The registry.
 * @param name The item to be removed.
 * @param candidates Names of installed items to check.
 * @returns The candidates that depend on `name`, sorted.
 * @example
 * dependentsOf(index, "utils", ["button", "dialog"]); // ["button", "dialog"]
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function dependentsOf(
  index: RegistryIndex,
  name: string,
  candidates: readonly string[],
): string[] {
  const found: string[] = [];
  for (const candidate of candidates) {
    if (candidate === name || !isValidItemName(candidate)) continue;
    const item = findItem(index, candidate);
    if (item === undefined) continue;
    if (resolveItems(index, [candidate]).items.some((entry) => entry.name === name)) {
      found.push(candidate);
    }
  }
  return found.sort();
}
