import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Rtl() {
  return (
    <div dir="rtl">
      <Breadcrumb data-testid="nav" aria-label="مسار التنقل">
        <BreadcrumbList data-testid="list">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" data-testid="home">
              الرئيسية
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="first-sep" />
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs" data-testid="docs">
              المستندات
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="second-sep" />
          <BreadcrumbItem>
            <BreadcrumbPage data-testid="page">الإعدادات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
