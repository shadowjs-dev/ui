/**
 * Line diffs for `add` and `diff`: Myers' O(ND) algorithm and a unified-diff renderer. Pure.
 * @packageDocumentation
 */

type Operation = { readonly kind: "equal" | "insert" | "delete"; readonly line: string };

/**
 * Beyond this many lines in both texts together the edit script is not computed (memory bound).
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const MAX_DIFF_LINES = 20_000;

/**
 * The most array cells the edit script may keep to walk back from the end (4 bytes each, so 64 MB). Myers' algorithm keeps one
 * frontier per edit, each 2d+1 wide, so it grows with the square of the number of differing lines; two files that share
 * nothing would need gigabytes. Past the budget the diff is one replacement of the whole file instead.
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const MAX_TRACE_CELLS = 16_000_000;

/** The whole of `a` deleted and the whole of `b` inserted: always correct, never minimal. */
function replacement(a: readonly string[], b: readonly string[]): Operation[] {
  return [
    ...a.map((line): Operation => ({ kind: "delete", line })),
    ...b.map((line): Operation => ({ kind: "insert", line })),
  ];
}

/** The edit script turning `a` into `b`; one big replacement when the texts are too large or too different. */
function edits(a: readonly string[], b: readonly string[]): Operation[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  if (max > MAX_DIFF_LINES) return replacement(a, b);
  const offset = max;
  const frontier = new Int32Array(2 * max + 2);
  /** The frontier before each round, only the diagonals the next round can read: `[offset - d - 1, offset + d + 1]`. */
  const trace: { readonly from: number; readonly cells: Int32Array }[] = [];
  let kept = 0;
  let reached = -1;
  for (let d = 0; d <= max && reached === -1; d += 1) {
    const from = Math.max(0, offset - d - 1);
    const cells = frontier.slice(from, Math.min(frontier.length, offset + d + 2));
    kept += cells.length;
    if (kept > MAX_TRACE_CELLS) return replacement(a, b);
    trace.push({ from, cells });
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      const below = frontier[offset + k - 1] ?? 0;
      const above = frontier[offset + k + 1] ?? 0;
      if (k === -d || (k !== d && below < above)) x = above;
      else x = below + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x += 1;
        y += 1;
      }
      // Updated in place: a round reads only the other parity of diagonals, which it does not write.
      frontier[offset + k] = x;
      if (x >= n && y >= m) {
        reached = d;
        break;
      }
    }
  }
  const result: Operation[] = [];
  let x = n;
  let y = m;
  for (let d = reached; d > 0; d -= 1) {
    const previous = trace[d];
    const at = (index: number): number =>
      previous === undefined ? 0 : (previous.cells[index - previous.from] ?? 0);
    const k = x - y;
    const below = at(offset + k - 1);
    const above = at(offset + k + 1);
    const previousK = k === -d || (k !== d && below < above) ? k + 1 : k - 1;
    const previousX = at(offset + previousK);
    const previousY = previousX - previousK;
    while (x > previousX && y > previousY) {
      x -= 1;
      y -= 1;
      result.push({ kind: "equal", line: a[x] ?? "" });
    }
    if (x === previousX) {
      y -= 1;
      result.push({ kind: "insert", line: b[y] ?? "" });
    } else {
      x -= 1;
      result.push({ kind: "delete", line: a[x] ?? "" });
    }
  }
  while (x > 0 && y > 0) {
    x -= 1;
    y -= 1;
    result.push({ kind: "equal", line: a[x] ?? "" });
  }
  return result.reverse();
}

/** Text to lines, ignoring the line-ending style and a final newline. */
function toLines(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

/**
 * Whether two texts are the same apart from line endings (CRLF vs LF) and a trailing newline.
 *
 * @param a One text.
 * @param b Another text.
 * @returns `true` when they have the same lines.
 * @example
 * sameContent("a\r\nb\r\n", "a\nb"); // true
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function sameContent(a: string, b: string): boolean {
  const left = toLines(a);
  const right = toLines(b);
  return left.length === right.length && left.every((line, index) => line === right[index]);
}

/**
 * A unified diff (3 lines of context) from `before` to `after`.
 *
 * @param before The old text (what is on disk).
 * @param after The new text (what the registry has).
 * @param labels Names for the `---` and `+++` header lines.
 * @returns The diff, or `""` when the texts have the same lines.
 * @example
 * unifiedDiff("a\n", "b\n", { before: "local", after: "registry" });
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function unifiedDiff(
  before: string,
  after: string,
  labels: { readonly before: string; readonly after: string },
  context = 3,
): string {
  const script = edits(toLines(before), toLines(after));
  if (script.every((operation) => operation.kind === "equal")) return "";
  const hunks: string[] = [];
  let index = 0;
  let oldLine = 1;
  let newLine = 1;
  const lineNumbers: Array<{ old: number; new: number }> = [];
  for (const operation of script) {
    lineNumbers.push({ old: oldLine, new: newLine });
    if (operation.kind !== "insert") oldLine += 1;
    if (operation.kind !== "delete") newLine += 1;
  }
  while (index < script.length) {
    while (index < script.length && script[index]?.kind === "equal") index += 1;
    if (index >= script.length) break;
    const start = Math.max(0, index - context);
    let end = index;
    let lastChange = index;
    while (end < script.length) {
      if (script[end]?.kind !== "equal") lastChange = end;
      else if (end - lastChange > context * 2) break;
      end += 1;
    }
    const stop = Math.min(script.length, lastChange + context + 1);
    const slice = script.slice(start, stop);
    const oldCount = slice.filter((operation) => operation.kind !== "insert").length;
    const newCount = slice.filter((operation) => operation.kind !== "delete").length;
    const first = lineNumbers[start] ?? { old: 1, new: 1 };
    hunks.push(
      `@@ -${oldCount === 0 ? first.old - 1 : first.old},${oldCount} +${newCount === 0 ? first.new - 1 : first.new},${newCount} @@`,
      ...slice.map(
        (operation) =>
          `${operation.kind === "equal" ? " " : operation.kind === "insert" ? "+" : "-"}${operation.line}`,
      ),
    );
    index = stop;
  }
  return [`--- ${labels.before}`, `+++ ${labels.after}`, ...hunks].join("\n");
}
