"use client";

// Diagonal Marquee Carousel - rows of image cards scrolling endlessly, the whole
// stack tilted at an angle, with alternating directions and soft top/bottom fades.
//
// Based on the Great UI component by Saurabh Sharma (MIT License).
// https://great-ui.com - https://github.com/Saurabh-2607/GreatUI

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DiagonalMarqueeItem {
  /** Image URL. */
  url: string;
  /** Used as the image alt text. */
  title: string;
  id?: string | number;
}

export interface DiagonalMarqueeProps {
  cards?: DiagonalMarqueeItem[];
  /** Tilt of the whole stack, in degrees. @default -25 */
  angle?: number;
  /** Seconds for one loop of a row - higher is slower. @default 120 */
  baseSpeed?: number;
  /** Number of rows. @default 5 */
  rows?: number;
  /** Every other row scrolls the opposite way. @default true */
  alternateDirections?: boolean;
  /** Hovering a row pauses it. @default true */
  pauseOnHover?: boolean;
  /** Fade the top and bottom edges into the background. @default true */
  showFade?: boolean;
  /** Darkens each card so text on top stays readable. @default true */
  overlay?: boolean;
  className?: string;
  cardClassName?: string;
  /** Set the fade colour, e.g. "from-black" to match a dark section. */
  fadeClassName?: string;
}

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const diagonalMarqueeDefaultCards: DiagonalMarqueeItem[] = [
  { url: IMG("1506905925346-21bda4d32df4"), title: "Mountains" },
  { url: IMG("1470071459604-3b5ec3a7fe05"), title: "Foggy hills" },
  { url: IMG("1441974231531-c6227db76b6e"), title: "Forest" },
  { url: IMG("1507525428034-b723cf961d3e"), title: "Beach" },
  { url: IMG("1501785888041-af3ef285b470"), title: "Lake" },
  { url: IMG("1469474968028-56623f02e42e"), title: "Valley" },
];

// Each row runs a little faster or slower than the base so they drift apart.
const SPEED_OFFSETS = [0, -15, 15, -6, 24];
const MIN_SPEED = 20;

const KEYFRAMES = `
@keyframes dmq-left { from { transform: translate3d(0,0,0) } to { transform: translate3d(-50%,0,0) } }
@keyframes dmq-right { from { transform: translate3d(-50%,0,0) } to { transform: translate3d(0,0,0) } }
`;

function Card({
  card,
  overlay,
  className,
}: {
  card: DiagonalMarqueeItem;
  overlay: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-[200px] w-[270px] shrink-0 overflow-hidden rounded-xl shadow-2xl md:h-[300px] md:w-[400px]",
        className,
      )}
    >
      <img
        src={card.url}
        alt={card.title}
        loading="lazy"
        draggable={false}
        className="h-full w-full object-cover"
      />
      {overlay && <div className="absolute inset-0 bg-black/40" />}
    </div>
  );
}

function MarqueeRow({
  cards,
  speed,
  direction,
  pauseOnHover,
  overlay,
  cardClassName,
}: {
  cards: DiagonalMarqueeItem[];
  speed: number;
  direction: 1 | -1;
  pauseOnHover: boolean;
  overlay: boolean;
  cardClassName?: string;
}) {
  // Two identical halves; the track slides by exactly one half, so it loops seamlessly.
  const half = (suffix: string) => (
    <div className="flex shrink-0" aria-hidden={suffix === "b" || undefined}>
      {cards.map((card, i) => (
        <div key={`${card.id ?? i}-${i}-${suffix}`} className="shrink-0 pr-8">
          <Card card={card} overlay={overlay} className={cardClassName} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex w-full overflow-hidden">
      <div
        className={cn(
          "flex shrink-0 motion-reduce:[animation:none]",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={{
          animation: `${direction === -1 ? "dmq-left" : "dmq-right"} ${speed}s linear infinite`,
        }}
      >
        {half("a")}
        {half("b")}
      </div>
    </div>
  );
}

export function DiagonalMarquee({
  cards = diagonalMarqueeDefaultCards,
  angle = -25,
  baseSpeed = 120,
  rows = 5,
  alternateDirections = true,
  pauseOnHover = true,
  showFade = true,
  overlay = true,
  className,
  cardClassName,
  fadeClassName,
}: DiagonalMarqueeProps) {
  // Repeat so each row is wider than the rotated viewport, even with few cards.
  const rowCards = React.useMemo(() => [...cards, ...cards, ...cards], [cards]);
  const rowCardsReverse = React.useMemo(() => [...rowCards].reverse(), [rowCards]);

  return (
    <div
      className={cn(
        "relative flex h-screen w-full items-center justify-center overflow-hidden",
        className,
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div
        className="absolute z-0 flex w-[200vw] flex-col gap-8"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        {Array.from({ length: rows }, (_, i) => {
          const odd = i % 2 === 1;
          const speed = Math.max(
            MIN_SPEED,
            baseSpeed + SPEED_OFFSETS[i % SPEED_OFFSETS.length],
          );
          return (
            <MarqueeRow
              key={i}
              cards={odd ? rowCardsReverse : rowCards}
              speed={speed}
              direction={odd && alternateDirections ? 1 : -1}
              pauseOnHover={pauseOnHover}
              overlay={overlay}
              cardClassName={cardClassName}
            />
          );
        })}
      </div>

      {showFade && (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 z-10 h-1/4 bg-gradient-to-b from-white to-transparent dark:from-neutral-950",
              fadeClassName,
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/4 bg-gradient-to-t from-white to-transparent dark:from-neutral-950",
              fadeClassName,
            )}
          />
        </>
      )}
    </div>
  );
}

export default DiagonalMarquee;
