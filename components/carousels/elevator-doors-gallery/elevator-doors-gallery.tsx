"use client";

// Elevator Doors Gallery - each photo is a floor behind a pair of elevator
// doors. Pressing a floor button closes the doors, the indicator counts the
// floors with a travel light, and the doors open on the new photo. "Step
// inside" zooms the photo out of the doorway to fill the card; click or Escape
// to go back. Floor labels can be any number or text (B1, 12, Roof...).
//
// Needs Tailwind v4 (`@container`, `@min-[480px]:`, `border-current/50`) and
// React 19 (`ref` as a prop, `inert`). Uses shadcn tokens incl. `chart-1`.
// Source: 21st.dev "elevator-doors-gallery".

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ElevatorFloorItem {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  floor?: string | number;
}

export interface ElevatorDoorsLabels {
  chooseFloor: string;
  floor: string;
  stepInside: string;
  backToElevator: string;
  returnHint: string;
  arrived: string;
  imageUnavailable: string;
  empty: string;
}

type GalleryDivProps = React.ComponentProps<"div">;
type Phase = "idle" | "closing" | "travelling" | "opening";

export interface ElevatorDoorsGalleryProps extends GalleryDivProps {
  items?: ElevatorFloorItem[];
  /** Item index, independent of the printed floor label. */
  defaultFloor?: number;
  floor?: number;
  onFloorChange?: (index: number) => void;
  /** Controlled scene view. Omit for click-to-enter behavior. */
  inside?: boolean;
  onInsideChange?: (inside: boolean) => void;
  /** Called when an open floor is entered, including controlled entry. */
  onStepInside?: (item: ElevatorFloorItem) => void;
  /** Opt in to automatic floor changes. Any user selection stops them. */
  autoplay?: boolean;
  /** Milliseconds between requests, with a 2300 ms minimum for a complete journey. */
  interval?: number;
  /** Delay before the first automatic selection; defaults to interval. */
  initialDelay?: number;
  /** Interface text, merged over the English defaults. */
  labels?: Partial<ElevatorDoorsLabels>;
  ref?: GalleryDivProps["ref"];
}

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

/** An imagined hotel: six floors, Unsplash photos. */
export const elevatorDefaultItems: ElevatorFloorItem[] = [
  { src: IMG("1542314831-068cd1dbfeeb"), alt: "A hotel lit up at night beside its pool", floor: 1, title: "Arrival", caption: "The lights are on for you." },
  { src: IMG("1534438327276-14e5300c3a48"), alt: "Dumbbell racks in a bright fitness center", floor: 5, title: "Fitness center", caption: "Sunrise sessions with a view." },
  { src: IMG("1631049307264-da0ec9d70304"), alt: "A made bed and warm lamps in a hotel guest suite", floor: 12, title: "Guest suite", caption: "Your room, your pace." },
  { src: IMG("1514933651103-005eec06c04b"), alt: "A warmly lit bar with shelves of bottles", floor: 20, title: "Lounge bar", caption: "Cocktails after dark." },
  { src: IMG("1566737236500-c8ac43014a67"), alt: "A tunnel of pink and blue lights over a crowd", floor: 28, title: "Club", caption: "The night goes up." },
  { src: IMG("1582719508461-905c673771fd"), alt: "Sun loungers beside an infinity pool facing the sea", floor: 33, title: "Rooftop pool", caption: "Swim above the skyline." },
];

const DEFAULT_LABELS: ElevatorDoorsLabels = {
  chooseFloor: "Choose a floor",
  floor: "Floor",
  stepInside: "Step inside",
  backToElevator: "Back to the elevator",
  returnHint: "Click anywhere to return",
  arrived: "Arrived at",
  imageUnavailable: "Image unavailable",
  empty: "No floors to explore",
};

const CLOSE_MS = 420;
const OPEN_MS = 520;
const TRAVEL_MS = 1200;
const EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const OPEN_POSITION = 94;

