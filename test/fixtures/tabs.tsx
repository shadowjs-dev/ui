import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DemoProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  activationMode?: "automatic" | "manual";
  loop?: boolean;
  disabled?: string[];
}

const VALUES = ["account", "password", "billing"];

export function Demo(props: DemoProps) {
  return (
    <Tabs
      data-testid="root"
      value={props.value}
      defaultValue={props.defaultValue ?? "account"}
      onValueChange={props.onValueChange}
      orientation={props.orientation}
      dir={props.dir}
      activationMode={props.activationMode}
    >
      <TabsList aria-label="Settings" data-testid="list" loop={props.loop}>
        {VALUES.map((value) => (
          <TabsTrigger value={value} disabled={props.disabled?.includes(value)}>
            {value}
          </TabsTrigger>
        ))}
      </TabsList>
      {VALUES.map((value) => (
        <TabsContent value={value}>
          <p>{value} panel</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function Custom() {
  return (
    <Tabs defaultValue="a" class="gap-6">
      <TabsList aria-label="Custom" class="h-12 bg-red-500">
        <TabsTrigger value="a" class="px-6 text-base">
          A
        </TabsTrigger>
      </TabsList>
      <TabsContent value="a" class="p-4">
        Panel A
      </TabsContent>
    </Tabs>
  );
}

/** The line variant: an underline under the selected tab, on a transparent list. */
export function Line() {
  return (
    <Tabs defaultValue="a">
      <TabsList aria-label="Lines" variant="line" data-testid="list">
        <TabsTrigger value="a" data-testid="trigger">
          A
        </TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
    </Tabs>
  );
}
