import { type Accessor, useSignal } from "@shadow-js/core";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";

export function Lines(props: { code: Accessor<string>; language: string }) {
  const lines = useHighlightedCode(props.code, props.language);
  return <pre data-testid="out">{lines()}</pre>;
}

export function Growing() {
  const [code, setCode] = useSignal("const a = 1;");
  return (
    <div>
      <button type="button" data-testid="grow" onClick={() => setCode(`${code()}\nconst b = 2;`)}>
        grow
      </button>
      <Lines code={code} language="ts" />
    </div>
  );
}