function clampFloor(index: number, total: number) {
  return Math.max(0, Math.min(total - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
}

function floorLabel(item: ElevatorFloorItem | undefined, index: number) {
  return String(item?.floor ?? index + 1);
}

function displayLabel(label: string) {
  return /^\d$/.test(label) ? label.padStart(2, "0") : label;
}

function arrivalLabel(item: ElevatorFloorItem | undefined, index: number, arrived: string) {
  const label = floorLabel(item, index);
  return `${arrived} ${Number.isFinite(Number(label)) ? `${label}F` : label}${item?.title ? ` · ${item.title}` : ""}`;
}

export function ElevatorDoorsGallery({
  items = elevatorDefaultItems,
  defaultFloor = 0,
  floor,
  onFloorChange,
  inside,
  onInsideChange,
  onStepInside,
  autoplay = false,
  interval = 3200,
  initialDelay,
  labels,
  className,
  ref,
  ...rest
}: ElevatorDoorsGalleryProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const total = items.length;
  const [localFloor, setLocalFloor] = React.useState(() => clampFloor(defaultFloor, total));
  const selected = clampFloor(floor ?? localFloor, total);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [userStopped, setUserStopped] = React.useState(false);
  const [visual, setVisual] = React.useState(() => ({
    index: selected,
    label: floorLabel(items[selected], selected),
    phase: "idle" as Phase,
    direction: 0,
    arrived: false,
  }));
  const [announcement, setAnnouncement] = React.useState("");
  const [failedSrc, setFailedSrc] = React.useState("");
  const [loadedSrc, setLoadedSrc] = React.useState("");
  const [localInside, setLocalInside] = React.useState(false);
  const requestedInside = inside ?? localInside;
  const [scene, setScene] = React.useState(null as { item: ElevatorFloorItem; index: number } | null);
  const [flight, setFlight] = React.useState("entering");
  const sourceView = React.useRef(null as HTMLImageElement | null);
  const stepButton = React.useRef(null as HTMLButtonElement | null);
  const lookRef = React.useRef(null as HTMLDivElement | null);
  const maskRef = React.useRef(null as HTMLDivElement | null);
  const vistaRef = React.useRef(null as HTMLImageElement | null);
  const captionRef = React.useRef(null as HTMLDivElement | null);
  const flightAnimations = React.useRef([] as Animation[]);
  const entered = React.useRef(false);
  const closing = React.useRef(false);
  const returnRequested = React.useRef(false);
  const focusAfterReturn = React.useRef(false);
  const finishReturn = React.useRef(null as (() => void) | null);
  const shownRef = React.useRef(selected);
  const doors = React.useRef([] as (HTMLDivElement | null)[]);
  const travelLight = React.useRef(null as HTMLDivElement | null);
  const buttons = React.useRef([] as (HTMLButtonElement | null)[]);
  const panelRef = React.useRef(null as HTMLDivElement | null);
  const [widePanel, setWidePanel] = React.useState(false);
  const panelFocus = React.useRef(null as number | null);
  const command = React.useRef(null as ((index: number) => void) | null);
  const openAfterCommit = React.useRef(null as (() => void) | null);
  const everOpened = React.useRef(false);
  const latest = React.useRef({ items, selected, floor, onFloorChange, onStepInside, insideVisible: scene !== null, arrived: text.arrived });
  // Keep the latest props for the driver and listeners. Declared before the
  // other layout effects so they always read this render's values.
  React.useLayoutEffect(() => {
    latest.current = { items, selected, floor, onFloorChange, onStepInside, insideVisible: scene !== null, arrived: text.arrived };
  });

  // Keep DOM reading order aligned with the panel's responsive visual order.
  React.useLayoutEffect(() => {
    const container = panelRef.current?.closest('[data-slot="elevator-doors-gallery"]');
    if (!container) return;
    const update = (width: number) => {
      const active = document.activeElement as HTMLElement | null;
      panelFocus.current = active && panelRef.current?.contains(active) && active.dataset.floorButton !== undefined ? Number(active.dataset.floorButton) : null;
      setWidePanel(width >= 480);
    };
    const style = getComputedStyle(container);
    update(container.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight));
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    if (panelFocus.current !== null) buttons.current[panelFocus.current]?.focus({ preventScroll: true });
    panelFocus.current = null;
  }, [widePanel]);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    for (const item of items) {
      const image = new Image();
      image.src = item.src;
    }
  }, [items]);

  // One driver owns both doors and the journey. Retargeting only changes its
  // destination; it never starts another timer, animation loop, or queue.
  React.useEffect(() => {
    let shown = clampFloor(shownRef.current, total);
    let target = shown;
    let phase: Phase = "idle";
    let phaseStart = 0;
    let lastStep = 0;
    let frame = 0;
    let direction = 0;
    let animations: Animation[] = [];
    const values = latest.current.items.map((item, index) => Number(item.floor ?? index + 1));
    const numeric = values.every(Number.isSafeInteger) && new Set(values).size === total;
    const level = (index: number) => numeric ? (values[index] ?? 1) : index;
    let indicated = level(shown);

    const publish = (arrived = false) => {
      shownRef.current = shown;
      setVisual({
        index: shown,
        label: numeric ? String(indicated) : floorLabel(latest.current.items[indicated], indicated),
        phase,
        direction,
        arrived,
      });
    };

    const setDoors = (open: boolean, duration: number) => {
      const starts = doors.current.map((door) => door ? getComputedStyle(door).transform : "none");
      animations.forEach((animation) => animation.cancel());
      animations = [];
      doors.current.forEach((door, index) => {
        if (!door) return;
        const transform = `translateX(${open ? (index === 0 ? -OPEN_POSITION : OPEN_POSITION) : 0}%)`;
        door.style.transform = transform;
        if (duration > 0) {
          animations.push(door.animate([{ transform: starts[index] }, { transform }], { duration, easing: EASING }));
        }
      });
    };

    const close = (now: number) => {
      openAfterCommit.current = null;
      phase = "closing";
      phaseStart = now;
      direction = Math.sign(level(target) - indicated);
      setDoors(false, CLOSE_MS);
      publish();
    };

    const tick = (now: number) => {
      frame = 0;
      if (phase === "closing" && now - phaseStart >= CLOSE_MS) {
        phase = "travelling";
        phaseStart = now;
        lastStep = now;
        publish();
      }
      if (phase === "travelling") {
        const destination = level(target);
        const distance = Math.abs(destination - indicated);
        direction = Math.sign(destination - indicated);
        const remaining = Math.max(0, TRAVEL_MS - (now - phaseStart));
        const stepMs = Math.min(140, remaining / Math.max(1, distance));
        if (distance > 0 && now - lastStep >= stepMs) {
          indicated += direction;
          lastStep = now;
          // A large numeric gap must still fit the 1.2-second travel budget.
          if (remaining === 0) indicated = destination;
          publish();
        }
        if (indicated === destination) {
          shown = target;
          phase = "opening";
          phaseStart = Infinity;
          // Commit the new image while the doors are still shut, then open.
          openAfterCommit.current = () => {
            phaseStart = performance.now();
            everOpened.current = true;
            setDoors(true, OPEN_MS);
          };
          publish(true);
          setAnnouncement(arrivalLabel(latest.current.items[shown], shown, latest.current.arrived));
        }
      }
      if (phase === "opening" && now - phaseStart >= OPEN_MS) {
        phase = "idle";
        direction = 0;
        publish();
      }
      if (phase !== "idle") frame = requestAnimationFrame(tick);
    };

    const prefersReduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!everOpened.current && !prefersReduced && total > 0) {
      setDoors(false, 0);
      phase = "opening";
      phaseStart = Infinity;
      openAfterCommit.current = () => {
        phaseStart = performance.now();
        everOpened.current = true;
        setDoors(true, OPEN_MS);
      };
      frame = requestAnimationFrame(tick);
    } else {
      everOpened.current = true;
      setDoors(true, 0);
    }
    publish();
    command.current = (index) => {
      if (latest.current.insideVisible) return;
      target = index;
      if (reducedMotion) {
        cancelAnimationFrame(frame);
        frame = 0;
        shown = target;
        indicated = level(target);
        phase = "idle";
        direction = 0;
        setDoors(true, 0);
        publish();
        if (total > 0) setAnnouncement(arrivalLabel(latest.current.items[shown], shown, latest.current.arrived));
        return;
      }
      if (phase === "idle" && shown === target) return;
      if (phase === "idle" || (phase === "opening" && shown !== target)) close(performance.now());
      if (!frame) frame = requestAnimationFrame(tick);
    };
    command.current(latest.current.selected);
    return () => {
      cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      command.current = null;
      openAfterCommit.current = null;
    };
  }, [total, reducedMotion]);

  // Doors open onto a loaded photo; a slow image still opens them after 1.2 s.
  const arrivingSrc = items[clampFloor(visual.index, total)]?.src;
  React.useLayoutEffect(() => {
    if (visual.phase !== "opening" || !openAfterCommit.current) return;
    const open = () => {
      const run = openAfterCommit.current;
      openAfterCommit.current = null;
      run?.();
    };
    if (!arrivingSrc || loadedSrc === arrivingSrc || failedSrc === arrivingSrc) { open(); return; }
    const timer = window.setTimeout(open, 1200);
    return () => window.clearTimeout(timer);
  }, [visual.phase, visual.index, arrivingSrc, loadedSrc, failedSrc]);

  // An image that finished loading before hydration never fires React's onLoad,
  // which would leave the caption hidden and "Step inside" disabled. Check it directly.
  React.useLayoutEffect(() => {
    const node = sourceView.current;
    if (node && arrivingSrc && node.complete && node.naturalWidth > 0) setLoadedSrc(arrivingSrc);
  }, [arrivingSrc]);

  // Close the doors before the first client paint so the first floor arrives too.
  React.useLayoutEffect(() => {
    if (everOpened.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    doors.current.forEach((door) => { if (door) door.style.transform = "translateX(0%)"; });
  }, []);

  React.useEffect(() => {
    if (!scene) command.current?.(selected);
  }, [selected, total, reducedMotion, scene]);

  React.useEffect(() => {
    const light = travelLight.current;
    if (!light || visual.phase !== "travelling" || reducedMotion) return;
    const distance = light.parentElement?.clientHeight ?? 300;
    const down = visual.direction < 0;
    const animation = light.animate([
      { transform: `translateY(${down ? 0 : distance}px)` },
      { transform: `translateY(${down ? distance : 0}px)` },
    ], { duration: 650, iterations: Infinity });
    return () => animation.cancel();
  }, [visual.phase, visual.direction, reducedMotion]);

  const selectFloor = React.useCallback((index: number, user = true) => {
    if (user) setUserStopped(true);
    const current = latest.current;
    if (current.items.length === 0 || current.insideVisible) return;
    const next = clampFloor(index, current.items.length);
    if (next === current.selected) return;
    if (current.floor === undefined) setLocalFloor(next);
    current.onFloorChange?.(next);
  }, []);

  React.useEffect(() => {
    if (!autoplay || userStopped || reducedMotion || total < 2 || requestedInside || scene) return;
    const every = Number.isFinite(interval) ? Math.max(2300, interval) : 3200;
    const first = initialDelay === undefined || !Number.isFinite(initialDelay) ? every : Math.max(0, initialDelay);
    let timer = window.setTimeout(function advance() {
      selectFloor((latest.current.selected + 1) % total, false);
      timer = window.setTimeout(advance, every);
    }, first);
    return () => window.clearTimeout(timer);
  }, [autoplay, userStopped, reducedMotion, total, interval, initialDelay, selectFloor, requestedInside, scene]);

  const item = items[clampFloor(visual.index, total)];
  const busy = visual.phase !== "idle";
  const playing = autoplay && !userStopped && !reducedMotion && total > 1 && !requestedInside && !scene;
  const displayedLabel = displayLabel(visual.label);
  const ascendingFloors = items.map((_, index) => index);
  if (items.every((entry, index) => Number.isFinite(Number(floorLabel(entry, index))))) {
    ascendingFloors.sort((a, b) => Number(floorLabel(items[a], a)) - Number(floorLabel(items[b], b)));
  }
  const rows = widePanel
    ? Array.from({ length: Math.ceil(total / 2) }, (_, row) => ascendingFloors.slice(row * 2, row * 2 + 2)).reverse()
    : [ascendingFloors];
  const panelButtons = rows.flatMap((row, rowIndex) => row.map((index, column) => ({ index, row: rowIndex + 1, column: column + 1 })));

  const cancelFlight = React.useCallback(() => {
    flightAnimations.current.forEach((animation) => { animation.onfinish = null; animation.cancel(); });
    flightAnimations.current = [];
  }, []);

  // The stage-sized image starts with exactly the same painted object-cover
  // crop as the portrait opening, so the zoom out of the doorway is seamless.
  const windowCrop = React.useCallback(() => {
    const source = sourceView.current;
    const opening = stepButton.current?.getBoundingClientRect();
    const stage = lookRef.current?.getBoundingClientRect();
    if (!source || !opening || !stage || !opening.width || !stage.width) return null;
    const image = source.getBoundingClientRect();
    const naturalWidth = source.naturalWidth || image.width;
    const naturalHeight = source.naturalHeight || image.height;
    const smallCover = Math.max(image.width / naturalWidth, image.height / naturalHeight);
    const fullCover = Math.max(stage.width / naturalWidth, stage.height / naturalHeight);
    const scale = smallCover / fullCover;
    const x = opening.left - stage.left + opening.width / 2;
    const y = opening.top - stage.top + opening.height / 2;
    const tx = image.left - stage.left + image.width / 2 - (x + (stage.width / 2 - x) * scale);
    const ty = image.top - stage.top + image.height / 2 - (y + (stage.height / 2 - y) * scale);
    const radius = lookRef.current?.parentElement ? getComputedStyle(lookRef.current.parentElement).borderRadius : "28px";
    return {
      clip: `inset(${opening.top - stage.top}px ${stage.right - opening.right}px ${stage.bottom - opening.bottom}px ${opening.left - stage.left}px round 0px)`,
      fullClip: `inset(0px 0px 0px 0px round ${radius})`,
      origin: `${x}px ${y}px`,
      transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
    };
  }, []);

  React.useLayoutEffect(() => {
    if (!requestedInside || scene || entered.current || busy || visual.index !== selected || !item || loadedSrc !== item.src) return;
    entered.current = true;
    returnRequested.current = false;
    setScene({ item, index: visual.index });
    latest.current.onStepInside?.(item);
  }, [requestedInside, scene, busy, visual.index, selected, item, loadedSrc]);

  React.useLayoutEffect(() => {
    if (!scene) {
      if (focusAfterReturn.current) {
        focusAfterReturn.current = false;
        stepButton.current?.focus({ preventScroll: true });
      }
      return;
    }
    if (reducedMotion && closing.current) { finishReturn.current?.(); return; }
    const mask = maskRef.current;
    const view = vistaRef.current;
    const crop = windowCrop();
    if (!mask || !view || !crop) return;
    closing.current = false;
    lookRef.current?.focus({ preventScroll: true });
    mask.style.clipPath = crop.fullClip;
    view.style.transformOrigin = crop.origin;
    if (reducedMotion) { setFlight("vista"); return cancelFlight; }
    setFlight("entering");
    const clip = mask.animate([{ clipPath: crop.clip }, { clipPath: crop.fullClip }], { duration: 650, easing: EASING, fill: "both" });
    const zoom = view.animate([{ transform: crop.transform }, { transform: "translate(0px, 0px) scale(1)" }], { duration: 650, easing: EASING, fill: "both" });
    const fade = mask.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: "both" });
    const caption = captionRef.current?.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0px)" }], { delay: 300, duration: 350, easing: EASING, fill: "both" });
    flightAnimations.current = [clip, zoom, fade, ...(caption ? [caption] : [])];
    zoom.onfinish = () => {
      if (closing.current) return;
      clip.cancel(); zoom.cancel(); fade.cancel(); caption?.cancel();
      setFlight("vista");
    };
    return cancelFlight;
  }, [scene, reducedMotion, cancelFlight, windowCrop]);

  React.useEffect(() => {
    if (!scene || flight !== "vista" || reducedMotion) return;
    const view = vistaRef.current;
    if (!view) return;
    view.style.transformOrigin = "50% 50%";
    const ambient = view.animate([{ transform: "scale(1)" }, { transform: "scale(1.04)" }], { duration: 32000, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    flightAnimations.current.push(ambient);
    return () => ambient.cancel();
  }, [scene, flight, reducedMotion]);

  React.useLayoutEffect(() => {
    if (requestedInside || !scene || closing.current) return;
    const finish = () => {
      cancelFlight();
      closing.current = false;
      entered.current = false;
      returnRequested.current = false;
      finishReturn.current = null;
      focusAfterReturn.current = true;
      setScene(null);
    };
    const mask = maskRef.current;
    const view = vistaRef.current;
    const crop = windowCrop();
    if (!mask || !view || !crop || reducedMotion) { finish(); return; }
    const currentClip = getComputedStyle(mask).clipPath;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(view).transform);
    const origin = getComputedStyle(view).transformOrigin.split(" ").map(Number.parseFloat);
    const nextOrigin = crop.origin.split(" ").map(Number.parseFloat);
    const tx = matrix.m41 + (1 - matrix.m11) * ((origin[0] ?? 0) - (nextOrigin[0] ?? 0));
    const ty = matrix.m42 + (1 - matrix.m22) * ((origin[1] ?? 0) - (nextOrigin[1] ?? 0));
    const captionOpacity = captionRef.current ? getComputedStyle(captionRef.current).opacity : "0";
    cancelFlight();
    view.style.transformOrigin = crop.origin;
    closing.current = true;
    finishReturn.current = finish;
    setFlight("returning");
    const clip = mask.animate([{ clipPath: currentClip }, { clipPath: crop.clip }], { duration: 480, easing: EASING, fill: "both" });
    const zoom = view.animate([{ transform: `translate(${tx}px, ${ty}px) scale(${matrix.m11})` }, { transform: crop.transform }], { duration: 480, easing: EASING, fill: "both" });
    const fade = mask.animate([{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 480, fill: "both" });
    const caption = captionRef.current?.animate([{ opacity: captionOpacity }, { opacity: 0 }], { duration: 160, fill: "both" });
    flightAnimations.current = [clip, zoom, fade, ...(caption ? [caption] : [])];
    zoom.onfinish = finish;
  }, [requestedInside, scene, reducedMotion, cancelFlight, windowCrop]);

  const stepInside = () => {
    if (busy || scene || visual.index !== selected || !item || loadedSrc !== item.src) return;
    setUserStopped(true);
    if (inside === undefined) setLocalInside(true);
    onInsideChange?.(true);
  };
  const backToElevator = React.useCallback(() => {
    if (!scene || closing.current || returnRequested.current) return;
    returnRequested.current = true;
    if (inside === undefined) setLocalInside(false);
    onInsideChange?.(false);
    // A controlled host may decline the request; another input may request it again.
    queueMicrotask(() => { returnRequested.current = false; });
  }, [scene, inside, onInsideChange]);

  React.useEffect(() => {
    if (!scene) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") backToElevator(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene, backToElevator]);

  return (
    <div
      {...rest}
      ref={ref}
      role="region"
      aria-label={rest["aria-label"] ?? "Elevator doors image gallery"}
      aria-busy={busy}
      data-slot="elevator-doors-gallery"
      data-phase={visual.phase}
      data-floor={visual.index}
      data-target={selected}
      data-inside={scene !== null}
      data-autoplay={autoplay}
      data-playing={playing}
      className={cn("@container relative isolate w-full max-w-[560px] overflow-hidden rounded-[28px] border border-border bg-card p-4 text-card-foreground shadow-xl shadow-foreground/5", className)}
    >
      <div
        data-cabin
        inert={scene !== null}
        className={`grid min-w-0 items-center justify-items-center gap-5 transition-[opacity,filter] duration-500 motion-reduce:transition-none @min-[480px]:grid-cols-[minmax(0,300px)_136px] @min-[480px]:justify-center @min-[480px]:gap-8 ${scene && flight !== "returning" ? "opacity-25 brightness-50" : "opacity-100"}`}
        style={{ transitionDelay: scene && flight !== "returning" && !reducedMotion ? "120ms" : "0ms" }}
      >
        <div data-landing className="flex w-full min-w-0 max-w-[288px] flex-col items-center @min-[480px]:max-w-[300px]">
          <div
            data-indicator
            data-arrived={visual.arrived || undefined}
            data-direction={visual.direction}
            aria-hidden="true"
            className={`mb-2.5 flex h-9 min-w-28 items-center justify-center gap-2.5 rounded-lg border border-foreground/80 bg-foreground px-4 text-background shadow-md shadow-foreground/15 transition-shadow duration-300 motion-reduce:transition-none dark:border-border dark:bg-background dark:text-foreground ${visual.arrived ? "ring-2 ring-chart-1/50" : ""}`}
          >
            <span className={`text-[10px] leading-none transition-opacity duration-150 motion-reduce:transition-none ${busy ? "text-chart-1 opacity-100" : "opacity-35"}`}>{visual.direction < 0 ? "▼" : "▲"}</span>
            <span data-indicator-value className="font-mono text-lg font-medium leading-none tabular-nums tracking-[0.14em]">{displayedLabel}</span>
          </div>

          <div data-car className="relative aspect-[5/7] w-full overflow-hidden rounded-t-[22px] rounded-b-lg bg-muted p-2.5 pb-3.5 shadow-lg shadow-foreground/10 ring-1 ring-inset ring-foreground/15">
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-foreground/15 via-background/30 to-foreground/15" />
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-2.5 bottom-1 h-1 rounded-full bg-foreground/15" />
            <div data-doorway className="relative size-full overflow-hidden rounded-t-[14px] rounded-b-[3px] bg-foreground/90 dark:bg-background">
              {item ? (
                <button
                  ref={stepButton}
                  data-step-inside
                  type="button"
                  aria-label={`${text.stepInside}${item.title ? ` · ${item.title}` : ""}`}
                  disabled={busy || visual.index !== selected || loadedSrc !== item.src || failedSrc === item.src}
                  onClick={stepInside}
                  className="group absolute inset-0 overflow-hidden text-left outline-none enabled:cursor-zoom-in focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <img
                    ref={sourceView}
                    data-floor-view
                    data-index={visual.index}
                    src={item.src}
                    alt={item.alt ?? item.title ?? ""}
                    draggable={false}
                    onLoad={(event) => setLoadedSrc(event.currentTarget.getAttribute("src") ?? "")}
                    onError={() => setFailedSrc(item.src)}
                    className={`absolute inset-0 size-full object-cover ${failedSrc === item.src ? "invisible" : ""}`}
                  />
                  {failedSrc === item.src && <span className="absolute inset-0 flex items-center justify-center text-sm text-background/70 dark:text-muted-foreground">{text.imageUnavailable}</span>}
                  <span data-door-caption className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/95 via-foreground/55 to-transparent px-4 pb-5 pt-20 text-background transition-opacity duration-200 motion-reduce:transition-none dark:from-background/95 dark:via-background/55 dark:text-foreground ${busy || loadedSrc !== item.src ? "opacity-0" : "opacity-100"}`}>
                    <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] opacity-80">{text.floor} {displayLabel(floorLabel(item, visual.index))}</span>
                    {item.title && <span className="block text-xl font-medium leading-tight tracking-tight">{item.title}</span>}
                    {item.caption && <span className="mt-1.5 block max-w-[30ch] text-xs leading-relaxed opacity-85">{item.caption}</span>}
                    <span className="mt-4 inline-flex items-center gap-2 border-b border-current/50 pb-1 text-xs font-medium">{text.stepInside} <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12" /></svg></span>
                  </span>
                </button>
              ) : <span className="absolute inset-0 flex items-center justify-center text-sm text-background/70 dark:text-muted-foreground">{text.empty}</span>}

              {["left", "right"].map((side, index) => (
                <div
                  key={side}
                  ref={(node) => { doors.current[index] = node; }}
                  data-door={side}
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-0 z-10 w-1/2 overflow-hidden bg-muted will-change-transform ${index === 0 ? "left-0" : "right-0"}`}
                  style={{ transform: `translateX(${index === 0 ? -OPEN_POSITION : OPEN_POSITION}%)` }}
                >
                  <span className={`absolute inset-0 from-foreground/20 via-background/25 to-foreground/10 ${index === 0 ? "bg-gradient-to-r" : "bg-gradient-to-l"}`} />
                  <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_3px,var(--color-foreground)_3px_4px)] opacity-[0.05]" />
                  <span className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-foreground/10" />
                  <span className={`absolute inset-y-0 w-0.5 bg-foreground/25 ${index === 0 ? "right-0" : "left-0"}`} />
                </div>
              ))}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] ring-1 ring-inset ring-foreground/20" />
              {visual.phase === "travelling" && !reducedMotion && (
                <div
                  data-travel-light
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-20 h-px bg-chart-1/50 shadow-sm shadow-chart-1/40"
                  ref={travelLight}
                />
              )}
            </div>
          </div>
        </div>

        <div
          ref={panelRef}
          data-floor-panel
          data-panel-layout={widePanel ? "two-column" : "single-row"}
          role="group"
          aria-label={text.chooseFloor}
          className="relative flex w-full max-w-[340px] flex-col justify-center overflow-hidden rounded-2xl bg-muted px-3 py-3.5 shadow-md shadow-foreground/10 ring-1 ring-inset ring-foreground/15 @min-[480px]:min-h-[300px] @min-[480px]:max-w-none @min-[480px]:py-6"
          onKeyDown={(event) => {
            let position = ascendingFloors.indexOf(selected);
            if (event.key === "ArrowUp") position = Math.min(total - 1, position + 1);
            else if (event.key === "ArrowDown") position = Math.max(0, position - 1);
            else if (event.key === "Home") position = 0;
            else if (event.key === "End") position = total - 1;
            else return;
            const next = ascendingFloors[position];
            if (next === undefined) return;
            event.preventDefault();
            selectFloor(next);
            buttons.current[next]?.focus({ preventScroll: true });
          }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-foreground/10" />
          <p className="relative mb-3 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{text.chooseFloor}</p>
          <div className="relative grid gap-2 @min-[480px]:gap-x-2 @min-[480px]:gap-y-4" style={{ gridTemplateColumns: `repeat(${widePanel ? 2 : Math.max(1, total)}, minmax(0, 1fr))` }}>
            {panelButtons.map(({ index, row, column }) => {
              const entry = items[index];
              if (!entry) return null;
              const lampOn = selected === index && (visual.index !== selected || visual.phase === "closing" || visual.phase === "travelling");
              return (
                <button
                  key={index}
                  ref={(node) => { buttons.current[index] = node; }}
                  type="button"
                  data-floor-button={index}
                  data-floor-lamp={lampOn ? "on" : "off"}
                  style={{ gridRow: row, gridColumn: column }}
                  aria-label={`${text.floor} ${floorLabel(entry, index)}${entry.title ? ` · ${entry.title}` : ""}`}
                  aria-pressed={selected === index}
                  onClick={() => selectFloor(index)}
                  className={`relative mx-auto flex size-10 items-center justify-center rounded-full border border-foreground/15 bg-gradient-to-b from-card to-muted font-mono text-xs tabular-nums outline-none transition-[color,box-shadow,filter] duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-muted motion-reduce:transition-none @min-[480px]:size-11 @min-[480px]:text-[13px] ${lampOn ? "ring-2 ring-chart-1 text-chart-1 shadow-[0_0_12px] shadow-chart-1/60 focus-visible:ring-chart-1" : "text-foreground/70 shadow-sm shadow-foreground/15 focus-visible:ring-ring"}`}
                >
                  <span data-button-face aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full shadow-inner shadow-foreground/15" />
                  <span className="relative">{displayLabel(floorLabel(entry, index))}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {scene && (
        <div
          ref={lookRef}
          data-lookout
          data-flight={flight}
          role="dialog"
          aria-modal="false"
          aria-label={scene.item.title ?? `${text.floor} ${displayLabel(floorLabel(scene.item, scene.index))}`}
          tabIndex={-1}
          className="absolute inset-0 z-30 cursor-zoom-out outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          onClick={backToElevator}
        >
          <div ref={maskRef} data-vista-mask className="absolute inset-0 overflow-hidden">
            {/* Preserve the natural image's overscan; only the stage mask clips it. */}
            <img ref={vistaRef} data-vista src={scene.item.src} alt={scene.item.alt ?? scene.item.title ?? ""} draggable={false} className="absolute inset-0 h-full w-full max-w-none overflow-visible object-cover" />
          </div>
          <div ref={captionRef} data-vista-caption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/95 via-foreground/50 to-transparent px-[6%] pb-[6%] pt-[20%] text-background dark:from-background/95 dark:via-background/50 dark:text-foreground">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] opacity-80">{text.floor} {displayLabel(floorLabel(scene.item, scene.index))}</p>
            {scene.item.title && <h3 className="text-3xl font-medium tracking-tight">{scene.item.title}</h3>}
            {scene.item.caption && <p className="mt-2 text-sm opacity-90">{scene.item.caption}</p>}
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] opacity-65">{text.returnHint}</p>
          </div>
          <button
            data-back-to-elevator
            type="button"
            onClick={(event) => { event.stopPropagation(); backToElevator(); }}
            className="absolute right-4 top-4 rounded-full bg-foreground/65 px-3 py-2 text-xs font-medium text-background backdrop-blur-sm outline-none hover:bg-foreground/80 focus-visible:ring-2 focus-visible:ring-background/70 dark:bg-background/65 dark:text-foreground dark:hover:bg-background/80 dark:focus-visible:ring-foreground/70"
          >{text.backToElevator}</button>
        </div>
      )}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>
    </div>
  );
}

export default ElevatorDoorsGallery;
