import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

/** A right-to-left menu bar: the menus are labeled in Arabic and the bar's `dir` is set. */
export function Rtl() {
  return (
    <div dir="rtl" lang="ar">
      <Menubar dir="rtl" data-testid="bar">
        <MenubarMenu value="file">
          <MenubarTrigger data-testid="file">ملف</MenubarTrigger>
          <MenubarContent data-testid="file-content">
            <MenubarItem data-testid="new">جديد</MenubarItem>
            <MenubarItem data-testid="open">فتح</MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled>حفظ</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger data-testid="edit">تحرير</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>نسخ</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger data-testid="view">عرض</MenubarTrigger>
          <MenubarContent>
            <MenubarItem data-testid="columns">٣ أعمدة</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}

/** The same bar with the wrapper's `dir` only, and no `dir` prop on the bar. */
export function WrapperOnly() {
  return (
    <div dir="rtl" lang="ar">
      <Menubar data-testid="bar">
        <MenubarMenu value="file">
          <MenubarTrigger data-testid="file">ملف</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>جديد</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger data-testid="edit">تحرير</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>نسخ</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger data-testid="view">عرض</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>٣ أعمدة</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
