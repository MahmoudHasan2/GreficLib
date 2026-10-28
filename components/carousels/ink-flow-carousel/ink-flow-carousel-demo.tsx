"use client"

import { InkFlowCarousel } from "@/components/ui/ink-flow-carousel"

// No `items` = 5 default Unsplash landscapes. Pass your own:
// items={[{ src: "...", title: "...", caption: "...", alt: "..." }, ...]}
// Image hosts must allow CORS (Unsplash, your own /public folder, data: URLs).
export default function InkFlowCarouselDemo() {
  return <InkFlowCarousel autoplay={4000} />
}
