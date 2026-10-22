/**
 * Finds the Tailwind class names in registry sources: the class arguments of `cn(...)` / `cva(...)`
 * calls and the value of `class` / `className` attributes, plus any other string that reads like a
 * class list (a `const itemClasses = "..."` shared by several parts), so a class list cannot hide
 * where the Tailwind check would miss it.
 *
 * Variant names, default variants and the arguments of other calls (`buttonVariants({ size: "sm" })`)
 * are not class names and are skipped.
 */
import { readFileSync } from "node:fs";
import { parseSync } from "oxc-parser";

type Node = { readonly type: string; readonly [key: string]: unknown };

const isNode = (value: unknown): value is Node =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { type?: unknown }).type === "string";

const asNode = (value: unknown): Node | undefined => (isNode(value) ? value : undefined);
const asNodes = (value: unknown): Node[] => (Array.isArray(value) ? value.filter(isNode) : []);

/** Calls that join class lists: their arguments are class values. */
const JOINERS = new Set(["cn", "clsx", "twMerge"]);

/** A string that reads like a Tailwind class list (used to find class lists outside class positions). */
const CLASS_LIKE =
  /(^|\s)(?:[a-z-]+:)*-?(?:flex|grid|block|hidden|inline|p[xytblrse]?|m[xytblrse]?|size|h|w|gap|bg|text|border|rounded|shadow|ring|opacity|font)(?:-[\w/[\].%()&*:=-]+)?(\s|$)/;

function nameOf(node: Node | undefined): string | undefined {
  if (node === undefined) return undefined;
  if (node.type === "Identifier") return node["name"] as string;
  if (node.type === "Literal" && typeof node["value"] === "string") return node["value"];
  return undefined;
}

function calleeName(node: Node): string | undefined {
  const callee = asNode(node["callee"]);
  return callee?.type === "Identifier" ? (callee["name"] as string) : undefined;
}

/** Collects the class strings of a class-valued expression into `out`. */
function collectValue(root: Node | undefined, out: Set<string>, covered: Set<Node>): void {
  const stack: Array<Node | undefined> = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) continue;
    covered.add(node);
    switch (node.type) {
      case "Literal":
        if (typeof node["value"] === "string") add(out, node["value"]);
        break;
      case "TemplateLiteral":
        for (const quasi of asNodes(node["quasis"])) {
          const cooked = (quasi["value"] as { cooked?: string | null } | undefined)?.cooked;
          if (typeof cooked === "string") add(out, cooked);
        }
        stack.push(...asNodes(node["expressions"]));
        break;
      case "ConditionalExpression":
        stack.push(asNode(node["consequent"]), asNode(node["alternate"]));
        break;
      case "LogicalExpression":
        stack.push(asNode(node["left"]), asNode(node["right"]));
        break;
      case "ArrayExpression":
        stack.push(...asNodes(node["elements"]));
        break;
      case "ObjectExpression":
        // clsx dictionary: the keys are the class names.
        for (const property of asNodes(node["properties"])) {
          const key = nameOf(asNode(property["key"]));
          if (key !== undefined) add(out, key);
        }
        break;
      case "JSXExpressionContainer":
        stack.push(asNode(node["expression"]));
        break;
      case "ParenthesizedExpression":
      case "TSAsExpression":
      case "TSSatisfiesExpression":
        stack.push(asNode(node["expression"]));
        break;
      case "CallExpression": {
        const name = calleeName(node);
        if (name !== undefined && JOINERS.has(name)) stack.push(...asNodes(node["arguments"]));
        break;
      }
      default:
        break;
    }
  }
}

function add(out: Set<string>, text: string): void {
  for (const token of text.split(/\s+/)) if (token !== "") out.add(token);
}

/** A `cva(base, { variants, compoundVariants })` call. */
function collectCva(call: Node, out: Set<string>, covered: Set<Node>): void {
  const [base, config] = asNodes(call["arguments"]);
  collectValue(base, out, covered);
  if (config?.type !== "ObjectExpression") return;
  covered.add(config);
  for (const property of asNodes(config["properties"])) {
    const key = nameOf(asNode(property["key"]));
    const value = asNode(property["value"]);
    if (key === "base") collectValue(value, out, covered);
    if (key === "variants" && value?.type === "ObjectExpression") {
      for (const group of asNodes(value["properties"])) {
        const options = asNode(group["value"]);
        if (options?.type !== "ObjectExpression") continue;
        for (const option of asNodes(options["properties"]))
          collectValue(asNode(option["value"]), out, covered);
      }
    }
    if (key === "compoundVariants" && value?.type === "ArrayExpression") {
      for (const entry of asNodes(value["elements"])) {
        for (const field of asNodes(entry["properties"])) {
          const fieldName = nameOf(asNode(field["key"]));
          if (fieldName === "class" || fieldName === "className")
            collectValue(asNode(field["value"]), out, covered);
        }
      }
    }
  }
}

function children(node: Node): Node[] {
  const out: Node[] = [];
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) out.push(...value.filter(isNode));
    else if (isNode(value)) out.push(value);
  }
  return out;
}

export interface ClassSource {
  /** Every distinct class token found. */
  readonly classes: ReadonlySet<string>;
}

/**
 * The class tokens of a TS/TSX source file.
 *
 * @param file Absolute path of the file.
 * @returns The distinct tokens.
 */
export function classesOf(file: string): ClassSource {
  const source = readFileSync(file, "utf8");
  const parsed = parseSync(file, source, { lang: file.endsWith(".tsx") ? "tsx" : "ts" });
  const classes = new Set<string>();
  const covered = new Set<Node>();
  const stack: Node[] = [parsed.program as unknown as Node];
  const visited: Node[] = [];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    visited.push(node);
    if (node.type === "CallExpression") {
      const name = calleeName(node);
      if (name === "cva") {
        covered.add(node);
        collectCva(node, classes, covered);
      } else if (name !== undefined && JOINERS.has(name)) {
        covered.add(node);
        for (const argument of asNodes(node["arguments"])) collectValue(argument, classes, covered);
      }
    }
    if (node.type === "JSXAttribute") {
      const name = asNode(node["name"]);
      if (
        name?.type === "JSXIdentifier" &&
        (name["name"] === "class" || name["name"] === "className")
      ) {
        collectValue(asNode(node["value"]), classes, covered);
      }
    }
    stack.push(...children(node));
  }
  // Class-like strings outside the class positions above are class lists too (shared constants).
  for (const node of visited) {
    if (covered.has(node) || node.type !== "Literal" || typeof node["value"] !== "string") continue;
    const text = node["value"];
    if (/\s/.test(text) && CLASS_LIKE.test(text)) add(classes, text);
  }
  return { classes };
}
