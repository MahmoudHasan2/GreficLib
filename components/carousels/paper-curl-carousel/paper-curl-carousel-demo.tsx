"use client"

import { PaperCurlCarousel } from "@/components/ui/paper-curl-carousel"

// No `items` = 5 default Unsplash landscapes. Pass your own:
// items={[{ src: "...", title: "...", caption: "...", alt: "..." }, ...]}
// Image hosts must allow CORS (Unsplash, your own /public folder, data: URLs).
// Drag a sheet's edge, click a side, hover near an edge to peek, or use ←/→.
export default function PaperCurlCarouselDemo() {
  return <PaperCurlCarousel autoplay={4000} />
}
