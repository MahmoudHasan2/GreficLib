"use client";

// Airplane Window Gallery - a cabin wall with 2-5 oval airplane windows, each
// showing a destination (title + location under it, seat number above). The
// views drift slowly as if flying; with autoplay a shade drops and lifts on a
// new destination. Click a window to fly through it - the view zooms out of the
// oval to fill the card - and click / Escape / "Sit back" to return.
//
// Needs React 19 (`ref` as a prop) and container query units (cqw/cqh).
// Source: 21st.dev "airplane-window-gallery" by CCgather (https://ccgather.com).

import * as React from "react";
import { cn } from "@/lib/utils";

export interface WindowItem {
  src: string;
  alt?: string;
  /** Place shown under the window, e.g. "Mount Fuji". */
  title?: string;
  /** Second line under the place, e.g. the country. */
  location?: string;
  caption?: string;
}

type GalleryDivProps = React.ComponentProps<"div">;

export interface AirplaneWindowGalleryProps extends GalleryDivProps {
  onChange?: never;
  items?: WindowItem[];
  /** How many cabin windows sit in the wall, 2–5. */
  windows?: number;
  /** Milliseconds between destination changes. One shade drops and lifts on a new view each time. */
  interval?: number;
  /** Opt-in destination changes. The demo enables this; reusable instances default off. */
  autoplay?: boolean;
  /** Seconds for the view to drift once across a window. 0 keeps it still. */
  drift?: number;
  /** Milliseconds for a shade to travel. */
  shadeDuration?: number;
  /** Row number printed under the first window. */
  firstRow?: number;
  /** Called with the item index when someone looks out of a window, and with null when they sit back. */
  onLookOut?: (index: number | null) => void;
  /** React 19 passes `ref` as a regular prop. */
  ref?: GalleryDivProps["ref"];
  /** Controlled cabin-window index (not item index). Omit for normal click-to-open behavior. */
  activeWindow?: number | null;
  /** Requests a controlled window change after a click, Escape, or Sit back. */
  onActiveWindowChange?: (index: number | null) => void;
}

const VIEWS = [
  { id: "photo-1523632117739-12cc7fa95ad0", title: "South Malé Atoll", location: "Maldives", caption: "A sandbar curls through turquoise shallows." },
  { id: "photo-1636110330362-6f04cde3f1e4", title: "Mount Fuji", location: "Japan", caption: "The summit rises clean above the clouds." },
  { id: "photo-1615551043360-33de8b5f410c", title: "Grand Canyon", location: "United States", caption: "Layers of red rock and a winding river." },
  { id: "photo-1681407979901-566ba5099a0e", title: "Swiss Alps", location: "Switzerland", caption: "Snowy peaks seen from cruising altitude." },
  { id: "photo-1489516408517-0c0a15662682", title: "Dubai", location: "United Arab Emirates", caption: "The Palm and its crescent from above." },
  { id: "photo-1552561618-4fe029f7858a", title: "Glacial rivers", location: "Iceland", caption: "Meltwater braids across the valley floor." },
  { id: "photo-1789758612733-756075c4fb4c", title: "Great Barrier Reef", location: "Australia", caption: "Coral reefs scattered through clear blue water." },
  { id: "photo-1523374228107-6e44bd2b524e", title: "New York", location: "United States", caption: "The city lights up after dark." },
];

/** Eight aerial destinations (Unsplash). */
export const airplaneWindowDefaultItems: WindowItem[] = VIEWS.map(({ id, title, location, caption }) => ({
  src: `https://images.unsplash.com/${id}?w=900&h=920&fit=crop&q=80&auto=format`,
  alt: `${title}, ${location}`,
  title,
  location,
  caption,
}));

const WINDOW_ASPECT = 0.72;
const LABEL_SPACE_PX = 80;
const VIEW_SCALE = 1.35;
const OPEN_AT = 0.09;
const START_SHADE = 0.55;
const FLIGHT_EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";

