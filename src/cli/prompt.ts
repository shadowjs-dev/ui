/**
 * The yes/no question of the executable, kept apart from `bin.ts` (which runs on import) so a test
 * can drive it with in-memory streams.
 * @packageDocumentation
 */
import { createInterface } from "node:readline/promises";

/**
 * Asks a yes/no question and resolves `true` only for `y` or `yes` (any case). An empty answer is
 * no, and so is the end of input (Ctrl-D, a closed pipe): readline never settles `question()` when
 * its input ends, which left Node to exit with code 13 ("unsettled top-level await").
 *
 * @param question The question, without the `(y/N)` suffix.
 * @param input The stream the answer is read from.
 * @param output The stream the question is written to.
 * @returns Whether the user said yes.
 * @example
 * const yes = await askYesNo("Install packages?", process.stdin, process.stdout);
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export async function askYesNo(
  question: string,
  input: NodeJS.ReadableStream,
  output: NodeJS.WritableStream,
): Promise<boolean> {
  const prompt = createInterface({ input, output });
  try {
    const answer = await new Promise<string>((settle, fail) => {
      prompt.once("close", () => settle(""));
      prompt.question(`${question} (y/N) `).then(settle, fail);
    });
    return /^y(es)?$/i.test(answer.trim());
  } finally {
    prompt.close();
  }
}
