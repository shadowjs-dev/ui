import { DirectionProvider, useDirection } from "@/components/ui/direction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const first = "الأول";
const second = "الثاني";

function Name() {
  const dir = useDirection();
  return <span data-testid="dir">{dir()}</span>;
}

export function Arabic() {
  return (
    <div dir="rtl" data-testid="root">
      <DirectionProvider dir="rtl">
        <Name />
        <Tabs defaultValue="one" dir="rtl">
          <TabsList aria-label="الصفحات">
            <TabsTrigger value="one" data-testid="one">
              {first}
            </TabsTrigger>
            <TabsTrigger value="two" data-testid="two">
              {second}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="one">محتوى</TabsContent>
        </Tabs>
      </DirectionProvider>
    </div>
  );
}
