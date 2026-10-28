"use client";

// Card Fan Carousel - image cards spread like a hand of playing cards.
// Cards spring in on load, hovering one lifts it and pushes its neighbours apart,
// and with more than 7 cards arrows/dots page through them (cards fly in/out).
//
// Animation by GSAP. Source: 21st.dev "card-fan-carousel".

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardFanItem {
  imgUrl: string;
  alt?: string;
  /** Makes the card a link. External (http...) links open in a new tab. */
  linkUrl?: string;
}

export interface CardFanCarouselProps {
  cards?: CardFanItem[];
  /** Show the arrows + dots when there are more than 7 cards. @default true */
  showControls?: boolean;
  className?: string;
  /** Size / look of each card. Default is portrait, ~18x25rem on desktop. */
  cardClassName?: string;
}

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;

export const cardFanDefaultCards: CardFanItem[] = [
  { imgUrl: IMG("1506905925346-21bda4d32df4"), alt: "Mountain landscape" },
  { imgUrl: IMG("1477959858617-67f85cf4f1df"), alt: "City skyline" },
  { imgUrl: IMG("1470071459604-3b5ec3a7fe05"), alt: "Foggy hills" },
  { imgUrl: IMG("1441974231531-c6227db76b6e"), alt: "Sunlit woods" },
  { imgUrl: IMG("1507525428034-b723cf961d3e"), alt: "Tropical beach" },
  { imgUrl: IMG("1519681393784-d120267933ba"), alt: "Starry mountain" },
  { imgUrl: IMG("1475924156734-496f6cac6ec1"), alt: "Golden sunset" },
  { imgUrl: IMG("1501785888041-af3ef285b470"), alt: "Lake reflection" },
  { imgUrl: IMG("1469474968028-56623f02e42e"), alt: "Green valley" },
  { imgUrl: IMG("1447752875215-b2761acb3c5d"), alt: "Sunbeam in the forest" },
];

const MAX_VISIBLE = 7;
const HALF = 3;

// Slot layout for 7 visible cards, left to right. x/y in rem at desktop size.
const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
];

// Shrinks horizontal spread on narrow screens. Breakpoints match the card sizes below.
function getWidthMultiplier(width: number) {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1;
}

// Shrinks vertical offsets when the viewport is shorter than the layout needs.
function getHeightMultiplier(width: number) {
  let idealPx: number;
  if (width < 480) idealPx = 22 * 16;
  else if (width < 640) idealPx = 26 * 16;
  else if (width < 768) idealPx = 28 * 16;
  else if (width < 1024) idealPx = 34 * 16;
  else idealPx = 38 * 16;

  const available = window.innerHeight * 0.7;
  return available >= idealPx ? 1 : available / idealPx;
}

// 7+ cards use the fixed fan; fewer cards spread evenly over the same arc.
function getSlotConfig(totalCards: number, slot: number) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = totalCards >> 1;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const abs = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1 - 0.2244 * abs * abs,
    x: distance * 30,
    y: abs * abs * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  };
}

const ARROW_CLASSES =
  "relative z-30 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-black/10 bg-black/5 text-black/40 shadow-[0_4px_20px_rgba(0,0,0,0.1)] outline-none backdrop-blur-[16px] transition-colors duration-300 hover:border-black/25 hover:text-black/70 focus-visible:ring-2 focus-visible:ring-black/30 active:opacity-70 md:h-12 md:w-12 dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] dark:hover:border-white/25 dark:hover:text-white/80 dark:focus-visible:ring-white/30";

