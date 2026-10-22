import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";

/** An Arabic settings list in a right-to-left document: an outline item, a separator, and a link item. */
export function Rtl() {
  return (
    <div dir="rtl">
      <ItemGroup aria-label="الإعدادات" data-testid="list">
        <Item variant="outline" data-testid="first">
          <ItemMedia variant="icon" data-testid="media">
            <span>ن</span>
          </ItemMedia>
          <ItemContent data-testid="content">
            <ItemTitle>الإشعارات</ItemTitle>
            <ItemDescription>إدارة تنبيهات الحساب.</ItemDescription>
          </ItemContent>
          <ItemActions data-testid="actions">
            <button type="button">تعديل</button>
          </ItemActions>
        </Item>
        <ItemSeparator data-testid="separator" />
        <Item as="a" href="#profile" data-testid="link">
          الملف الشخصي
        </Item>
      </ItemGroup>
    </div>
  );
}
