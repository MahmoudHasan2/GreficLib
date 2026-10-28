"use client";

import * as React from "react";
import { ElevatorDoorsGallery, elevatorDefaultItems } from "@/components/ui/elevator-doors-gallery";

// Simplest use: <ElevatorDoorsGallery items={[{ src, title, caption?, floor? }, ...]} />
// (no `items` = a six-floor hotel; `labels` translates the UI text, e.g. to Arabic).
//
// This demo is a hotel showcase with a short guided tour: it rides up one
// floor, steps inside, comes back out - and stops the moment the visitor touches it.
export default function ElevatorDoorsGalleryDemo({ autoplay = true }: { autoplay?: boolean }) {
  const [floor, setFloor] = React.useState(0);
  const [inside, setInside] = React.useState(false);
  const [replay, setReplay] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [complete, setComplete] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    if (!autoplay || paused || complete || reduced) return;
    const enter = window.setTimeout(() => setInside(true), 4000);
    const leave = window.setTimeout(() => { setInside(false); setComplete(true); }, 6200);
    return () => { window.clearTimeout(enter); window.clearTimeout(leave); };
  }, [autoplay, paused, complete, reduced, replay]);

  const restart = () => {
    setFloor(0); setInside(false); setPaused(false); setComplete(false);
    setReplay((value) => value + 1);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background px-5 py-3 text-foreground">
      <div className="w-full max-w-[560px]">
        <header className="mb-3 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Every floor, a different scene</p>
            <h2 className="text-[clamp(21px,3.4vw,27px)] font-medium leading-tight tracking-tight">Hotel elevator gallery</h2>
          </div>
          <button
            type="button"
            onClick={restart}
            className="mb-0.5 flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 10a9 9 0 1 1 2.6 8.4M3 4v6h6" /></svg>
            Replay
          </button>
        </header>
        <ElevatorDoorsGallery
          key={replay}
          items={elevatorDefaultItems}
          floor={floor}
          onFloorChange={setFloor}
          inside={inside}
          onInsideChange={setInside}
          autoplay={autoplay && !paused && !complete && !reduced}
          initialDelay={1400}
          interval={20000}
          onPointerDownCapture={() => setPaused(true)}
          onKeyDownCapture={(event) => {
            if (["ArrowUp", "ArrowDown", "Home", "End", "Enter", " ", "Escape"].includes(event.key)) setPaused(true);
          }}
        />
        <footer className="mt-2 flex items-center justify-between gap-3 px-1 text-[10px] text-muted-foreground">
          <p>Six floors. Pick one, then step inside.<span className="ml-2 opacity-60">Demo</span></p>
          {autoplay && <button
            type="button"
            aria-pressed={paused || complete}
            onClick={() => { if (paused || complete) restart(); else setPaused(true); }}
            className="shrink-0 rounded px-1 py-1 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hidden"
          >
            {complete ? "Replay tour" : paused ? "Resume tour" : "Pause tour"}
          </button>}
        </footer>
      </div>
    </div>
  );
}
