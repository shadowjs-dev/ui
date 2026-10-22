import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const first = "الحساب";
const second = "كلمة المرور";
const firstBody = "بيانات الحساب";
const secondBody = "تغيير كلمة المرور";

export function Arabic() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">{first}</TabsTrigger>
        <TabsTrigger value="password">{second}</TabsTrigger>
      </TabsList>
      <TabsContent value="account">{firstBody}</TabsContent>
      <TabsContent value="password">{secondBody}</TabsContent>
    </Tabs>
  );
}
