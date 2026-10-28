"use client";

// Floating Card Gallery - a responsive grid of dark glassy article cards (image,
// title, excerpt, author avatar, category) floating in 3D. The whole grid tilts
// toward the mouse; hovering lifts a card with a glow; clicking flips an
// overlay with the full description, tags and a call-to-action.
//
// Source: 21st.dev "floating-card-gallery". Rewritten for GreficLib: TypeScript
// types, "use client", deterministic particles (no hydration mismatch), the
// missing `float` keyframes, Tailwind v4 opacity syntax, mouse tilt through
// motion values (no re-render per mouse move), reduced-motion support, and
// optional per-card links.

import * as React from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FloatingCard {
  title: string;
  description: string;
  /** Shown in the expanded overlay; falls back to `description`. */
  fullDescription?: string;
  image: string;
  avatar?: string;
  author?: string;
  category?: string;
  tags?: string[];
  /** Where the overlay's call-to-action goes. Omit to hide the button. */
  href?: string;
}

export interface FloatingCardGalleryProps {
  cards?: FloatingCard[];
  /** Background classes for the section. */
  backgroundClassName?: string;
  /** Glow colour around a hovered / opened card. */
  accentColor?: string;
  maxCards?: number;
  /** Label on the overlay's button. */
  ctaLabel?: string;
  /** How far the grid tilts toward the mouse, in degrees at the edge. 0 = flat. */
  tilt?: number;
  className?: string;
}

const IMG = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const floatingCardDefaults: FloatingCard[] = [
  {
    title: "Immersive Virtual Reality",
    description: "Explore how VR is transforming the way we interact with digital environments.",
    fullDescription: "Virtual Reality technology is revolutionizing industries from gaming to healthcare. By creating fully immersive digital environments, VR enables users to experience scenarios that would otherwise be impossible, dangerous, or prohibitively expensive in the real world.",
    image: IMG("1592478411213-6153e4ebc07d"),
    avatar: IMG("1494790108377-be9c29b29330", 96),
    author: "Sophia Chen",
    category: "Technology",
    tags: ["Virtual Reality", "Technology", "Innovation", "Digital Experience"],
    href: "#",
  },
  {
    title: "Quantum Computing Breakthroughs",
    description: "Recent advances in quantum computing are promising to solve previously impossible problems.",
    fullDescription: "Quantum computers leverage the strange properties of quantum mechanics to process information in ways that classical computers cannot. Recent breakthroughs have brought us closer to quantum supremacy, where quantum computers can solve problems that classical computers practically cannot.",
    image: IMG("1518770660439-4636190af475"),
    avatar: IMG("1507003211169-0a1dd7228f2d", 96),
    author: "Robert Jiang",
    category: "Science",
    tags: ["Quantum", "Computing", "Research", "Future Tech"],
    href: "#",
  },
  {
    title: "Fluid Architecture",
    description: "Curves, light and air: how new buildings are dissolving the straight line.",
    fullDescription: "Parametric design and new materials let architects shape buildings like landscapes. Flowing facades, open courtyards and sweeping ribbons of glass are redefining how city blocks feel to the people who live and work in them.",
    image: IMG("1518005020951-eccb494ad742"),
    avatar: IMG("1438761681033-6461ffad8d80", 96),
    author: "Emma Rodriguez",
    category: "Design",
    tags: ["Architecture", "Parametric", "Urban Design", "Form"],
    href: "#",
  },
  {
    title: "Neuroscience of Creativity",
    description: "New research reveals how the brain generates innovative ideas.",
    fullDescription: "Scientists are uncovering the neural mechanisms behind creative thinking. Using advanced imaging techniques, researchers can observe how different brain regions collaborate during creative processes, offering insights into how we might enhance innovative thinking.",
    image: IMG("1559757175-5700dde675bc"),
    avatar: IMG("1500648767791-00dcc994a43e", 96),
    author: "Marcus Taylor",
    category: "Science",
    tags: ["Neuroscience", "Creativity", "Brain", "Research"],
    href: "#",
  },
  {
    title: "Autonomous Transportation",
    description: "Self-driving vehicles are transforming how we think about mobility.",
    fullDescription: "Autonomous vehicles use a combination of sensors, cameras, radar, and artificial intelligence to navigate without human input. As this technology matures, it promises to reduce accidents, ease congestion, and provide mobility options for those who cannot drive.",
    image: IMG("1617788138017-80ad40651399"),
    avatar: IMG("1534528741775-53994a69daeb", 96),
    author: "Leila Johnson",
    category: "Technology",
    tags: ["Autonomous", "Transportation", "AI", "Future Mobility"],
    href: "#",
  },
  {
    title: "Deep Ocean Discoveries",
    description: "Exploring the mysteries of Earth's final frontier.",
    fullDescription: "The deep ocean remains one of the least explored regions on Earth. Recent expeditions have discovered new species, underwater geological features, and insights into how life adapts to extreme conditions. These discoveries have implications for medicine, climate science, and our understanding of life itself.",
    image: IMG("1582967788606-a171c1080cb0"),
    avatar: IMG("1506794778202-cad84cf45f1d", 96),
    author: "David Nakamura",
    category: "Environment",
    tags: ["Oceanography", "Marine Biology", "Exploration", "Discovery"],
    href: "#",
  },
];

