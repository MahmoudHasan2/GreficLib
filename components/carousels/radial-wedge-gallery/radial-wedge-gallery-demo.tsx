"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { RadialWedgeGallery, radialWedgeDefaultItems } from "@/components/ui/radial-wedge-gallery";

// Simplest use: <RadialWedgeGallery items={[{ src, title, alt?, discipline?, year? }, ...]} className="max-w-xl" />
// (square by default; no `items` = 9 default Unsplash photos; `autoplay` to rotate on its own).
//
// This demo fills the viewport and plays a short guided loop - select three
// slices, open one, close it - and hands over the moment the visitor touches it.
export default function RadialWedgeGalleryDemo({ autoplay = true, interval = 9000 }: { autoplay?: boolean; interval?: number }) {
  const [active, setActive] = React.useState(null as number | null);
  const [expanded, setExpanded] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const [replay, setReplay] = React.useState(0);
  const playing = autoplay && !paused && !reduced;
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  // Anchor the short preview to its first committed frame, including under load.
  React.useLayoutEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timers: number[] = [];
    const cycle = () => {
      setActive(null); setExpanded(false);
      timers = [
        window.setTimeout(() => setActive(1), 800),
        window.setTimeout(() => setActive(4), 2400),
        window.setTimeout(() => setActive(6), 4000),
        window.setTimeout(() => setExpanded(true), 5400),
        window.setTimeout(() => setExpanded(false), 6600),
      ];
    };
    cycle();
    const loop = window.setInterval(cycle, Math.max(7400, interval));
    return () => { timers.forEach(window.clearTimeout); window.clearInterval(loop); };
  }, [playing, replay, interval]);
  const restart = () => { setActive(null); setExpanded(false); setPaused(false); setReplay((value) => value + 1); };
  return <main className="mx-auto flex h-svh min-h-[360px] w-full max-w-[1100px] flex-col gap-4 overflow-hidden bg-background px-5 py-5 text-foreground sm:px-8 sm:py-6">
    <header className="flex shrink-0 items-center justify-between gap-4">
      <div><p className="mb-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">Nine frames. One circle.</p><h1 className="text-2xl leading-tight font-medium tracking-tight">Radial image gallery</h1></div>
      <span className="shrink-0 rounded-full border border-border px-2.5 py-1 font-mono text-[9px] tracking-wide text-muted-foreground">SAMPLE / 26</span>
    </header>
    <RadialWedgeGallery items={radialWedgeDefaultItems} active={active} expanded={expanded} hubTitle="Different angles"
      onActiveChange={(index) => { setPaused(true); setActive(index); }}
      onExpandedChange={(next) => { setPaused(true); setExpanded(next); }}
      className="min-h-0 flex-1" style={{ aspectRatio: "auto" }} />
    <footer className="flex h-9 shrink-0 items-center justify-between gap-3">
      <p className="max-w-[65%] text-[11px] leading-relaxed text-muted-foreground">{expanded ? "One frame, beyond the circle. Click to return." : active === null ? "Hover a slice. Find another perspective." : "A wider angle. Double-click or Enter to open."}</p>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" aria-label={playing ? "Pause demo" : "Play demo"} aria-pressed={!playing} disabled={!autoplay || reduced} onClick={() => setPaused((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40">{playing ? <Pause aria-hidden className="h-3 w-3" /> : <Play aria-hidden className="h-3 w-3" />}</button>
        <button type="button" aria-label="Replay demo" onClick={restart} className="flex h-8 w-8 items-center justify-center rounded-full border border-border outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><RotateCcw aria-hidden className="h-3 w-3" /></button>
      </div>
    </footer>
  </main>;
}
