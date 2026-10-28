"use client";

// Radial Wedge Gallery - a disc cut into pie slices, one photo per slice.
// Hovering or choosing a slice widens it (the others shrink) and the disc
// rotates so it sits at the top; the hub in the middle shows its title.
// Double-click / Enter / the hub opens the photo with an iris (circle) reveal.
// Hover, click, drag, scroll, ←/→, Home/End, Escape; opt-in autoplay.
//
// Needs React 19 (`ref` as a prop, `inert`) and a browser with container
// query units (cqw/cqh). Uses shadcn tokens incl. `chart-2`.
// Source: 21st.dev "radial-wedge-gallery".

import * as React from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RadialWedgeItem {
  id?: string;
  src: string;
  alt?: string;
  title: string;
  year?: string | number;
  discipline?: string;
}

type DivProps = React.ComponentProps<"div">;
export interface RadialWedgeGalleryProps extends DivProps {
  items?: RadialWedgeItem[];
  /** Zero-based index. null shows an evenly divided overview. */
  active?: number | null;
  defaultActive?: number | null;
  onActiveChange?: (index: number | null) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Opt-in only; the included demo owns its guided sequence. */
  autoplay?: boolean;
  interval?: number;
  hubTitle?: string;
  ref?: DivProps["ref"];
}