// Deterministic "random" so server and client render the same particles.
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  size: seeded(i, 1) * 6 + 1,
  top: seeded(i, 2) * 100,
  left: seeded(i, 3) * 100,
  duration: seeded(i, 4) * 10 + 20,
  delay: seeded(i, 5) * 20,
}));

const KEYFRAMES = `
@keyframes fcg-float {
  0% { transform: translate3d(0, 0, 0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translate3d(20px, -120px, 0); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .fcg-particle { animation: none !important; } }
`;

export function FloatingCardGallery({
  cards = floatingCardDefaults,
  backgroundClassName = "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
  accentColor = "rgba(139, 92, 246, 0.5)",
  maxCards = 6,
  ctaLabel = "Learn More",
  tilt = 12,
  className,
}: FloatingCardGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Mouse position as -1..1 from the centre, smoothed; drives the grid tilt
  // without re-rendering React on every mouse move.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 20 });
  const sy = useSpring(my, { stiffness: 120, damping: 20 });
  const rotateY = useTransform(sx, (v) => v * tilt);
  const rotateX = useTransform(sy, (v) => -v * tilt);

  React.useEffect(() => {
    if (reduce || tilt === 0) return;
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mx.set(Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width / 2))));
      my.set(Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / (r.height / 2))));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, tilt, mx, my]);

  // Escape closes an open card.
  React.useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex]);

  const toggle = (index: number) => setActiveIndex((current) => (current === index ? null : index));
  const displayCards = cards.slice(0, maxCards);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden p-8",
        backgroundClassName,
        className,
      )}
      style={{ perspective: "1500px" }}
    >
      <style>{KEYFRAMES}</style>

      {/* Ambient background particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="fcg-particle absolute rounded-full bg-white/10"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: `${p.top}%`,
              left: `${p.left}%`,
              animation: `fcg-float ${p.duration}s linear infinite`,
              animationDelay: `-${p.delay}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 grid w-full max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {displayCards.map((card, index) => {
          const open = activeIndex === index;
          return (
            <motion.div
              key={card.title + index}
              className="group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-xl"
              onClick={() => toggle(index)}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={open}
              aria-label={card.title}
              initial={reduce ? false : { opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0, z: open ? 100 : 0, scale: open ? 1.05 : 1 }}
              transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={reduce ? undefined : { z: 30, scale: 1.03, transition: { duration: 0.2 } }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Glow */}
              <motion.div
                className="absolute -inset-0.5 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                animate={{ opacity: open ? 0.6 : undefined, boxShadow: `0 0 40px 2px ${accentColor}` }}
                transition={{ duration: 0.4 }}
                style={{ background: `linear-gradient(135deg, ${accentColor}, transparent 80%)` }}
              />

              {/* Card */}
              <div
                className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-800/80 p-6 backdrop-blur-sm"
                style={{ transformStyle: "preserve-3d", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              >
                <div
                  className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50 blur-xl"
                  style={{ transform: `translateZ(${10 + seeded(index, 6) * 10}px)` }}
                />

                <div className="mb-4 h-40 w-full overflow-hidden rounded-lg" style={{ transformStyle: "preserve-3d" }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ transform: "translateZ(20px)" }}
                  />
                </div>

                <div style={{ transform: "translateZ(30px)" }}>
                  <h3 className="mb-2 text-xl font-bold text-white">{card.title}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-300">{card.description}</p>
                </div>

                {(card.author || card.category) && (
                  <div className="mt-auto flex items-center justify-between" style={{ transform: "translateZ(40px)" }}>
                    <div className="flex items-center">
                      {card.avatar && (
                        <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-purple-500">
                          <img src={card.avatar} alt={card.author ?? ""} loading="lazy" className="h-full w-full object-cover" />
                        </div>
                      )}
                      {card.author && <span className="ml-2 text-xs text-slate-400">{card.author}</span>}
                    </div>
                    {card.category && (
                      <span className="rounded bg-slate-700 px-2 py-1 text-xs font-medium text-slate-300">{card.category}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded overlay */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    className="absolute inset-0 z-50 flex flex-col overflow-y-auto rounded-xl bg-slate-900/95 p-6 backdrop-blur-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: reduce ? 0 : 0.3 }}
                    style={{ transform: "translateZ(60px)" }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex(null);
                      }}
                      className="absolute right-4 top-4 text-slate-400 hover:text-white"
                      aria-label="Close"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <h2 className="mb-4 pr-8 text-2xl font-bold text-white">{card.title}</h2>
                    <p className="mb-6 text-sm text-slate-300">{card.fullDescription || card.description}</p>

                    {card.tags && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {card.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-purple-900/50 px-3 py-1 text-xs text-purple-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {card.href && (
                      <div className="mt-auto">
                        <a
                          href={card.href}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2 font-medium text-white transition hover:-translate-y-1 hover:from-violet-700 hover:to-fuchsia-700"
                        >
                          {ctaLabel}
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default FloatingCardGallery;
