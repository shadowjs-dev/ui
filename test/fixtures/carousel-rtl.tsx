import {
  Carousel,
  CarouselContent,
  CarouselIndicators,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const labels = {
  previous: "الشريحة السابقة",
  next: "الشريحة التالية",
  slide: (position: number, total: number) => `${position} من ${total}`,
  goToSlide: (position: number) => `انتقل إلى الشريحة ${position}`,
};

export function Rtl() {
  return (
    <div dir="rtl">
      <Carousel aria-label="المميزات" labels={labels} data-testid="carousel">
        <CarouselContent data-testid="content">
          <CarouselItem data-testid="item-1">الأولى</CarouselItem>
          <CarouselItem data-testid="item-2">الثانية</CarouselItem>
          <CarouselItem data-testid="item-3">الثالثة</CarouselItem>
        </CarouselContent>
        <CarouselPrevious data-testid="prev" />
        <CarouselNext data-testid="next" />
        <CarouselIndicators data-testid="indicators" />
      </Carousel>
    </div>
  );
}