const photo = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format`;
export const radialWedgeDefaultItems: RadialWedgeItem[] = [
  { id: "01", title: "Quiet coast", discipline: "Landscape", year: "2026", src: photo("photo-1597860150045-3e4760e52ed5"), alt: "Coastal cliffs meeting a blue sea" },
  { id: "02", title: "Folded light", discipline: "Architecture", year: "2026", src: photo("photo-1487958449943-2429e8be8625"), alt: "Sculptural white architecture against the sky" },
  { id: "03", title: "Blue passage", discipline: "Color study", year: "2025", src: photo("photo-1569383746724-6f1b882b8f46"), alt: "Blue buildings climbing a hillside" },
  { id: "04", title: "Soft altitude", discipline: "Atmosphere", year: "2026", src: photo("photo-1504608524841-42fe6f032b4b"), alt: "Clouds and an open sky" },
  { id: "05", title: "Living lines", discipline: "Botanical", year: "2025", src: photo("photo-1531156992292-d36397ee9184"), alt: "Layers of green fern leaves" },
  { id: "06", title: "Warm season", discipline: "Color study", year: "2025", src: photo("photo-1473343775075-61805b64e5d6"), alt: "Warm autumn foliage" },
  { id: "07", title: "Open form", discipline: "Architecture", year: "2026", src: photo("photo-1488972685288-c3fd157d7c7a"), alt: "Overlapping diagonal lines of a modern building" },
  { id: "08", title: "Violet field", discipline: "Landscape", year: "2025", src: photo("photo-1600759487717-62bbb608106e"), alt: "Lavender flowers in a violet field" },
  { id: "09", title: "In bloom", discipline: "Botanical", year: "2026", src: photo("photo-1522383225653-ed111181a951"), alt: "Pink blossoms against a pale blue sky" },
];

const WEDGE_MS = 520;
const IRIS_MS = 600;
const IRIS_RETURN_MS = 240;
const ACTIVE_ANGLE = 140;
const radians = (angle: number) => angle * Math.PI / 180;
const wrap = (index: number, count: number) => ((index % count) + count) % count;
function validIndex(index: number | null, count: number) {
  return count && index !== null && Number.isFinite(index) ? wrap(Math.trunc(index), count) : null;
}
function anglesFor(count: number, active: number | null) {
  if (!count) return [];
  const wide = count === 1 ? 360 : Math.max(ACTIVE_ANGLE, 360 / count + 60);
  return Array.from({ length: count }, (_, index) => active === null ? 360 / count : index === active ? wide : (360 - wide) / (count - 1));
}
function wedgePath(start: number, angle: number, count: number) {
  const gap = count === 1 ? 0 : 0.55;
  const points = ["50% 50%"];
  for (let step = 0; step <= 64; step++) {
    const theta = radians(start + gap + (angle - gap * 2) * step / 64);
    points.push(`${(50 + Math.cos(theta) * 50).toFixed(4)}% ${(50 + Math.sin(theta) * 50).toFixed(4)}%`);
  }
  return `polygon(${points.join(",")})`;
}
function alignedRotation(angles: number[], active: number | null, previous: number) {
  if (active === null || !angles.length) return previous;
  const center = -90 - 180 / angles.length + angles.slice(0, active).reduce((a, b) => a + b, 0) + angles[active]! / 2;
  const wanted = -90 - center;
  return previous + wrap(wanted - previous + 180, 360) - 180;
}

export function RadialWedgeGallery({
  items = radialWedgeDefaultItems, active, defaultActive = null, onActiveChange, expanded, onExpandedChange,
  autoplay = false, interval = 3000, hubTitle = "Selected works", className, style, ref,
  onKeyDown, onPointerDown, onPointerMove, onPointerUp, ...rest
}: RadialWedgeGalleryProps) {
  const count = items.length;
  const [localActive, setLocalActive] = React.useState(defaultActive);
  const selected = validIndex(active === undefined ? localActive : active, count);
  const [localExpanded, setLocalExpanded] = React.useState(false);
  const isExpanded = (expanded ?? localExpanded) && selected !== null;
  const [reduced, setReduced] = React.useState(false);
  const [stopped, setStopped] = React.useState(false);
  const root = React.useRef(null as HTMLDivElement | null);
  const wheel = React.useRef(null as HTMLDivElement | null);
  const buttons = React.useRef([] as (HTMLButtonElement | null)[]);
  const pictures = React.useRef([] as (HTMLImageElement | null)[]);
  const numbers = React.useRef([] as (HTMLSpanElement | null)[]);
  const closeButton = React.useRef(null as HTMLButtonElement | null);
  const hadExpanded = React.useRef(false);
  const movingFocus = React.useRef(false);
  const drag = React.useRef(null as { x: number; y: number; moved: boolean } | null);
  const suppressClick = React.useRef(false);
  const hoverPoint = React.useRef({ x: -1000, y: -1000 });
  const lastWheel = React.useRef(-Infinity);
  const initialAngles = anglesFor(count, selected);
  const geometry = React.useRef({ angles: initialAngles, rotation: alignedRotation(initialAngles, selected, 0) });
  const initial = React.useRef(geometry.current);
  const instructions = React.useId();
  const item = selected === null ? undefined : items[selected];
  const latest = React.useRef({ selected, active, expanded, isExpanded, count, onActiveChange, onExpandedChange });
  React.useLayoutEffect(() => {
    latest.current = { selected, active, expanded, isExpanded, count, onActiveChange, onExpandedChange };
  });

  function choose(index: number) {
    const state = latest.current;
    if (!state.count || state.isExpanded) return;
    const next = wrap(index, state.count);
    setStopped(true);
    if (next === state.selected) return;
    if (state.active === undefined) setLocalActive(next);
    state.onActiveChange?.(next);
  }
  function step(direction: number, focus = false) {
    const state = latest.current;
    if (!state.count || state.isExpanded) return;
    const next = wrap((state.selected ?? (direction > 0 ? -1 : 0)) + direction, state.count);
    choose(next);
    if (focus) focusWedge(next);
  }
  function focusWedge(index: number) {
    movingFocus.current = true;
    buttons.current[index]?.focus({ preventScroll: true });
    movingFocus.current = false;
  }
  function openImage(next: boolean) {
    const state = latest.current;
    if (state.selected === null || next === state.isExpanded) return;
    setStopped(true);
    if (state.expanded === undefined) setLocalExpanded(next);
    state.onExpandedChange?.(next);
  }

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const targetAngles = anglesFor(count, selected);
    const from = geometry.current.angles.length === count ? geometry.current : { angles: anglesFor(count, null), rotation: 0 };
    const targetRotation = alignedRotation(targetAngles, selected, from.rotation);
    let frame = 0;
    const paint = (angles: number[], rotation: number) => {
      geometry.current = { angles, rotation };
      if (wheel.current) {
        wheel.current.style.transform = `rotate(${rotation}deg)`;
        wheel.current.dataset.rotation = rotation.toFixed(4);
      }
      let start = -90 - 180 / Math.max(1, count);
      angles.forEach((angle, index) => {
        const button = buttons.current[index];
        const picture = pictures.current[index];
        const label = numbers.current[index];
        const center = start + angle / 2;
        if (button) {
          button.style.clipPath = wedgePath(start, angle, count);
          button.dataset.angle = angle.toFixed(4);
          button.dataset.center = center.toFixed(4);
        }
        if (picture) {
          const clarity = selected === null ? 0.85 : 0.62 + Math.max(0, Math.min(1, (angle - 360 / count) / Math.max(1, ACTIVE_ANGLE - 360 / count))) * 0.38;
          picture.style.opacity = String(clarity);
          picture.style.transform = `translate(${Math.cos(radians(center)) * 2.4}%, ${Math.sin(radians(center)) * 2.4}%) rotate(${-rotation}deg) scale(1.08)`;
        }
        if (label) {
          label.style.left = `${50 + Math.cos(radians(center)) * 42}%`;
          label.style.top = `${50 + Math.sin(radians(center)) * 42}%`;
          label.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
        }
        start += angle;
      });
    };
    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(targetAngles, targetRotation);
      return;
    }
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / WEDGE_MS);
      const ease = 1 - Math.pow(1 - progress, 3);
      paint(targetAngles.map((angle, index) => from.angles[index]! + (angle - from.angles[index]!) * ease), from.rotation + (targetRotation - from.rotation) * ease);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [selected, count, reduced]);

  React.useEffect(() => {
    const node = root.current;
    if (!node) return;
    const handleWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 4 || !latest.current.count) return;
      event.preventDefault();
      if (performance.now() - lastWheel.current < WEDGE_MS) return;
      lastWheel.current = performance.now();
      step(delta > 0 ? 1 : -1);
    };
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!autoplay || stopped || reduced || isExpanded || count < 2) return;
    const timer = window.setInterval(() => {
      const state = latest.current;
      const next = wrap((state.selected ?? -1) + 1, state.count);
      if (state.active === undefined) setLocalActive(next);
      state.onActiveChange?.(next);
    }, Math.max(1000, interval));
    return () => window.clearInterval(timer);
  }, [autoplay, interval, stopped, reduced, isExpanded, count]);

  React.useEffect(() => {
    if (isExpanded) closeButton.current?.focus({ preventScroll: true });
    else if (hadExpanded.current && selected !== null) buttons.current[selected]?.focus({ preventScroll: true });
    hadExpanded.current = isExpanded;
  }, [isExpanded, selected]);

  let initialStart = -90 - 180 / Math.max(1, count);
  return (
    <div
      {...rest}
      ref={(node) => { root.current = node; if (typeof ref === "function") return ref(node); if (ref) ref.current = node; }}
      data-slot="radial-wedge-gallery" data-active={selected ?? "none"} data-expanded={isExpanded}
      data-autoplay={autoplay && !stopped && !reduced ? "on" : "off"} data-reduced={reduced}
      role="region" aria-label={rest["aria-label"] ?? "Radial image gallery"} aria-describedby={instructions}
      className={cn("relative isolate w-full overflow-hidden rounded-3xl border border-border bg-card text-card-foreground", className)}
      style={{ aspectRatio: "1 / 1", containerType: "size", ...style }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape") { event.preventDefault(); openImage(false); }
        else if (!isExpanded && ["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          if (event.key === "Home" || event.key === "End") {
            const next = event.key === "Home" ? 0 : count - 1;
            choose(next); focusWedge(next);
          } else step(event.key === "ArrowRight" ? 1 : -1, true);
        } else if (event.key === "Enter" && (event.target as HTMLElement).closest("[data-radial-wedge]")) {
          event.preventDefault(); openImage(true);
        }
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || event.button !== 0 || isExpanded || !(event.target as HTMLElement).closest("[data-radial-wheel]")) return;
        drag.current = { x: event.clientX, y: event.clientY, moved: false };
        suppressClick.current = false;
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (event.defaultPrevented || isExpanded) return;
        if (drag.current) {
          if (Math.hypot(event.clientX - drag.current.x, event.clientY - drag.current.y) > 24) {
            drag.current.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          return;
        }
        if (event.pointerType !== "mouse" || Math.hypot(event.clientX - hoverPoint.current.x, event.clientY - hoverPoint.current.y) < 8) return;
        hoverPoint.current = { x: event.clientX, y: event.clientY };
        const target = (event.target as HTMLElement).closest("[data-radial-wedge]") as HTMLElement | null;
        if (target) choose(Number(target.dataset.radialWedge));
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        const gesture = drag.current;
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (!gesture?.moved || event.defaultPrevented) return;
        suppressClick.current = true;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        step(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : -1) : (dy > 0 ? 1 : -1));
      }}
      onPointerCancel={() => { drag.current = null; }}
    >
      <style>{`[data-slot="radial-wedge-gallery"] [data-radial-iris] { transition-property: clip-path; transition-timing-function: cubic-bezier(.22,.8,.2,1); } @media (prefers-reduced-motion: reduce) { [data-slot="radial-wedge-gallery"] [data-radial-iris] { transition-duration: 0ms !important; } }`}</style>
      <div aria-hidden className="pointer-events-none absolute inset-x-5 top-4 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>Index / {String(count).padStart(2, "0")}</span><span>{item ? "Selected study" : "A circle of perspectives"}</span>
      </div>
      {count ? <>
        <div data-radial-disc className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: "min(85cqw, 85cqh)", aspectRatio: "1 / 1" }} inert={isExpanded}>
          <div aria-hidden className="pointer-events-none absolute -inset-[2.2%] rounded-full border border-border" />
          <span aria-hidden className="absolute -top-[4%] left-1/2 h-2 w-px -translate-x-1/2 bg-foreground/70" />
          <div data-radial-wheel ref={wheel} className="absolute inset-0 rounded-full bg-background" style={{ transform: `rotate(${initial.current.rotation}deg)`, touchAction: "none" }}>
            {items.map((entry, index) => {
              const angle = initial.current.angles[index] ?? 360 / count;
              const start = initialStart;
              initialStart += angle;
              const center = start + angle / 2;
              return <button key={entry.id ?? index} ref={(node) => { buttons.current[index] = node; }}
                type="button" data-radial-wedge={index} data-angle={angle} data-center={center}
                aria-label={`${index + 1} of ${count}: ${entry.title}`} aria-pressed={selected === index}
                tabIndex={index === (selected ?? 0) ? 0 : -1}
                className="group absolute inset-0 cursor-grab bg-muted outline-none active:cursor-grabbing"
                style={{ clipPath: wedgePath(start, angle, count) }}
                onFocus={() => { if (!movingFocus.current) choose(index); }}
                onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } choose(index); }}
                onDoubleClick={() => { if (!suppressClick.current) openImage(true); }}
              >
                <img ref={(node) => { pictures.current[index] = node; }} src={entry.src} alt={entry.alt ?? entry.title}
                  draggable={false} decoding="sync" className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                  style={{ opacity: 0.85, transform: `rotate(${-initial.current.rotation}deg) scale(1.08)` }} />
                <span className="pointer-events-none absolute inset-0 bg-ring/25 opacity-0 group-focus-visible:opacity-100" />
                <span ref={(node) => { numbers.current[index] = node; }} aria-hidden data-radial-accent={selected === index ? "index" : undefined}
                  className={`pointer-events-none absolute flex h-6 w-6 items-center justify-center rounded-full font-mono text-[9px] text-foreground group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background ${selected === index ? "bg-background ring-2 ring-chart-2" : "bg-background/85 ring-1 ring-border"}`}
                  style={{ left: `${50 + Math.cos(radians(center)) * 42}%`, top: `${50 + Math.sin(radians(center)) * 42}%`, transform: `translate(-50%, -50%) rotate(${-initial.current.rotation}deg)` }}
                >{String(index + 1).padStart(2, "0")}</span>
              </button>;
            })}
          </div>
          <button type="button" data-radial-hub disabled={!item} onClick={() => openImage(true)} aria-label={item ? `Open ${item.title}` : hubTitle}
            className="absolute left-1/2 top-1/2 flex aspect-square w-[32%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border-[5px] border-card bg-background px-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default">
            <span className="flex items-center gap-1.5 font-mono text-[clamp(9px,1.4cqw,13px)] tracking-wider text-muted-foreground">{item && <span data-radial-accent="hub" aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-chart-2" />}{selected === null ? `${count} STUDIES` : `${String(selected + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`}</span>
            <span className="max-w-full text-balance text-[clamp(12px,2.5cqw,26px)] leading-tight font-medium tracking-tight">{item?.title ?? hubTitle}</span>
            <span className="max-w-full truncate text-[clamp(8px,1.2cqw,12px)] text-muted-foreground">{item ? [item.discipline, item.year].filter(Boolean).join(" · ") : "Hover to discover"}</span>
            {item && <ArrowUpRight aria-hidden className="mt-0.5 h-3 w-3" />}
          </button>
        </div>
        <div className="absolute inset-x-5 bottom-3 flex items-center justify-between" inert={isExpanded}>
          <span className="text-[10px] text-muted-foreground">Scroll or drag to rotate</span>
          <div className="flex gap-1.5">
            <button type="button" aria-label="Previous image" onClick={() => step(-1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft aria-hidden className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label="Next image" onClick={() => step(1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><ArrowRight aria-hidden className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </> : <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No images yet</p>}
      <div data-radial-iris data-open={isExpanded} aria-hidden={!isExpanded} inert={!isExpanded}
        className="absolute inset-0 z-20 overflow-hidden bg-background"
        style={{ clipPath: isExpanded ? "circle(75% at 50% 50%)" : "circle(0% at 50% 50%)", transitionDuration: `${reduced ? 0 : isExpanded ? IRIS_MS : IRIS_RETURN_MS}ms` }}>
        {item && <>
          <button type="button" aria-label={`Return from ${item.title}`} className="absolute inset-0 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring" onClick={() => openImage(false)}>
            <img src={item.src} alt={item.alt ?? item.title} draggable={false} className="h-full w-full object-cover" />
          </button>
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl border border-border bg-background/95 px-4 py-3 text-foreground">
            <div><p className="text-lg font-medium tracking-tight">{item.title}</p><p className="text-xs text-muted-foreground">{[item.discipline, item.year].filter(Boolean).join(" · ")}</p></div>
            <span className="font-mono text-xs text-muted-foreground">{String(selected! + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
          </div>
        </>}
        <button ref={closeButton} type="button" aria-label="Return to circle" onClick={() => openImage(false)} className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"><X aria-hidden className="h-3.5 w-3.5" />Return</button>
      </div>
      <p id={instructions} className="sr-only">Hover, focus or click a slice to select. Use Left and Right arrows, scroll, or drag to rotate. Enter or double click opens an image. Click the image or press Escape to return.</p>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{item ? `${selected! + 1} of ${count}. ${item.title}. ${isExpanded ? "Full image." : "Selected."}` : `${count} images. ${hubTitle}.`}</span>
    </div>
  );
}

export default RadialWedgeGallery;
