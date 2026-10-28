"use client";

import { CardFanCarousel } from "@/components/ui/card-fan-carousel";

// No `cards` prop = the 10 default Unsplash photos (more than 7, so arrows + dots show).
// Pass your own: cards={[{ imgUrl: "...", alt: "...", linkUrl: "/work/1" }, ...]}
export default function CardFanCarouselDemo() {
  return (
    <div className="flex min-h-screen items-center bg-white dark:bg-neutral-950">
      <CardFanCarousel />
    </div>
  );
}
