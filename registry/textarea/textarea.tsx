import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A multi-line text field that grows with its content (`field-sizing: content`). It is a native
 * `textarea`, so every `textarea` attribute passes through (`value`, `rows`, `disabled`, `name`,
 * `onInput`, and so on). `aria-invalid="true"` turns the border and the focus ring destructive.
 *
 * Keyboard and ARIA: the browser's own keys apply. Tab moves focus in and out, Enter inserts a line
 * break, and the arrow keys move the caret. It has the `textbox` role. Name it with a
 * {@link Label} (`id` on the textarea, `htmlFor` on the label) or with `aria-label`. Set
 * `aria-invalid="true"` and `aria-describedby` on the textarea to show an error.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props - The props: the attributes of the native `textarea`. `class` is merged with the base
 * classes.
 * @returns The `textarea` element.
 * @example
 * ```tsx
 * import { Label } from "@/components/ui/label";
 * import { Textarea } from "@/components/ui/textarea";
 *
 * export function Feedback() {
 *   return (
 *     <div class="grid gap-2">
 *       <Label htmlFor="feedback">Feedback</Label>
 *       <Textarea id="feedback" placeholder="Type your message here." rows={3} />
 *     </div>
 *   );
 * }
 * ```
 * @since 1.0.0
 * @see {@link Label}
 */
function Textarea(props: ComponentProps<"textarea">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <textarea
      data-slot="textarea"
      class={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 motion-reduce:transition-none md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Textarea };
