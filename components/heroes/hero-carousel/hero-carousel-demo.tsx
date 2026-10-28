"use client"

import { HeroCarousel } from "@/components/ui/hero-carousel"

// Give it a height: it fills its parent (h-full, min 24rem).
// No `items` = nine Unsplash artworks with event-style meta. Each item:
// { title: "Two\nLines", image, credit?, meta?: string[], accent?: "#hex" }
// `accent` is the hue the whole background is re-graded to when that card is focused.
export default function HeroCarouselDemo() {
  return (
    <div className="h-svh">
      <HeroCarousel
        defaultIndex={4}
        brand="MONTRA"
        onBack={() => {}}
        onMenu={() => {}}
      />
    </div>
  )
}
