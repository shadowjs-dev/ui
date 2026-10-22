import {
  ChartBar,
  ChartContainer,
  ChartLine,
  ChartPie,
  ChartRadial,
} from "@/components/ui/chart";

const rows = [
  { month: "يناير", sales: 120, returns: 10 },
  { month: "فبراير", sales: 180, returns: 25 },
  { month: "مارس", sales: 90, returns: 5 },
];
const config = {
  sales: { label: "المبيعات" },
  returns: { label: "المرتجعات", color: "#e11d48" },
};

export function Rtl() {
  return (
    <div dir="rtl">
      <ChartContainer config={config} data-testid="container">
        <ChartLine data={rows} xKey="month" series={["sales", "returns"]} data-testid="chart" />
      </ChartContainer>
    </div>
  );
}

export function RtlBars() {
  return (
    <div dir="rtl">
      <ChartContainer config={config}>
        <ChartBar data={rows} xKey="month" series={["sales", "returns"]} />
      </ChartContainer>
    </div>
  );
}

/** The direction comes from the prop alone, with no `dir` attribute anywhere. */
export function RtlProp() {
  return (
    <ChartContainer config={config} dir="rtl">
      <ChartLine data={rows} xKey="month" series={["sales"]} />
    </ChartContainer>
  );
}

export function RtlDigits() {
  return (
    <div dir="rtl" lang="ar">
      <ChartContainer config={config} locale="ar-EG">
        <ChartLine data={rows} xKey="month" series={["sales"]} />
      </ChartContainer>
    </div>
  );
}

const browsers = [
  { name: "كروم", visitors: 275 },
  { name: "سفاري", visitors: 200 },
  { name: "فايرفوكس", visitors: 25 },
];

export function RtlPolar() {
  return (
    <div dir="rtl">
      <ChartContainer config={{}}>
        <ChartPie data={browsers} nameKey="name" valueKey="visitors" innerRadius={0.5} />
        <ChartRadial data={browsers} nameKey="name" valueKey="visitors" max={300} />
      </ChartContainer>
    </div>
  );
}
