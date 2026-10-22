import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A text field: the browser's own `input`, in the kit's look. Use it for single-line text, email,
 * number, date and file entry. All `input` attributes pass through.
 *
 * Keyboard and ARIA: the keys are the browser's own (typing, the arrow keys, Tab). The component
 * adds no role and no `aria-*` attribute; the browser gives the input its role from its `type`.
 * Name the field with a {@link Label} (`htmlFor` pointing at the input's `id`), or with
 * `aria-label` or `aria-labelledby`. `aria-invalid="true"`, which you pass, turns the border and
 * the border destructive and tints the ring.
 *
 * shadcn/ui differences: `class` replaces `className`.
 *
 * @param props The `input` attributes. `class` adds to the field's classes; `type` is the input type.
 * @returns The `input` element.
 * @example
 * import { Input } from "@/components/ui/input";
 *
 * <Input type="email" placeholder="Email" />
 * @since 1.0.0
 * @see {@link Label}
 */
function Input(props: ComponentProps<"input">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "type"]);
  return (
    <input
      type={local.type}
      data-slot="input"
      class={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Input };
