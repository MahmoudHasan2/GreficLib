"use client";

// Arc Gallery Hero - a full-screen hero with square photo cards fanned along a
// half-circle arc (each tilted with the curve), fading up one after another,
// and a centred headline, description and two buttons under the arc.
//
// Source: 21st.dev "arc-gallery-hero-component". Rewritten for GreficLib: text
// and buttons are props (buttons are links), shadcn theme colours instead of
// hard-coded gray/indigo, responsive radius/card size in CSS (no JS resize, no
// jump on mobile after hydration), scoped keyframes, reduced-motion support,
// and a local fallback instead of a remote placeholder image.

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ArcGalleryAction {
  label: string;
  href?: string;
}

export interface ArcGalleryHeroProps {
  images?: string[];
  /** Arc start / end in degrees (0 = right, 90 = top, 180 = left). */
  startAngle?: number;
  endAngle?: number;
  /** Arc radius in px: from 1024px, from 640px, and below. */
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  /** Card size in px at the same breakpoints. */
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: ArcGalleryAction | null;
  secondaryAction?: ArcGalleryAction | null;
  className?: string;
}

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=400&q=80&auto=format&fit=crop`;

export const arcGalleryDefaultImages = [
  "1506905925346-21bda4d32df4",
  "1501785888041-af3ef285b470",
  "1507525428034-b723cf961d3e",
  "1470071459604-3b5ec3a7fe05",
  "1441974231531-c6227db76b6e",
  "1519681393784-d120267933ba",
  "1475924156734-496f6cac6ec1",
  "1469474968028-56623f02e42e",
  "1464822759023-fed622ff2c3b",
  "1500534314209-a25ddb2bd429",
  "1433086966358-54859d0ed716",
  "1522383225653-ed111181a951",
].map(IMG);

export function ArcGalleryHero({
  images = arcGalleryDefaultImages,
  startAngle = 20,
  endAngle = 160,
  radiusLg = 480,
  radiusMd = 360,
  radiusSm = 260,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  title = "Rediscover Your Memories with AI",
  description = "Our intelligent platform finds, organizes, and brings your most cherished moments back to life.",
  primaryAction = { label: "Explore Your Past", href: "#" },
  secondaryAction = { label: "How It Works", href: "#" },
  className,
}: ArcGalleryHeroProps) {
  const scope = "arc" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  // Ensure at least 2 points to distribute angles along the arc.
  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  // Radius (--r) and card size (--c) per breakpoint, in CSS so the first paint
  // is already the right size on every screen.
  const css = `
.${scope}{--r:${radiusSm}px;--c:${cardSizeSm}px}
@media (min-width:640px){.${scope}{--r:${radiusMd}px;--c:${cardSizeMd}px}}
@media (min-width:1024px){.${scope}{--r:${radiusLg}px;--c:${cardSizeLg}px}}
@keyframes ${scope}-up{from{opacity:0;transform:translate(-50%,60%)}to{opacity:1;transform:translate(-50%,50%)}}
@keyframes ${scope}-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.${scope} .agh-card{opacity:0;animation:${scope}-up .8s ease-out forwards}
.${scope} .agh-copy{opacity:0;animation:${scope}-in .8s ease-out 800ms forwards}
@media (prefers-reduced-motion:reduce){.${scope} .agh-card,.${scope} .agh-copy{animation:none;opacity:1}}
`;

  return (
    <section
      className={cn(
        scope,
        "relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground",
        className,
      )}
    >
      <style>{css}</style>

      {/* Arc: pivot at the bottom centre, cards placed on the circle */}
      <div className="relative mx-auto w-full" style={{ height: "calc(var(--r) * 1.2)" }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          {images.map((src, i) => {
            const angle = startAngle + step * i;
            const rad = (angle * Math.PI) / 180;
            const cos = Math.cos(rad).toFixed(4);
            const sin = Math.sin(rad).toFixed(4);
            return (
              <div
                key={src + i}
                className="agh-card absolute"
                style={{
                  width: "var(--c)",
                  height: "var(--c)",
                  left: `calc(50% + var(--r) * ${cos})`,
                  bottom: `calc(var(--r) * ${sin})`,
                  transform: "translate(-50%, 50%)",
                  animationDelay: `${i * 100}ms`,
                  zIndex: count - i,
                }}
              >
                <div
                  className="h-full w-full overflow-hidden rounded-2xl bg-muted shadow-xl ring-1 ring-border transition-transform hover:scale-105"
                  style={{ transform: `rotate(${angle / 4}deg)` }}
                >
                  <img
                    src={src}
                    alt=""
                    loading={i < 6 ? "eager" : "lazy"}
                    className="block h-full w-full object-cover"
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Copy under the arc */}
      <div className="relative z-10 -mt-40 flex flex-1 items-center justify-center px-6 md:-mt-52 lg:-mt-64">
        <div className="agh-copy max-w-2xl px-6 text-center">
          {title && <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>}
          {description && <p className="mt-4 text-lg text-muted-foreground">{description}</p>}
          {(primaryAction || secondaryAction) && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {primaryAction && (
                <a
                  href={primaryAction.href ?? "#"}
                  className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl sm:w-auto"
                >
                  {primaryAction.label}
                </a>
              )}
              {secondaryAction && (
                <a
                  href={secondaryAction.href ?? "#"}
                  className="w-full rounded-full border border-border px-6 py-3 transition-all duration-200 hover:bg-accent hover:text-accent-foreground sm:w-auto"
                >
                  {secondaryAction.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ArcGalleryHero;
