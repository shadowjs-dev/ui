/**
 * Test helpers shared by the component suites: the server render -> client hydrate round trip and
 * small DOM readers. Everything is synchronous (`flushSync`), nothing sleeps.
 */
import { flushSync } from "@shadow-js/core";
import { createComponent, hydrate } from "@shadow-js/web";
import { createComponent as createServerComponent, renderToString } from "@shadow-js/web/server";

/** A key press: keydown then keyup on `target`, effects flushed. Returns false when keydown was canceled. */
export function key(target: EventTarget, name: string, init: KeyboardEventInit = {}): boolean {
  const down = new KeyboardEvent("keydown", {
    key: name,
    bubbles: true,
    cancelable: true,
    composed: true,
    ...init,
  });
  const allowed = target.dispatchEvent(down);
  flushSync();
  target.dispatchEvent(
    new KeyboardEvent("keyup", {
      key: name,
      bubbles: true,
      cancelable: true,
      composed: true,
      ...init,
    }),
  );
  flushSync();
  return allowed;
}

/** The first element matching `selector` anywhere in the document (portals included). */
export function q<T extends Element = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

/** Like {@link q} but throws when nothing matches, so a test fails with the selector in the message. */
export function must<T extends Element = HTMLElement>(selector: string): T {
  const found = q<T>(selector);
  if (found === null) throw new Error(`no element matches ${selector}`);
  return found;
}

/** The result of rendering a fixture on the server and hydrating it on the client. */
export interface HydrationResult {
  /** The markup the server produced. */
  readonly html: string;
  /** The container holding the hydrated DOM. */
  readonly host: HTMLElement;
  /** Every element the server markup contained, in document order, before hydration. */
  readonly serverElements: readonly Element[];
  /** Removes the container. */
  dispose(): void;
}

type Component = (props: Record<string, unknown>) => unknown;

/**
 * Renders `ssr` on the server, puts the markup in a container, hydrates it with `dom`, and returns
 * the pieces so a test can assert that the very same elements were kept.
 */
export function ssrAndHydrate(
  ssr: Component,
  dom: Component,
  props: Record<string, unknown> = {},
): HydrationResult {
  const html = renderToString(() => createServerComponent(ssr, props));
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  const serverElements = [...host.querySelectorAll("*")];
  const stop = hydrate(() => createComponent(dom, props), host);
  flushSync();
  return {
    html,
    host,
    serverElements,
    dispose() {
      if (typeof stop === "function") stop();
      host.remove();
    },
  };
}
