import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * A keyboard key or shortcut hint: a `kbd` element whose text is the key's name. Inside a tooltip
 * it adapts its colors.
 *
 * Keyboard and ARIA: a key hint handles no keys and never takes the pointer (`pointer-events` is
 * off). It adds no role and no `aria-*` attribute; screen readers read the text it contains, so
 * write the key names as they should be spoken ("Ctrl", "K").
 *
 * @param props The `kbd` attributes. The children are the key label; `class` adds to the classes.
 * @returns The `kbd` element.
 * @example
 * import { Kbd } from "@/components/ui/kbd";
 *
 * <Kbd>Esc</Kbd>
 * @since 1.0.0
 * @see {@link KbdGroup}
 */
function Kbd(props: ComponentProps<"kbd">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <kbd
      data-slot="kbd"
      class={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-foreground/60 select-none forced-colors:border [&_svg:not([class*='size-'])]:size-3",
        "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </kbd>
  );
}

/**
 * Groups the keys of one shortcut, with a small gap between them: `Ctrl` then `K`.
 *
 * Keyboard and ARIA: no keys and no role of its own; the keys inside are read in order.
 *
 * @param props The `kbd` attributes. The children are the {@link Kbd} keys; `class` adds to the classes.
 * @returns The group element, a `kbd` that holds the keys.
 * @example
 * import { Kbd, KbdGroup } from "@/components/ui/kbd";
 *
 * <KbdGroup>
 *   <Kbd>Ctrl</Kbd>
 *   <Kbd>K</Kbd>
 * </KbdGroup>
 * @since 1.0.0
 * @see {@link Kbd}
 */
function KbdGroup(props: ComponentProps<"kbd">): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <kbd data-slot="kbd-group" class={cn("inline-flex items-center gap-1", local.class)} {...rest}>
      {local.children}
    </kbd>
  );
}

export { Kbd, KbdGroup };
