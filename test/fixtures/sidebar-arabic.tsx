import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

/** A sidebar with Arabic labels and Arabic-Indic digits, collapsed to icons, in a right-to-left page. */
export function Arabic(props: { defaultOpen?: boolean }) {
  return (
    <div dir="rtl" lang="ar">
      <SidebarProvider data-testid="wrapper" defaultOpen={props.defaultOpen} isMobile={false}>
        <Sidebar data-testid="sidebar" collapsible="icon" aria-label="القائمة الجانبية">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel data-testid="label">التطبيق</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="لوحة التحكم" data-testid="button">
                      <span data-testid="text">لوحة التحكم</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge data-testid="badge">٢٤</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
