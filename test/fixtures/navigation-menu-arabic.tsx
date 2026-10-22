import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

/** A right-to-left site menu: Arabic labels, a flyout, a plain link, and an Arabic-Indic digit trigger. */
export function Rtl() {
  return (
    <div dir="rtl" lang="ar">
      <NavigationMenu data-testid="nav" aria-label="القائمة الرئيسية" dir="rtl">
        <NavigationMenuList>
          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger data-testid="docs">الوثائق</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="docs-content">
              <NavigationMenuLink href="/start" active data-testid="start">
                ابدأ هنا
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="about">
            <a href="/about" class={navigationMenuTriggerStyle()} data-testid="about">
              من نحن
            </a>
          </NavigationMenuItem>
          <NavigationMenuItem value="version">
            <NavigationMenuTrigger data-testid="version">الإصدار ٣</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="version-content">
              <p data-testid="updates">٣ تحديثات جديدة</p>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
