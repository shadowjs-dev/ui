/**
 * Shell completion scripts for the `shadow-ui` command. Each script is static text built from the
 * commands and flags it is given. It never calls back into the CLI, so it cannot complete
 * component names.
 * @packageDocumentation
 */

/**
 * The shells `shadow-ui completion` writes a script for.
 * @example
 * const shells: readonly string[] = SHELLS; // ["bash", "zsh", "fish"]
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const SHELLS = ["bash", "zsh", "fish"] as const;

/**
 * One of {@link SHELLS}.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export type Shell = (typeof SHELLS)[number];

/**
 * The shells as a phrase for messages: `bash, zsh or fish`.
 * @example
 * const phrase: string = SHELL_CHOICES; // "bash, zsh or fish"
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export const SHELL_CHOICES: string = `${SHELLS.slice(0, -1).join(", ")} or ${SHELLS[SHELLS.length - 1]}`;

/**
 * What a completion script offers.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export interface CompletionSpec {
  /** Subcommand names, aliases included. */
  readonly commands: readonly string[];
  /** Long flag names without the leading `--`, such as `dry-run`. */
  readonly flags: readonly string[];
}

/**
 * Tells whether a word names one of the shells {@link SHELLS} lists.
 * @param value The word from the command line, if any.
 * @returns `true` when `value` is `bash`, `zsh` or `fish`.
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function isShell(value: string | undefined): value is Shell {
  return value !== undefined && (SHELLS as readonly string[]).includes(value);
}

/**
 * Builds the completion script for one shell. The script has no trailing newline.
 * @param shell The shell the script is for.
 * @param spec The commands and long flags the script offers.
 * @returns The script text, ready to save or to `source`.
 * @example
 * const script = completionScript("bash", { commands: ["init", "add"], flags: ["yes"] });
 * // script begins with "# bash completion for shadow-ui" and its last line is
 * // "complete -o default -F _shadow_ui shadow-ui"
 * @since 1.0.0
 *
 * @internal Not exported from `@shadow-js/ui`: part of the shadow-ui command, whose public surface is the CLI.
 */
export function completionScript(shell: Shell, spec: CompletionSpec): string {
  const commands = spec.commands.join(" ");
  switch (shell) {
    case "bash":
      return bashScript(
        commands,
        spec.flags.map((flag) => `--${flag}`),
      );
    case "zsh":
      return zshScript(
        commands,
        spec.flags.map((flag) => `--${flag}`),
      );
    case "fish":
      return fishScript(commands, spec.flags);
  }
}

function bashScript(commands: string, flags: readonly string[]): string {
  return [
    "# bash completion for shadow-ui. Save it in your bash-completion directory as shadow-ui,",
    "# or run: source <(shadow-ui completion bash)",
    "_shadow_ui() {",
    "  local cur",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: the placeholder is bash parameter expansion, not JavaScript
    '  cur="${COMP_WORDS[COMP_CWORD]}"',
    '  if [ "$COMP_CWORD" -eq 1 ]; then',
    `    COMPREPLY=( $(compgen -W "${commands}" -- "$cur") )`,
    '  elif [[ "$cur" == -* ]]; then',
    `    COMPREPLY=( $(compgen -W "${flags.join(" ")}" -- "$cur") )`,
    "  fi",
    "  return 0",
    "}",
    "complete -o default -F _shadow_ui shadow-ui",
  ].join("\n");
}

function zshScript(commands: string, flags: readonly string[]): string {
  return [
    "#compdef shadow-ui",
    "",
    "_shadow_ui() {",
    "  local -a commands flags",
    `  commands=(${commands})`,
    `  flags=(${flags.join(" ")})`,
    "  if (( CURRENT == 2 )); then",
    "    compadd -- $commands",
    "  elif [[ $PREFIX == -* ]]; then",
    "    compadd -- $flags",
    "  else",
    "    _files",
    "  fi",
    "}",
    "",
    "if [[ $funcstack[1] == _shadow_ui ]]; then",
    '  _shadow_ui "$@"',
    "else",
    "  compdef _shadow_ui shadow-ui",
    "fi",
  ].join("\n");
}

function fishScript(commands: string, flags: readonly string[]): string {
  return [
    "# fish completion for shadow-ui. Save it as ~/.config/fish/completions/shadow-ui.fish,",
    "# or run: shadow-ui completion fish | source",
    `complete -c shadow-ui -f -n __fish_use_subcommand -a "${commands}"`,
    `complete -c shadow-ui -f -n "__fish_seen_subcommand_from completion" -a "${SHELLS.join(" ")}"`,
    ...flags.map((flag) => `complete -c shadow-ui -l ${flag}`),
  ].join("\n");
}
