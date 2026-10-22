import { useSignal } from "@shadow-js/core";
import {
  type UiStringsCatalog,
  UiStringsProvider,
  type UiStringValues,
  useUiLocale,
  useUiStrings,
} from "@/lib/ui-strings";

function Probe(props: {
  id: string;
  name: string;
  fallback: string;
  values?: UiStringValues | undefined;
}) {
  const t = useUiStrings();
  return <p data-testid={props.id}>{t(props.name, props.fallback, props.values)}</p>;
}

function Locale() {
  const locale = useUiLocale();
  return <p data-testid="locale">{locale() ?? "none"}</p>;
}

/** No provider at all: the fallback is the text. */
export function Bare(props: { values?: UiStringValues | undefined }) {
  return (
    <div>
      <Probe id="plain" name="dialog.close" fallback="Close" />
      <Probe id="page" name="pagination.page" fallback="Page {page} of {pages}" values={props.values} />
      <Probe
        id="count"
        name="chart.dataPoints"
        fallback="{count, plural, one {# data point} other {# data points}}"
        values={props.values}
      />
      <Locale />
    </div>
  );
}

/** A provider with a nested catalog and a flat one. */
export function Catalog(props: { strings: UiStringsCatalog; locale?: string | undefined; values?: UiStringValues | undefined }) {
  return (
    <UiStringsProvider strings={props.strings} locale={props.locale}>
      <Probe id="plain" name="dialog.close" fallback="Close" />
      <Probe id="missing" name="dialog.unknown" fallback="Unknown {name}" values={{ name: "x" }} />
      <Probe id="page" name="pagination.page" fallback="Page {page} of {pages}" values={props.values} />
      <Probe
        id="count"
        name="chart.dataPoints"
        fallback="{count, plural, one {# data point} other {# data points}}"
        values={props.values}
      />
      <Locale />
    </UiStringsProvider>
  );
}

/** A provider inside a provider: the inner one wins, then the outer one answers what it lacks. */
export function Nested() {
  return (
    <UiStringsProvider strings={{ dialog: { close: "outer close" }, sheet: { close: "outer sheet" } }} locale="fr">
      <UiStringsProvider strings={{ dialog: { close: "inner close" } }}>
        <Probe id="inner" name="dialog.close" fallback="Close" />
        <Probe id="outer" name="sheet.close" fallback="Close" />
        <Probe id="none" name="toast.close" fallback="Close toast" />
        <Locale />
      </UiStringsProvider>
    </UiStringsProvider>
  );
}

/** A translate function that reads a signal, as an i18n library's does. */
export function Translated() {
  const [language, setLanguage] = useSignal("en");
  return (
    <UiStringsProvider
      translate={(key) =>
        key === "dialog.close" ? (language() === "en" ? "Shut" : "Fermer") : undefined
      }
    >
      <Probe id="translated" name="dialog.close" fallback="Close" />
      <Probe id="rest" name="sheet.close" fallback="Close" />
      <button type="button" onClick={() => setLanguage("fr")}>
        switch
      </button>
    </UiStringsProvider>
  );
}