export function CardFanCarousel({
  cards = cardFanDefaultCards,
  showControls = true,
  className,
  cardClassName,
}: CardFanCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef<"left" | "right" | null>(null);
  const prevVisible = useRef<Set<number>>(new Set());

  const totalCards = cards.length;
  const needsPagination = totalCards > MAX_VISIBLE;
  const [centerIndex, setCenterIndex] = useState(
    needsPagination ? HALF : totalCards >> 1,
  );

  // card index -> slot (0..6) for the cards on screen.
  const getVisibleMap = useCallback(
    (center: number) => {
      const map = new Map<number, number>();
      if (!needsPagination) {
        for (let i = 0; i < totalCards; i++) map.set(i, i);
        return map;
      }
      for (let slot = 0; slot < MAX_VISIBLE; slot++) {
        map.set((((center + slot - HALF) % totalCards) + totalCards) % totalCards, slot);
      }
      return map;
    },
    [totalCards, needsPagination],
  );

  const cycle = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating.current || !needsPagination) return;
      isAnimating.current = true;
      directionRef.current = direction;
      setCenterIndex((prev) =>
        direction === "right"
          ? (prev + 1) % totalCards
          : (prev - 1 + totalCards) % totalCards,
      );
    },
    [totalCards, needsPagination],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return;

    const cardElements = Array.from(
      container.querySelectorAll<HTMLElement>("[data-fan-card]"),
    );
    if (!cardElements.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const wMult = getWidthMultiplier(window.innerWidth);
    const hMult = getHeightMultiplier(window.innerWidth);
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
    const config = (slot: number) => getSlotConfig(slotCount, slot);

    if (isFirstMount) isAnimating.current = true;

    let completed = 0;
    const visibleCount = visibleMap.size;
    const onCardDone = () => {
      if (++completed >= visibleCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * wMult}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        };

        if (reduceMotion) {
          gsap.set(card, target);
          onCardDone();
        } else if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${12 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 1.2, ease: "elastic.out(1.05,.78)", delay: 0.2 + slot * 0.06, onComplete: onCardDone });
        } else if (!wasVisible) {
          const enterX = direction === "right" ? 40 : -40;
          gsap.set(card, { x: `${enterX}rem`, y: `${y * hMult}rem`, rotation: direction === "right" ? 30 : -30, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 0.6, ease: "power2.out", onComplete: onCardDone });
        } else {
          gsap.to(card, { ...target, duration: 0.5, ease: "power2.out", onComplete: onCardDone });
        }
      } else if (wasVisible) {
        const exitX = direction === "right" ? -40 : 40;
        gsap.to(card, { x: `${exitX}rem`, opacity: 0, scale: 0.5, rotation: direction === "right" ? -30 : 30, duration: reduceMotion ? 0 : 0.4, ease: "power2.in", zIndex: 0 });
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    prevVisible.current = new Set(visibleMap.keys());

    // Hover: lift the hovered card, push the others away from it.
    const visibleEntries: { el: HTMLElement; slot: number }[] = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot: number | null = null;
    let leaveTimer: ReturnType<typeof setTimeout> | null = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot: number | null) => {
      const mult = getWidthMultiplier(window.innerWidth);
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= 2.5 * hM;
            targetScale *= 1.08;
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const push = 8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= push * mult;
              targetRot -= 3 / (distance + 1);
            } else {
              targetX += push * mult;
              targetRot += 3 / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= hM;
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= hM;
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${targetX}rem`,
          y: `${targetY}rem`,
          rotation: targetRot,
          scale: targetScale,
          duration: reduceMotion ? 0 : 0.5,
          delay: reduceMotion ? 0 : delay,
          ease: "elastic.out(1,.75)",
          overwrite: "auto",
        });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimer = null;
        }
        if (activeSlot !== slot) {
          activeSlot = slot;
          updateHoverLayout(slot);
        }
      };
      el.addEventListener("mouseenter", handler);
      return { el, handler };
    });

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => {
        activeSlot = null;
        updateHoverLayout(null);
      }, 50);
    };
    container.addEventListener("mouseleave", onMouseLeave);

    const onResize = () => {
      if (!isAnimating.current) updateHoverLayout(activeSlot);
    };
    window.addEventListener("resize", onResize);

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener("mouseenter", handler));
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [centerIndex, totalCards, getVisibleMap, needsPagination]);

  if (!totalCards) return null;

  const cardClasses = cn(
    // Stacked in the middle; GSAP moves each one into its fan slot. Hidden until then.
    "absolute left-1/2 top-1/2 -ml-[4rem] -mt-[5.5rem] h-[11rem] w-[8rem] overflow-hidden rounded-xl opacity-0 shadow-[0_10px_40px_rgba(0,0,0,0.25)] will-change-transform",
    "min-[480px]:-ml-[5rem] min-[480px]:-mt-[7rem] min-[480px]:h-[14rem] min-[480px]:w-[10rem]",
    "sm:-ml-[6rem] sm:-mt-[8.5rem] sm:h-[17rem] sm:w-[12rem]",
    "md:-ml-[7.5rem] md:-mt-[10.5rem] md:h-[21rem] md:w-[15rem]",
    "lg:-ml-[9rem] lg:-mt-[12.5rem] lg:h-[25rem] lg:w-[18rem]",
    cardClassName,
  );

  return (
    <section
      className={cn(
        "relative z-20 flex w-full flex-col items-center overflow-x-clip px-4 py-4 md:px-8 lg:py-8",
        className,
      )}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") cycle("left");
        if (e.key === "ArrowRight") cycle("right");
      }}
    >
      <div
        ref={containerRef}
        className="relative h-[22rem] w-full max-w-[80rem] min-[480px]:h-[26rem] sm:h-[28rem] md:h-[34rem] lg:h-[38rem]"
      >
        {cards.map((card, index) => {
          const image = (
            <img
              src={card.imgUrl}
              loading="lazy"
              draggable={false}
              alt={card.alt || `Card ${index + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          );
          return card.linkUrl ? (
            <a
              key={index}
              data-fan-card
              href={card.linkUrl}
              target={card.linkUrl.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={cn(cardClasses, "block cursor-pointer")}
            >
              {image}
            </a>
          ) : (
            <div key={index} data-fan-card className={cardClasses}>
              {image}
            </div>
          );
        })}
      </div>

      {needsPagination && showControls && (
        <div className="z-30 mt-4 flex items-center justify-center gap-4 md:mt-6">
          <button type="button" className={ARROW_CLASSES} onClick={() => cycle("left")} aria-label="Previous">
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            {cards.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  i === centerIndex
                    ? "scale-[1.3] bg-black/70 dark:bg-white/80"
                    : "bg-black/15 dark:bg-white/15",
                )}
              />
            ))}
          </div>
          <button type="button" className={ARROW_CLASSES} onClick={() => cycle("right")} aria-label="Next">
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </section>
  );
}

export default CardFanCarousel;
