import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

const today = "اليوم";
const joined = "انضمت آدا";

export function Rtl() {
  return (
    <div dir="rtl" data-testid="root">
      <Marker variant="separator" data-testid="separator">
        <MarkerContent>{today}</MarkerContent>
      </Marker>
      <Marker data-testid="row">
        <MarkerIcon>
          <svg viewBox="0 0 1 1" />
        </MarkerIcon>
        <MarkerContent>{joined}</MarkerContent>
      </Marker>
    </div>
  );
}
