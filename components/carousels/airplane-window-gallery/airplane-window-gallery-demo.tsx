"use client";

import * as React from "react";
import { AirplaneWindowGallery, airplaneWindowDefaultItems } from "@/components/ui/airplane-window-gallery";

// Simplest use: <AirplaneWindowGallery items={[{ src, title, location?, caption? }, ...]} className="max-w-[640px]" />
// (no `items` = 8 aerial destinations; `windows` 2-5; `autoplay` swaps views behind the shades).
//
// This demo plays a one-time guided tour: a shade swaps a destination, the
// visitor "flies" through window 12A, then returns - and it stops the moment
// they touch it.

const settings = {
  windows: 2,
  autoplay: true,
  interval: 2100,
  drift: 18,
  shadeDuration: 400,
};

type DemoProps = {
  windows?: number;
  autoplay?: boolean;
  interval?: number;
  drift?: number;
  shadeDuration?: number;
  /** Set false to explore the gallery without the one-time guided zoom. */
  tour?: boolean;
};

export default function AirplaneWindowGalleryDemo({ tour = true, ...props }: DemoProps = {}) {
  const s = { ...settings, ...props };
  const [activeWindow, setActiveWindow] = React.useState(null as number | null);
  const [reduced, setReduced] = React.useState(true);
  const [tourStopped, setTourStopped] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [replay, setReplay] = React.useState(0);
  const [step, setStep] = React.useState("reveal");
  const stopTour = () => setTourStopped(true);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    if (!tour || !s.autoplay || reduced || tourStopped || paused) return;
    const change = window.setTimeout(() => setStep("change"), s.interval);
    // Let the first replacement shade finish lifting before looking through that window.
    const lookAt = s.interval + s.shadeDuration * 2 + 200;
    const look = window.setTimeout(() => { setActiveWindow(0); setStep("lookout"); }, lookAt);
    // 650ms to fly out, then 2 seconds outside before the 480ms return.
    const back = window.setTimeout(() => { setActiveWindow(null); setStep("returned"); }, lookAt + 650 + 2000);
    return () => { window.clearTimeout(change); window.clearTimeout(look); window.clearTimeout(back); };
  }, [tour, s.autoplay, s.interval, s.shadeDuration, reduced, tourStopped, paused, replay]);

  const restart = () => {
    setActiveWindow(null);
    setStep("reveal");
    setTourStopped(false);
    setPaused(false);
    setReplay(replay + 1);
  };

  return (
    <main
      onPointerDownCapture={stopTour}
      onKeyDownCapture={stopTour}
      onFocusCapture={(event) => { if ((event.target as HTMLElement).matches("button, a")) stopTour(); }}
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background px-5 py-5 text-foreground"
    >
      <header className="text-center">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[.22em] text-muted-foreground">The window seat</p>
        <h1 className="text-2xl font-semibold tracking-tight">Airplane window gallery</h1>
        <p className="mt-1.5 text-xs text-muted-foreground">Lift the shade. Fly through the window. Return to your seat.</p>
      </header>
      <AirplaneWindowGallery
        key={replay}
        items={airplaneWindowDefaultItems}
        windows={s.windows}
        autoplay={s.autoplay && !paused}
        interval={s.interval}
        drift={paused ? 0 : s.drift}
        shadeDuration={s.shadeDuration}
        activeWindow={activeWindow}
        onActiveWindowChange={setActiveWindow}
        className="max-w-[640px]"
      />
      <div className="flex w-full max-w-[640px] flex-col items-center gap-2 text-center text-[11px] text-muted-foreground">
        <p>{activeWindow !== null ? "Click anywhere to sit back." : step === "change" && !tourStopped ? "A new destination, behind the same window." : step === "returned" ? "Back at your window seat. Fly out again." : "Click any window to look out."}</p>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={restart} className="rounded-sm text-foreground underline decoration-border underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Replay preview</button>
          {s.autoplay && !reduced && <button type="button" aria-pressed={paused} onClick={() => { setPaused(!paused); setTourStopped(true); }} className="rounded-sm underline decoration-border underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{paused ? "Resume motion" : "Pause motion"}</button>}
        </div>
      </div>
    </main>
  );
}
