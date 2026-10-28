"use client";

import { DiagonalMarquee } from "@/components/ui/diagonal-marquee";

// As a hero background: the marquee fills the section, content sits on top.
export default function DiagonalMarqueeDemo() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-white dark:bg-neutral-950">
      <DiagonalMarquee className="absolute inset-0 h-full" />

      <div className="pointer-events-none relative z-20 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-6xl">
          Explore the world
        </h1>
        <p className="mt-4 max-w-md text-lg text-white/90 drop-shadow">
          Landscapes that keep moving.
        </p>
      </div>
    </section>
  );
}
