"use client";

import * as React from "react";
import { Pause, RotateCcw } from "lucide-react";
import { FerrisWheelGallery, ferrisWheelDefaultItems } from "@/components/ui/ferris-wheel-gallery";

// Simplest use: <FerrisWheelGallery items={[{ src, alt, title, discipline?, year? }, ...]} />
// (no `items` = 8 default Unsplash landscapes; add `autoplay` to rotate on its own).
//
// This demo is a "portfolio section" with a short guided tour: the wheel turns
// to a few items by itself, and stops the moment the visitor touches it.

const DEMO_TOUR = [
  { at: 600, index: 4 },
  { at: 3900, index: 5 },
  { at: 5400, index: 3 },
];

export default function FerrisWheelGalleryDemo({ autoplay = true }: { autoplay?: boolean }) {
  const [active, setActive] = React.useState(0);
  const [playing, setPlaying] = React.useState(autoplay);
  const [run, setRun] = React.useState(0);
  const [reducedMotion, setReducedMotion] = React.useState(true);
  const [photosReady, setPhotosReady] = React.useState(false);
  React.useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  // Wait for the photos (max 1.5s) so the tour does not turn through empty frames.
  React.useEffect(() => {
    let cancelled = false;
    const arrive = (src: string) => new Promise((resolve) => {
      const image = new Image();
      image.onload = image.onerror = () => resolve(src);
      image.src = src;
    });
    const limit = new Promise((resolve) => window.setTimeout(resolve, 1500));
    Promise.race([Promise.all(ferrisWheelDefaultItems.map((item) => arrive(item.src))), limit]).then(() => { if (!cancelled) setPhotosReady(true); });
    return () => { cancelled = true; };
  }, []);
  React.useLayoutEffect(() => {
    if (!playing || reducedMotion || !autoplay || !photosReady) return;
    const timers = DEMO_TOUR.map(({ at, index }) => window.setTimeout(() => setActive(index), at));
    timers.push(window.setTimeout(() => setPlaying(false), 7200));
    return () => timers.forEach(window.clearTimeout);
  }, [playing, run, reducedMotion, autoplay, photosReady]);
  const stop = (target: EventTarget) => {
    if (!(target instanceof Element) || !target.closest("[data-demo-control]")) setPlaying(false);
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-5 py-4 text-foreground" onPointerDownCapture={(event) => stop(event.target)} onWheelCapture={(event) => stop(event.target)} onKeyDownCapture={(event) => stop(event.target)} onFocusCapture={(event) => stop(event.target)}>
      <div className="w-full max-w-[720px]">
        <header className="mb-3 flex items-end justify-between gap-4 border-b border-border pb-3">
          <div><p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">A collection in motion</p><h1 className="text-2xl font-medium tracking-tight">Round &amp; round.</h1></div>
          <span className="mb-0.5 rounded-full border border-border px-2.5 py-1 text-[10px] tracking-wide text-muted-foreground">Sample collection</span>
        </header>
        <FerrisWheelGallery key={run} items={ferrisWheelDefaultItems} active={active} onActiveChange={(index) => { setPlaying(false); setActive(index); }} />
        <footer className="mt-2 flex min-h-8 items-center justify-between gap-3 text-[10px] text-muted-foreground">
          <span>Eight studies. A different point of view.</span>
          {autoplay && !reducedMotion && <button data-demo-control type="button" onClick={() => { if (playing) setPlaying(false); else { setActive(0); setRun((value) => value + 1); setPlaying(true); } }} className="flex min-h-8 items-center gap-1.5 rounded-md px-1 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">{playing ? <Pause aria-hidden="true" className="size-3" /> : <RotateCcw aria-hidden="true" className="size-3" />}{playing ? "Pause demo" : "Replay demo"}</button>}
        </footer>
      </div>
    </div>
  );
}
