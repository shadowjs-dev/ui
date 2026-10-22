import { Button } from "@/components/ui/button";
import { type ToastApi, type ToastStore, Toaster, useToast } from "@/components/ui/toast";

interface DemoProps {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  richColors?: boolean;
  closeButton?: boolean;
  duration?: number;
  visibleToasts?: number;
  expand?: boolean;
  theme?: "light" | "dark" | "system";
  hotkey?: string[];
  label?: string;
  dir?: "ltr" | "rtl";
  class?: string;
  toastOptions?: { class?: string };
  store?: ToastStore;
  ready?: (toast: ToastApi) => void;
}

/** Hands the toaster's API to the test: a child of the toaster that reads it with `useToast()`. */
function Probe(props: { readonly ready?: ((toast: ToastApi) => void) | undefined }) {
  const toast = useToast();
  props.ready?.(toast);
  return <></>;
}

/** The buttons of the demo. They raise toasts through `useToast()`, as an application's components do. */
function Raisers() {
  const toast = useToast();
  return (
    <>
      <Button onClick={() => toast("Event created", { description: "Friday at 5:00 PM" })}>
        Show
      </Button>
      <Button onClick={() => toast.success("Saved")}>Success</Button>
      <Button onClick={() => toast.error("Failed", { id: "fail" })}>Error</Button>
    </>
  );
}

/** A toaster and buttons that raise toasts the way an application does. */
export function Demo(props: DemoProps) {
  return (
    <div>
      <Toaster
        data-testid="toaster"
        position={props.position}
        richColors={props.richColors}
        closeButton={props.closeButton}
        duration={props.duration}
        visibleToasts={props.visibleToasts}
        expand={props.expand}
        theme={props.theme}
        hotkey={props.hotkey}
        label={props.label}
        dir={props.dir}
        class={props.class}
        toastOptions={props.toastOptions}
        store={props.store}
      >
        <Probe ready={props.ready} />
        <Raisers />
      </Toaster>
    </div>
  );
}

/** Only the toaster, for tests that raise toasts through the API the probe hands out. */
export function Bare(props: DemoProps) {
  return (
    <Toaster
      position={props.position}
      richColors={props.richColors}
      closeButton={props.closeButton}
      duration={props.duration}
      visibleToasts={props.visibleToasts}
      expand={props.expand}
      theme={props.theme}
      dir={props.dir}
      store={props.store}
    >
      <Probe ready={props.ready} />
    </Toaster>
  );
}

/** A component outside any toaster: `useToast()` must throw in it. */
export function Orphan() {
  const toast = useToast();
  return <Button onClick={() => toast.success("never shown")}>Raise</Button>;
}

/** A toast raised while rendering on the server: its id is in the markup, so two renders can be compared. */
function RaisedId() {
  const toast = useToast();
  return <span data-testid="id">{toast.message("raised while rendering")}</span>;
}

/** Server-renders a toaster with one toast raised during the render. */
export function Ids() {
  return (
    <Toaster>
      <RaisedId />
    </Toaster>
  );
}
