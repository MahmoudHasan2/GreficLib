"use client";

import { DyeWhorl } from "@/components/ui/dye-whorl";

// As a hero: the ink tank fills the section, content sits on top.
// Colours follow the theme (--background / --foreground / --border / --muted-foreground).
export default function DyeWhorlDemo() {
  return (
    <DyeWhorl className="h-screen">
      <div className="flex h-full items-center justify-center px-6">
        {/* soft frosted panel keeps the text readable over dense ink */}
        <div className="flex flex-col items-center rounded-3xl bg-background/60 px-8 py-12 text-center backdrop-blur-md md:px-14">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Dye Works Studio
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-7xl">
          Ideas that spread like ink
        </h1>
        <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
          Move your cursor through the water and watch it stir.
        </p>
        <a
          href="#"
          className="mt-10 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Start a project
        </a>
        </div>
      </div>
    </DyeWhorl>
  );
}
