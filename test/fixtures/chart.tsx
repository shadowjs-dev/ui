import { useSignal } from "@shadow-js/core";
import {
  ChartArea,
  ChartBar,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartLine,
  ChartPie,
  ChartRadial,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { UiStringsProvider } from "@/lib/ui-strings";

const rows = [
  { month: "Jan", sales: 120, returns: 10 },
  { month: "Feb", sales: 180, returns: 25 },
  { month: "Mar", sales: 90, returns: 5 },
];
const config = {
  sales: { label: "Sales" },
  returns: { label: "Returns", color: "#e11d48" },
};

export function Line() {
  return (
    <ChartContainer config={config} data-testid="chart">
      <ChartLine data={rows} xKey="month" series={["sales", "returns"]} />
    </ChartContainer>
  );
}

export function Area() {
  return (
    <ChartContainer config={config}>
      <ChartArea data={rows} xKey="month" series={["sales"]} legend={false} />
    </ChartContainer>
  );
}

export function Bar() {
  return (
    <ChartContainer config={config}>
      <ChartBar data={rows} xKey="month" series={["sales", "returns"]} />
    </ChartContainer>
  );
}

export function Pie() {
  return (
    <ChartContainer config={config}>
      <ChartPie
        data={[
          { name: "sales", share: 3 },
          { name: "returns", share: 1 },
        ]}
        nameKey="name"
        valueKey="share"
      />
    </ChartContainer>
  );
}

/** Options the tests turn on one at a time. */
export function Options(props: {
  kind: "line" | "area" | "bar";
  [name: string]: unknown;
}) {
  const { kind, locale, ...rest } = props;
  const Chart = kind === "line" ? ChartLine : kind === "area" ? ChartArea : ChartBar;
  return (
    <ChartContainer config={config} locale={locale as string | undefined}>
      <Chart data={rows} xKey="month" series={["sales", "returns"]} {...rest} />
    </ChartContainer>
  );
}

/** Rows with negative values, for the baseline and the axis. */
export function Negative() {
  return (
    <ChartContainer config={config}>
      <ChartBar
        data={[
          { month: "Jan", sales: 50, returns: -30 },
          { month: "Feb", sales: -20, returns: 40 },
        ]}
        xKey="month"
        series={["sales", "returns"]}
        stacked
      />
    </ChartContainer>
  );
}

/** Composition: the tooltip and the legend are parts of the chart. */
export function Composed(props: {
  indicator?: "dot" | "line" | "dashed";
  hideLabel?: boolean;
  hideIcon?: boolean;
  verticalAlign?: "top" | "bottom";
  withFormatters?: boolean;
}) {
  const withIcon = {
    sales: { label: "Sales", icon: () => <i data-testid="sales-icon" /> },
    returns: { label: "Returns", color: "#e11d48" },
  };
  return (
    <ChartContainer config={withIcon}>
      <ChartLine data={rows} xKey="month" series={["sales", "returns"]}>
        <ChartTooltip>
          <ChartTooltipContent
            indicator={props.indicator}
            hideLabel={props.hideLabel}
            labelFormatter={
              props.withFormatters ? (label: string) => `Month: ${label}` : undefined
            }
            formatter={
              props.withFormatters
                ? (row: { label: string; text: string }) => (
                    <span data-testid="custom-row">
                      {row.label}={row.text}
                    </span>
                  )
                : undefined
            }
          />
        </ChartTooltip>
        <ChartLegend verticalAlign={props.verticalAlign}>
          <ChartLegendContent hideIcon={props.hideIcon} />
        </ChartLegend>
      </ChartLine>
    </ChartContainer>
  );
}

/** Composition with nothing in it: no tooltip and no legend are drawn. */
export function Bare() {
  return (
    <ChartContainer config={config}>
      <ChartLine data={rows} xKey="month" series={["sales"]}>
        <span data-testid="note">custom</span>
      </ChartLine>
    </ChartContainer>
  );
}

const browsers = [
  { name: "Chrome", visitors: 275 },
  { name: "Safari", visitors: 200 },
  { name: "Firefox", visitors: 25 },
];

export function Donut(props: { innerRadius?: number; gap?: number }) {
  return (
    <ChartContainer config={{ Chrome: { label: "Chrome browser" }, Safari: { label: "Safari" } }}>
      <ChartPie
        data={browsers}
        nameKey="name"
        valueKey="visitors"
        innerRadius={props.innerRadius ?? 0.6}
        gap={props.gap}
        center={<span data-testid="center">500</span>}
      />
    </ChartContainer>
  );
}

export function Single() {
  return (
    <ChartContainer config={{}}>
      <ChartPie data={[{ name: "All", visitors: 10 }]} nameKey="name" valueKey="visitors" />
    </ChartContainer>
  );
}

export function Radial(props: { max?: number; startAngle?: number; endAngle?: number }) {
  return (
    <ChartContainer config={{}}>
      <ChartRadial
        data={[
          { name: "Move", value: 75 },
          { name: "Exercise", value: 40 },
        ]}
        nameKey="name"
        valueKey="value"
        max={props.max ?? 100}
        startAngle={props.startAngle}
        endAngle={props.endAngle}
      />
    </ChartContainer>
  );
}

/** Many rows, to reach the guard against very large data. */
export function Large(props: { count: number; maxPoints?: number }) {
  const data = Array.from({ length: props.count }, (_, index) => ({
    day: `d${index}`,
    value: Math.sin(index / 30) * 50 + (index === 777 ? 400 : 0),
  }));
  return (
    <ChartContainer config={{ value: { label: "Value" } }}>
      <ChartLine data={data} xKey="day" series={["value"]} maxPoints={props.maxPoints} />
    </ChartContainer>
  );
}

/** Data that changes. */
export function Changing() {
  const [data, setData] = useSignal([
    { month: "Jan", sales: 10 },
    { month: "Feb", sales: 20 },
  ]);
  return (
    <div>
      <ChartContainer config={config}>
        <ChartBar data={data()} xKey="month" series={["sales"]} legend={false} />
      </ChartContainer>
      <button
        type="button"
        onClick={() =>
          setData([
            { month: "Jan", sales: 10 },
            { month: "Feb", sales: 20 },
            { month: "Mar", sales: 400 },
          ])
        }
      >
        grow
      </button>
    </div>
  );
}

/** A series key that is not a valid CSS name, and a custom value formatter. */
export function Odd() {
  return (
    <ChartContainer config={{ "page views": { label: "Page views" } }}>
      <ChartLine
        data={[{ day: "Mon", "page views": 5 }]}
        xKey="day"
        series={["page views"]}
        valueFormatter={(value: number) => `${value} views`}
      />
    </ChartContainer>
  );
}

/** A chart with no container around it. */
export function Alone() {
  return <ChartBar data={rows} xKey="month" series={["sales"]} />;
}

/** A chart in an app that sets its words and digits. */
export function Localized(props: { dir?: "ltr" | "rtl" }) {
  return (
    <UiStringsProvider
      locale="ar"
      strings={{
        chart: {
          roledescription: "رسم بياني",
          label: { line: "رسم خطي لـ {series}" },
          announce: "{label}: {values}",
          value: "{name}: {value}",
          separator: "، ",
        },
      }}
    >
      <div dir={props.dir}>
        <ChartContainer
          config={{ sales: { label: "المبيعات" } }}
          locale="ar-EG"
          dir={props.dir}
        >
          <ChartLine
            data={[
              { month: "يناير", sales: 1200 },
              { month: "فبراير", sales: 1800 },
            ]}
            xKey="month"
            series={["sales"]}
          />
        </ChartContainer>
      </div>
    </UiStringsProvider>
  );
}

/** The chart between two buttons, to count the tab stops. */
export function Surrounded(props: { kind: "line" | "bar" | "pie" | "radial" }) {
  const browsers = [
    { name: "Chrome", visitors: 275 },
    { name: "Safari", visitors: 200 },
  ];
  return (
    <div>
      <button type="button">before</button>
      <ChartContainer config={config}>
        {props.kind === "line" ? (
          <ChartLine data={rows} xKey="month" series={["sales", "returns"]} />
        ) : props.kind === "bar" ? (
          <ChartBar data={rows} xKey="month" series={["sales", "returns"]} />
        ) : props.kind === "pie" ? (
          <ChartPie data={browsers} nameKey="name" valueKey="visitors" />
        ) : (
          <ChartRadial data={browsers} nameKey="name" valueKey="visitors" max={300} />
        )}
      </ChartContainer>
      <button type="button">after</button>
    </div>
  );
}

/** Twelve rows with long labels, which do not all fit side by side. */
export function Wide() {
  const data = Array.from({ length: 12 }, (_, index) => ({ label: `Month number ${index + 1}`, value: index }));
  return (
    <ChartContainer config={{ value: { label: "Value" } }}>
      <ChartLine data={data} xKey="label" series={["value"]} />
    </ChartContainer>
  );
}
