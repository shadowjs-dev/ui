import { useSignal } from "@shadow-js/core";
import { For, Show } from "@shadow-js/web";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxLoading,
  ComboboxSeparator,
  ComboboxValue,
} from "@/components/ui/combobox";

const FRAMEWORKS = [
  { value: "next", label: "Next.js" },
  { value: "svelte", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js", disabled: true },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

interface DemoProps {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  inputValue?: string;
  disabled?: boolean;
  name?: string;
  dir?: "ltr" | "rtl";
  shouldFilter?: boolean;
  showTrigger?: boolean;
  showClear?: boolean;
  class?: string;
  contentClass?: string;
  invalid?: boolean;
}

interface MultiProps {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
}

/** The text of a value before its item has ever rendered (the list is closed). */
const labelOf = (value: string): string =>
  FRAMEWORKS.find((framework) => framework.value === value)?.label ?? value;

/** A single-select combobox with a label, a clear button and an empty message. */
export function Demo(props: DemoProps) {
  return (
    <Combobox
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      inputValue={props.inputValue}
      disabled={props.disabled}
      name={props.name}
      dir={props.dir}
      shouldFilter={props.shouldFilter}
      itemToString={labelOf}
    >
      <ComboboxLabel>Framework</ComboboxLabel>
      <ComboboxInput
        placeholder="Select a framework"
        showTrigger={props.showTrigger}
        showClear={props.showClear}
        class={props.class}
        aria-invalid={props.invalid ? "true" : undefined}
      />
      <ComboboxContent class={props.contentClass}>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <For each={FRAMEWORKS}>
          {(framework) => (
            <ComboboxItem value={framework.value} disabled={framework.disabled}>
              {framework.label}
            </ComboboxItem>
          )}
        </For>
      </ComboboxContent>
    </Combobox>
  );
}

/** Two groups and a separator. */
export function Grouped() {
  return (
    <Combobox>
      <ComboboxInput aria-label="Tool" />
      <ComboboxContent>
        <ComboboxGroup>
          <ComboboxLabel>Frameworks</ComboboxLabel>
          <ComboboxItem value="next">Next.js</ComboboxItem>
          <ComboboxItem value="remix">Remix</ComboboxItem>
        </ComboboxGroup>
        <ComboboxSeparator />
        <ComboboxGroup>
          <ComboboxLabel>Bundlers</ComboboxLabel>
          <ComboboxItem value="vite">Vite</ComboboxItem>
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  );
}

/** A multiple combobox with chips. */
export function Multi(props: MultiProps) {
  return (
    <Combobox
      multiple
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      name={props.name}
      itemToString={labelOf}
    >
      <ComboboxChips data-testid="chips">
        <ComboboxValue>
          {(chip) => <ComboboxChip value={chip.value}>{chip.label()}</ComboboxChip>}
        </ComboboxValue>
        <ComboboxChipsInput aria-label="Frameworks" placeholder="Add a framework" />
      </ComboboxChips>
      <ComboboxContent>
        <For each={FRAMEWORKS}>
          {(framework) => (
            <ComboboxItem value={framework.value} disabled={framework.disabled}>
              {framework.label}
            </ComboboxItem>
          )}
        </For>
      </ComboboxContent>
    </Combobox>
  );
}

export function Controlled() {
  const [value, setValue] = useSignal<string | null>("remix");
  return (
    <div>
      <Combobox
        value={value()}
        onValueChange={(next: string | null) => setValue(next)}
        itemToString={labelOf}
      >
        <ComboboxInput aria-label="Framework" />
        <ComboboxContent>
          <ComboboxItem value="next">Next.js</ComboboxItem>
          <ComboboxItem value="remix">Remix</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <button type="button" onClick={() => setValue("next")}>
        next
      </button>
      <output>{value() ?? "none"}</output>
    </div>
  );
}

/** Server-style filtering with a loading row. */
export function Remote(props: { loading?: boolean }) {
  return (
    <Combobox shouldFilter={false} defaultOpen>
      <ComboboxInput aria-label="Search" />
      <ComboboxContent>
        <Show when={props.loading}>
          <ComboboxLoading>Searching...</ComboboxLoading>
        </Show>
        <ComboboxItem value="a">Alpha</ComboboxItem>
      </ComboboxContent>
    </Combobox>
  );
}

export function InForm() {
  return (
    <form data-testid="form">
      <Combobox name="framework" defaultValue="astro">
        <ComboboxInput aria-label="Framework" />
        <ComboboxContent>
          <ComboboxItem value="astro">Astro</ComboboxItem>
          <ComboboxItem value="next">Next.js</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <button type="reset">reset</button>
    </form>
  );
}

const FRUITS = ["Apple", "Banana", "Cherry"];

/** The list takes a render function over the `items` of the root. */
export function ItemsList(props: { items?: string[] }) {
  return (
    <Combobox items={props.items ?? FRUITS} defaultOpen>
      <ComboboxInput aria-label="Fruit" />
      <ComboboxContent>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList data-testid="list">
          {(item: string, index: number) => (
            <ComboboxItem value={item} data-index={index}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** Plain children inside the list keep working. */
export function PlainList() {
  return (
    <Combobox defaultOpen>
      <ComboboxInput aria-label="Fruit" />
      <ComboboxContent>
        <ComboboxList data-testid="list">
          <ComboboxItem value="apple">Apple</ComboboxItem>
          <ComboboxItem value="banana">Banana</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

const GROUPS = [
  { label: "Fruits", items: ["Apple", "Banana"] },
  { label: "Vegetables", items: ["Carrot", "Leek"] },
];

/** Groups hand their `items` to a collection. */
export function Collections() {
  return (
    <Combobox defaultOpen>
      <ComboboxInput aria-label="Food" />
      <ComboboxContent>
        <ComboboxList>
          <For each={GROUPS}>
            {(group) => (
              <ComboboxGroup items={group.items}>
                <ComboboxLabel>{group.label}</ComboboxLabel>
                <ComboboxCollection>
                  {(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </For>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** A collection with its own `items`. */
export function OwnItems() {
  return (
    <Combobox defaultOpen>
      <ComboboxInput aria-label="Food" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxCollection items={["Rye", "Spelt"]}>
            {(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** The items of the root come from a signal. */
export function ReactiveItems() {
  const [items, setItems] = useSignal(["Apple"]);
  return (
    <Combobox items={items()} defaultOpen>
      <ComboboxInput aria-label="Fruit" />
      <ComboboxContent>
        <button type="button" data-testid="more" onClick={() => setItems(["Apple", "Fig"])}>
          more
        </button>
        <ComboboxList>{(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
