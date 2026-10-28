"use client";

import { ScrollGallery } from "@/components/ui/scroll-gallery";

// The gallery pins itself while the page scrolls, so put it straight in the
// page flow - NOT inside a fixed-height box (the pin spacer would overlap
// whatever comes after). No `slides` = four Unsplash architecture/landscape shots.
// Pass your own: slides={[{ title, image, url?, linkLabel? }, ...]}
export default function ScrollGalleryDemo() {
  return (
    <main className="bg-black text-white">
      <section className="flex h-svh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Selected work</p>
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">Scroll down</h1>
      </section>

      <ScrollGallery variant="studio" />

      <section className="flex h-svh items-center justify-center px-6 text-center">
        <p className="text-2xl text-white/70">The page carries on after the gallery.</p>
      </section>
    </main>
  );
}
