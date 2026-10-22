import { For } from "@shadow-js/web";
import { UiStringsProvider } from "@/lib/ui-strings";
import { CheckIcon } from "@/components/ui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface LayoutProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  storageKey?: string;
  cookieName?: string;
  cookieMaxAge?: number;
  isMobile?: boolean;
  keyboardShortcut?: string | false;
  providerClass?: string;
  providerStyle?: string | Record<string, string>;
  side?: "start" | "end";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  sidebarClass?: string;
}

/** Shows what `useSidebar()` reports. */
export function State() {
  const sidebar = useSidebar();
  return (
    <p data-testid="state">
      {sidebar.state()}|{String(sidebar.open())}|{String(sidebar.openMobile())}|
      {String(sidebar.isMobile())}
    </p>
  );
}

const PROJECTS = ["Design", "Sales"];

/** A complete application shell: header, groups, menus, tooltips, footer, rail and page. */
export function Layout(props: LayoutProps) {
  return (
    <SidebarProvider
      data-testid="wrapper"
      defaultOpen={props.defaultOpen}
      open={props.open}
      onOpenChange={props.onOpenChange}
      storageKey={props.storageKey}
      cookieName={props.cookieName}
      cookieMaxAge={props.cookieMaxAge}
      isMobile={props.isMobile}
      keyboardShortcut={props.keyboardShortcut}
      class={props.providerClass}
      style={props.providerStyle}
    >
      <Sidebar
        data-testid="sidebar"
        side={props.side}
        variant={props.variant}
        collapsible={props.collapsible}
        class={props.sidebarClass}
      >
        <SidebarHeader data-testid="header">
          <SidebarInput placeholder="Search..." />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupAction title="Add">+</SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Dashboard">
                    <CheckIcon />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>24</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton as="a" href="/inbox" size="lg" variant="outline">
                    <span>Inbox</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover aria-label="Inbox options">
                    ...
                  </SidebarMenuAction>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm">Plain</SidebarMenuButton>
                  <SidebarMenuSub>
                    <For each={PROJECTS}>
                      {(name) => (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href={`/${name}`} isActive={name === "Design"}>
                            <span>{name}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </For>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as="button" size="sm">
                        Small
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter data-testid="footer">Footer</SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset data-testid="inset">
        <SidebarTrigger />
        <input aria-label="Notes" />
        <State />
      </SidebarInset>
    </SidebarProvider>
  );
}

/** A part used outside `SidebarProvider`. */
export function Orphan() {
  return <State />;
}

/** The shell inside a wrapper with `dir="rtl"`; the provider gets no dir prop. */
export function InRtlWrapper(props: LayoutProps) {
  return (
    <div dir="rtl">
      <Layout {...props} />
    </div>
  );
}

/** The sidebar of an app that sets its words: the trigger, the rail and the mobile sheet speak Arabic. */
export function Translated(props: { isMobile?: boolean; dir?: "ltr" | "rtl" }) {
  return (
    <UiStringsProvider
      locale="ar"
      strings={{
        sidebar: {
          toggle: "تبديل الشريط الجانبي",
          title: "الشريط الجانبي",
          mobileDescription: "يعرض الشريط الجانبي للجوال.",
        },
      }}
    >
      <div dir={props.dir} lang={props.dir === "rtl" ? "ar" : undefined}>
        <SidebarProvider isMobile={props.isMobile}>
          <Sidebar>
            <SidebarHeader>Brand</SidebarHeader>
            <SidebarContent>Navigation</SidebarContent>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <SidebarTrigger />
          </SidebarInset>
        </SidebarProvider>
      </div>
    </UiStringsProvider>
  );
}
