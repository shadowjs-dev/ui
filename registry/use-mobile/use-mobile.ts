import { type Accessor, onMount, useSignal } from "@shadow-js/core";

/** Viewports narrower than this many px count as mobile (Tailwind's `md` breakpoint). */
const MOBILE_BREAKPOINT = 768;

/**
 * Whether the viewport is narrower than the `md` breakpoint (`max-width: 767px`). The value is
 * `false` on the server and until the component has mounted, so the server markup and the first
 * client render agree; it then follows the media query. The listener is removed with the owner.
 *
 * @returns An accessor with the current answer.
 * @example
 * ```tsx
 * import { useIsMobile } from "@/hooks/use-mobile";
 * import { Show } from "@shadow-js/web";
 *
 * function DesktopNav() {
 *   return <nav>Desktop</nav>;
 * }
 *
 * function MobileNav() {
 *   return <nav>Mobile</nav>;
 * }
 *
 * export function Navigation() {
 *   const isMobile = useIsMobile();
 *   return <Show when={isMobile()} fallback={<DesktopNav />}><MobileNav /></Show>;
 * }
 * ```
 * @since 1.0.0
 */
function useIsMobile(): Accessor<boolean> {
  const [isMobile, setIsMobile] = useSignal(false);
  onMount(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const sync = (): void => {
      setIsMobile(query.matches);
    };
    query.addEventListener("change", sync);
    sync();
    return () => query.removeEventListener("change", sync);
  });
  return isMobile;
}

export { useIsMobile };