function Glass({
  item,
  shade,
  shadeMs,
  viewRef,
}: {
  item: WindowItem | undefined;
  shade: number;
  shadeMs: number;
  viewRef?: (node: HTMLImageElement | null) => void;
}) {
  const [loadedSrc, setLoadedSrc] = React.useState(null as string | null);
  const img = React.useRef(null as HTMLImageElement | null);
  const loaded = item !== undefined && loadedSrc === item.src;
  // An image that finished loading before hydration never fires React's onLoad
  // and would stay invisible (opacity 0). Check it directly.
  React.useLayoutEffect(() => {
    const node = img.current;
    if (node && item && node.complete && node.naturalWidth > 0) setLoadedSrc(item.src);
  }, [item]);
  return (
    <span data-glass className="absolute inset-[7.5%] overflow-hidden rounded-[44%/32%] bg-muted shadow-inner shadow-foreground/35 dark:bg-accent">
      {item && (
        <img
          ref={(node) => {
            img.current = node;
            viewRef?.(node);
          }}
          src={item.src}
          alt={item.alt ?? item.title ?? ""}
          data-view
          draggable={false}
          onLoad={(event) => setLoadedSrc(event.currentTarget.getAttribute("src"))}
          className="absolute inset-y-0 left-0 h-full max-w-none object-cover transition-opacity duration-500"
          style={{ width: `${VIEW_SCALE * 100}%`, opacity: loaded ? 1 : 0 }}
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/30 via-background/5 to-foreground/20 dark:from-foreground/30 dark:via-foreground/5 dark:to-background/20"
      />
      <span
        aria-hidden
        data-shade
        className="absolute inset-x-0 top-0 h-full ease-[cubic-bezier(0.45,0,0.2,1)]"
        style={{
          transform: `translateY(${-(1 - OPEN_AT) * (1 - shade) * 100}%)`,
          transitionProperty: "transform",
          transitionDuration: `${shadeMs}ms`,
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-b from-muted via-border to-muted dark:from-foreground dark:via-primary dark:to-primary" />
        <span className="absolute inset-x-0 bottom-0 h-[9%] bg-gradient-to-b from-border to-muted-foreground/40 shadow-sm shadow-foreground/25 dark:from-primary dark:to-primary/80">
          <span className="absolute left-1/2 top-1/2 h-[34%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25 dark:bg-primary-foreground/25" />
        </span>
      </span>
    </span>
  );
}

export function AirplaneWindowGallery({
  items = airplaneWindowDefaultItems,
  windows = 2,
  interval = 3200,
  autoplay = false,
  drift = 18,
  shadeDuration = 650,
  firstRow = 12,
  onLookOut,
  activeWindow,
  onActiveWindowChange,
  ref,
  className,
  style,
  ...rest
}: AirplaneWindowGalleryProps) {
  const count = Math.max(2, Math.min(5, Math.round(windows)));
  const total = items.length;
  const [slots, setSlots] = React.useState(() => Array.from({ length: count }, (_, k) => (total > 0 ? k % total : 0)));
  const [shades, setShades] = React.useState(() => Array.from({ length: count }, () => START_SHADE));
  const [localLookingAt, setLookingAt] = React.useState(null as number | null);
  const requestedWindow = activeWindow === undefined ? localLookingAt : activeWindow !== null && Number.isInteger(activeWindow) && activeWindow >= 0 && activeWindow < count ? activeWindow : null;
  // Retain the scene while a controlled null plays the journey back to the seat.
  const [retainedWindow, setRetainedWindow] = React.useState(requestedWindow);
  const lookingAt = requestedWindow ?? retainedWindow;
  const [flight, setFlight] = React.useState("entering");
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const cursor = React.useRef(count);
  const slotsRef = React.useRef(slots);
  React.useLayoutEffect(() => {
    slotsRef.current = slots;
  });
  const turn = React.useRef(0);
  const windowRefs = React.useRef([] as (HTMLButtonElement | null)[]);
  const viewRefs = React.useRef([] as (HTMLImageElement | null)[]);
  const lookRef = React.useRef(null as HTMLDivElement | null);
  const lookViewRef = React.useRef(null as HTMLImageElement | null);
  const maskRef = React.useRef(null as HTMLDivElement | null);
  const captionRef = React.useRef(null as HTMLDivElement | null);
  const animations = React.useRef([] as Animation[]);
  const frameFlight = React.useRef(null as Animation | null);
  const finishReturn = React.useRef(null as (() => void) | null);
  const closing = React.useRef(false);
  const shadeMs = reducedMotion ? 0 : shadeDuration;

  React.useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);
    return () => motion.removeEventListener("change", onMotion);
  }, []);

  React.useEffect(() => {
    setSlots(Array.from({ length: count }, (_, k) => (total > 0 ? k % total : 0)));
    setShades(Array.from({ length: count }, () => START_SHADE));
    cursor.current = count;
    turn.current = 0;
    const timers = Array.from({ length: count }, (_, k) =>
      window.setTimeout(() => setShades((prev) => prev.map((value, i) => (i === k ? 0 : value))), 150 + k * 170),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [count, total]);

  React.useEffect(() => {
    for (const item of items) {
      const image = new Image();
      image.decoding = "async";
      image.src = item.src;
    }
  }, [items]);

  React.useEffect(() => {
    if (!autoplay || reducedMotion || lookingAt !== null || total <= count) return;
    const timers: number[] = [];
    const cycle = window.setInterval(() => {
      const k = turn.current % count;
      turn.current += 1;
      setShades((prev) => prev.map((value, i) => (i === k ? 1 : value)));
      timers.push(
        window.setTimeout(() => {
          const showing = slotsRef.current;
          let next = cursor.current % total;
          for (let guard = 0; guard < total && showing.includes(next); guard++) next = (next + 1) % total;
          cursor.current = next + 1;
          setSlots((prev) => prev.map((value, i) => (i === k ? next : value)));
          timers.push(window.setTimeout(() => setShades((prev) => prev.map((value, i) => (i === k ? 0 : value))), 90));
        }, shadeDuration + 110),
      );
    }, interval);
    return () => {
      window.clearInterval(cycle);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [autoplay, reducedMotion, lookingAt, total, count, interval, shadeDuration]);

  React.useEffect(() => {
    if (reducedMotion || drift <= 0) {
      for (const view of viewRefs.current) view?.getAnimations().forEach((animation) => animation.cancel());
      for (const view of viewRefs.current) if (view) view.style.transform = `translateX(${-((1 - 1 / VIEW_SCALE) / 2) * 100}%)`;
      return;
    }
    const pan = -(1 - 1 / VIEW_SCALE) * 100;
    const animations = viewRefs.current.map((view, k) =>
      view?.animate([{ transform: "translateX(0%)" }, { transform: `translateX(${pan}%)` }], {
        duration: drift * 1000,
        iterations: Infinity,
        direction: "alternate",
        easing: "ease-in-out",
        delay: -((k * 0.37 + 0.2) % 1) * drift * 1000,
      }),
    );
    return () => animations.forEach((animation) => animation?.cancel());
  }, [drift, reducedMotion, count]);

  const cancelFlight = React.useCallback(() => {
    for (const animation of animations.current) {
      animation.onfinish = null;
      animation.cancel();
    }
    animations.current = [];
    frameFlight.current?.cancel();
    frameFlight.current = null;
  }, []);

  const windowCrop = React.useCallback((index: number) => {
    const source = viewRefs.current[index];
    const glass = source?.parentElement?.getBoundingClientRect();
    const stage = lookRef.current?.getBoundingClientRect();
    if (!source || !glass || !stage || !stage.width || !glass.width) return null;
    const image = source.getBoundingClientRect();
    const naturalWidth = source.naturalWidth || image.width;
    const naturalHeight = source.naturalHeight || image.height;
    // Match the painted object-cover image, not just the 135%-wide img element.
    // image's rect includes the current cabin drift and the button's hover offset.
    const smallCover = Math.max(image.width / naturalWidth, image.height / naturalHeight);
    const fullCover = Math.max(stage.width / naturalWidth, stage.height / naturalHeight);
    const scale = smallCover / fullCover;
    const x = glass.left - stage.left + glass.width / 2;
    const y = glass.top - stage.top + glass.height / 2;
    const tx = image.left - stage.left + image.width / 2 - (x + (stage.width / 2 - x) * scale);
    const ty = image.top - stage.top + image.height / 2 - (y + (stage.height / 2 - y) * scale);
    const root = lookRef.current?.parentElement;
    const radius = root ? getComputedStyle(root).borderRadius : "28px";
    return {
      // Resolve the window's 46% / 34% radii against the glass, not the larger stage.
      clip: `inset(${glass.top - stage.top}px ${stage.right - glass.right}px ${stage.bottom - glass.bottom}px ${glass.left - stage.left}px round ${glass.width * 0.46}px / ${glass.height * 0.34}px)`,
      fullClip: `inset(0px 0px 0px 0px round ${radius})`,
      origin: `${x}px ${y}px`,
      transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
      frame: `translate(${stage.width / 2 - x}px, ${stage.height / 2 - y}px) scale(${Math.max(stage.width / glass.width, stage.height / glass.height) * 1.8})`,
    };
  }, []);

  React.useLayoutEffect(() => {
    if (requestedWindow !== null) setRetainedWindow(requestedWindow);
  }, [requestedWindow]);

  React.useLayoutEffect(() => {
    if (lookingAt === null) return;
    if (reducedMotion && closing.current) {
      finishReturn.current?.();
      return;
    }
    const mask = maskRef.current;
    const view = lookViewRef.current;
    const crop = windowCrop(lookingAt);
    if (!mask || !view || !crop) return;
    closing.current = false;
    lookRef.current?.focus({ preventScroll: true });
    mask.style.clipPath = crop.fullClip;
    view.style.transformOrigin = crop.origin;
    const duration = reducedMotion ? 0 : 650;
    if (duration === 0) {
      setFlight("vista");
      return cancelFlight;
    }
    setFlight("entering");
    const clip = mask.animate([{ clipPath: crop.clip }, { clipPath: crop.fullClip }], { duration, easing: FLIGHT_EASING, fill: "both" });
    const zoom = view.animate([{ transform: crop.transform }, { transform: "translate(0px, 0px) scale(1)" }], { duration, easing: FLIGHT_EASING, fill: "both" });
    const fade = mask.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: "both" });
    const caption = captionRef.current?.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0px)" }], { delay: 300, duration: 350, easing: FLIGHT_EASING, fill: "both" });
    // The existing frame follows behind the landscape and passes beyond the stage.
    // Keep the original glass untouched for the first 120ms crossfade.
    const frame = windowRefs.current[lookingAt];
    if (frame) frameFlight.current = frame.animate([
      { transform: getComputedStyle(frame).transform, opacity: 1, offset: 0 },
      { transform: getComputedStyle(frame).transform, opacity: 1, offset: 120 / duration, easing: FLIGHT_EASING },
      { transform: crop.frame, opacity: 0, offset: 1 },
    ], { duration, fill: "both" });
    animations.current = [clip, zoom, fade, ...(caption ? [caption] : [])];
    zoom.onfinish = () => {
      if (closing.current) return;
      // Drop filled entrance effects so the gentle vista motion can take over.
      clip.cancel(); zoom.cancel(); fade.cancel(); caption?.cancel();
      setFlight("vista");
    };
    return cancelFlight;
  }, [lookingAt, reducedMotion, windowCrop, cancelFlight]);

  React.useEffect(() => {
    if (lookingAt === null || flight !== "vista" || reducedMotion || drift <= 0) return;
    const view = lookViewRef.current;
    if (!view) return;
    // The pan stays inside the extra coverage produced by the slow Ken Burns zoom.
    const ambient = view.animate([
      { transform: "translate(0%, 0%) scale(1)" },
      { transform: "translate(-0.5%, 0%) scale(1.02)", offset: 0.5 },
      { transform: "translate(0.5%, 0%) scale(1.04)" },
    ], { duration: Math.max(32, drift) * 1000, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    // Centering the ambient zoom keeps all four edges covered, even for an edge seat.
    view.style.transformOrigin = "50% 50%";
    animations.current.push(ambient);
    return () => ambient.cancel();
  }, [lookingAt, flight, reducedMotion, drift]);

  const lookOut = (k: number) => {
    if (lookingAt !== null || (shades[k] ?? 1) > 0) return;
    setLookingAt(k);
    onActiveWindowChange?.(k);
    onLookOut?.(slots[k] ?? null);
  };

  const sitBack = React.useCallback(() => {
    if (lookingAt === null || closing.current) return;
    const k = lookingAt;
    const finish = () => {
      cancelFlight();
      closing.current = false;
      finishReturn.current = null;
      setRetainedWindow(null);
      setLookingAt(null);
      onActiveWindowChange?.(null);
      onLookOut?.(null);
      windowRefs.current[k]?.focus({ preventScroll: true });
    };
    const mask = maskRef.current;
    const view = lookViewRef.current;
    if (!mask || !view || reducedMotion) { finish(); return; }
    const currentClip = getComputedStyle(mask).clipPath;
    const currentTransform = new DOMMatrixReadOnly(getComputedStyle(view).transform);
    const origin = getComputedStyle(view).transformOrigin.split(" ").map(Number.parseFloat);
    const captionOpacity = captionRef.current ? getComputedStyle(captionRef.current).opacity : "0";
    // Restore the hidden cabin frame before measuring its current drift/position.
    cancelFlight();
    const crop = windowCrop(k);
    if (!crop) { finish(); return; }
    const nextOrigin = crop.origin.split(" ").map(Number.parseFloat);
    // Rebase the current transform from the ambient center to the window center.
    const tx = currentTransform.m41 + (1 - currentTransform.m11) * ((origin[0] ?? 0) - (nextOrigin[0] ?? 0));
    const ty = currentTransform.m42 + (1 - currentTransform.m22) * ((origin[1] ?? 0) - (nextOrigin[1] ?? 0));
    view.style.transformOrigin = crop.origin;
    closing.current = true;
    finishReturn.current = finish;
    setFlight("returning");
    const clip = mask.animate([{ clipPath: currentClip }, { clipPath: crop.clip }], { duration: 480, easing: FLIGHT_EASING, fill: "both" });
    const zoom = view.animate([{ transform: `translate(${tx}px, ${ty}px) scale(${currentTransform.m11})` }, { transform: crop.transform }], { duration: 480, easing: FLIGHT_EASING, fill: "both" });
    // The final crossfade conceals the small amount of live cabin drift during return.
    const fade = mask.animate([{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 480, fill: "both" });
    const caption = captionRef.current?.animate([{ opacity: captionOpacity }, { opacity: 0 }], { duration: 160, fill: "both" });
    const frame = windowRefs.current[k];
    if (frame) frameFlight.current = frame.animate([{ transform: crop.frame, opacity: 0 }, { transform: getComputedStyle(frame).transform, opacity: 1 }], { duration: 480, easing: FLIGHT_EASING });
    animations.current = [clip, zoom, fade, ...(caption ? [caption] : [])];
    zoom.onfinish = finish;
  }, [lookingAt, onLookOut, onActiveWindowChange, reducedMotion, windowCrop, cancelFlight]);

  React.useLayoutEffect(() => {
    if (requestedWindow === null && retainedWindow !== null) sitBack();
  }, [requestedWindow, retainedWindow, sitBack]);

  React.useEffect(() => {
    if (lookingAt === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") sitBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lookingAt, sitBack]);

  const width = `min(${Math.min(36, 72 / count)}cqw, calc((100cqh - ${LABEL_SPACE_PX}px) * ${WINDOW_ASPECT}))`;
  const looked = lookingAt === null ? undefined : items[slots[lookingAt] ?? 0];

  return (
    <div
      ref={ref}
      data-slot="airplane-window-gallery"
      data-looking={lookingAt ?? undefined}
      data-autoplay={autoplay}
      className={cn(
        "relative isolate w-full overflow-hidden rounded-[28px] bg-background text-foreground ring-1 ring-border",
        "bg-gradient-to-b from-border via-muted to-border",
        "dark:from-primary/90 dark:via-primary dark:to-primary/90",
        className,
      )}
      style={{ aspectRatio: "3 / 2", ...style }}
      {...rest}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-muted to-border shadow-md shadow-foreground/15 dark:from-foreground dark:to-primary"
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-foreground/10 dark:bg-primary-foreground/10" />
        <div className="absolute inset-x-0 bottom-[22%] flex justify-evenly">
          {Array.from({ length: count }, (_, k) => (
            <span key={k} className="h-1.5 w-1.5 rounded-full bg-background shadow-md shadow-background/65 dark:bg-foreground dark:shadow-foreground/65" />
          ))}
        </div>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[8%] bg-gradient-to-b from-muted to-border shadow-inner shadow-foreground/10 dark:from-primary dark:to-primary/80" />

      <div
        role="list"
        className={cn(
          "absolute inset-x-[4%] top-[11%] bottom-[8%] flex items-center justify-evenly transition-[opacity,filter] duration-500 motion-reduce:transition-none",
          lookingAt !== null && flight !== "returning" && "opacity-40 blur-[1.5px]",
        )}
        style={{ containerType: "size", transitionDelay: lookingAt !== null && flight !== "returning" && !reducedMotion ? "120ms" : "0ms" }}
      >
        {Array.from({ length: count }, (_, k) => {
          const item = items[slots[k] ?? 0];
          const shade = shades[k] ?? 1;
          const isClosed = shade > 0;
          return (
            <div key={k} role="listitem" className="flex flex-col items-center gap-2" style={{ width }}>
              <span data-seat className="font-mono text-[11px] tracking-wider text-foreground/60 dark:text-primary-foreground/70">
                {firstRow + k}A
              </span>
              <button
                ref={(node) => {
                  windowRefs.current[k] = node;
                }}
                type="button"
                data-window={k}
                data-item={slots[k]}
                data-closed={isClosed || undefined}
                aria-label={`Look out of window ${firstRow + k}A${item?.title ? `: ${item.title}${item.location ? `, ${item.location}` : ""}` : ""}`}
                onClick={() => lookOut(k)}
                className={cn(
                  "group relative w-full rounded-[46%/34%] outline-none transition-transform duration-300 hover:-translate-y-0.5",
                  "bg-gradient-to-br from-card to-border shadow-lg shadow-foreground/25 ring-1 ring-card/70",
                  "dark:from-foreground dark:to-primary",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                )}
                style={{ aspectRatio: String(WINDOW_ASPECT) }}
              >
                <span aria-hidden className="absolute inset-[3.5%] rounded-[45%/33%] shadow-inner shadow-foreground/30 dark:shadow-primary-foreground/30" />
                <Glass
                  item={item}
                  shade={shade}
                  shadeMs={shadeMs}
                  viewRef={(node) => {
                    viewRefs.current[k] = node;
                  }}
                />
              </button>
              <span
                data-place
                className="flex min-h-10 flex-col items-center whitespace-nowrap text-center leading-tight transition-opacity duration-300"
                style={{ opacity: isClosed ? 0.35 : 1 }}
              >
                <span className="text-sm font-medium text-foreground/80 dark:text-primary-foreground/90">{item?.title ?? ""}</span>
                {item?.location && <span className="mt-0.5 text-[11px] text-foreground/60 dark:text-primary-foreground/70">{item.location}</span>}
              </span>
            </div>
          );
        })}
      </div>

      {lookingAt !== null && (
        <div
          ref={lookRef}
          data-lookout
          data-flight={flight}
          data-item={slots[lookingAt]}
          role="dialog"
          aria-modal="false"
          aria-label={looked?.title ?? "Window view"}
          tabIndex={-1}
          className="absolute inset-0 z-20 cursor-zoom-out outline-none"
          onClick={sitBack}
        >
          <div ref={maskRef} data-vista-mask className="absolute inset-0 overflow-hidden">
            {/* Let object-cover's overscan survive the transform; the stage mask clips it. */}
            {looked && <img ref={lookViewRef} data-vista src={looked.src} alt={looked.alt ?? looked.title ?? ""} draggable={false} className="absolute inset-0 h-full w-full max-w-none overflow-visible object-cover" />}
          </div>
          <div ref={captionRef} data-vista-caption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-transparent px-[6%] pb-[6%] pt-[18%] text-background dark:from-background/90 dark:via-background/50 dark:text-foreground">
            {(looked?.title || looked?.location) && (
              <p className="text-lg font-semibold tracking-tight sm:text-2xl">
                {looked?.title}
                {looked?.location && <span className="font-normal text-background/90 dark:text-foreground/90"> · {looked.location}</span>}
              </p>
            )}
            {looked?.caption && <p className="mt-1 text-xs leading-relaxed text-background/90 dark:text-foreground/90">{looked.caption}</p>}
            <p className="mt-3 text-[10px] uppercase tracking-[.16em] text-background/70 dark:text-foreground/70">Click anywhere to sit back.</p>
          </div>
          <button
            type="button"
            data-sit-back
            onClick={(event) => {
              event.stopPropagation();
              sitBack();
            }}
            className="absolute right-4 top-4 rounded-full bg-foreground/65 px-3 py-1.5 text-xs font-medium text-background dark:bg-background/65 dark:text-foreground backdrop-blur-sm transition-colors hover:bg-foreground/80 dark:hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/70 dark:focus-visible:ring-foreground/70"
          >
            Sit back
          </button>
        </div>
      )}
    </div>
  );
}

export default AirplaneWindowGallery;
