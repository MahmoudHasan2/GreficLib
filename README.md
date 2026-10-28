<div align="center">

# GreficLib

**A personal library of animated, copy-paste React components for Next.js + Tailwind.**

🇬🇧 English · [🇩🇪 Deutsch](README.de.md)

![Components](https://img.shields.io/badge/components-18-6366f1)
![React](https://img.shields.io/badge/React-18%20%2F%2019-61dafb?logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000?logo=nextdotjs)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)

</div>

---

GreficLib collects visual components (carousels, galleries, heroes, backgrounds) mostly found on [21st.dev](https://21st.dev), and cleans each one up so it drops straight into a project:

- **Props-driven:** content (images, items, text) comes in through props, with sensible defaults so every component renders with no props at all.
- **Typed:** exported TypeScript props (`<Name>Props`) and item types.
- **SSR-safe:** `"use client"` where needed, no hydration mismatches.
- **Theme-aware:** light/dark handled, or documented in `meta.json`.
- **Documented:** every component ships with a demo file and a `meta.json` describing packages, props and tags.

There's no npm package. You copy a component file into your project, the same way [shadcn/ui](https://ui.shadcn.com) works.

## Preview

| | | |
|:---:|:---:|:---:|
| ![wheel-carousel](docs/previews/wheel-carousel.jpg)<br>`wheel-carousel` | ![works-wheel](docs/previews/works-wheel.jpg)<br>`works-wheel` | ![3d-carousel](docs/previews/3d-carousel.jpg)<br>`3d-carousel` |
| ![diagonal-marquee](docs/previews/diagonal-marquee.jpg)<br>`diagonal-marquee` | ![card-fan-carousel](docs/previews/card-fan-carousel.jpg)<br>`card-fan-carousel` | ![ink-flow-carousel](docs/previews/ink-flow-carousel.jpg)<br>`ink-flow-carousel` |
| ![ink-blot-carousel](docs/previews/ink-blot-carousel.jpg)<br>`ink-blot-carousel` | ![paper-curl-carousel](docs/previews/paper-curl-carousel.jpg)<br>`paper-curl-carousel` | ![polaroid-line-carousel](docs/previews/polaroid-line-carousel.jpg)<br>`polaroid-line-carousel` |
| ![ferris-wheel-gallery](docs/previews/ferris-wheel-gallery.jpg)<br>`ferris-wheel-gallery` | ![radial-wedge-gallery](docs/previews/radial-wedge-gallery.jpg)<br>`radial-wedge-gallery` | ![elevator-doors-gallery](docs/previews/elevator-doors-gallery.jpg)<br>`elevator-doors-gallery` |
| ![airplane-window-gallery](docs/previews/airplane-window-gallery.jpg)<br>`airplane-window-gallery` | ![scroll-gallery](docs/previews/scroll-gallery.jpg)<br>`scroll-gallery` | ![dye-whorl](docs/previews/dye-whorl.jpg)<br>`dye-whorl` |
| ![floating-card-gallery](docs/previews/floating-card-gallery.jpg)<br>`floating-card-gallery` | ![arc-gallery-hero](docs/previews/arc-gallery-hero.jpg)<br>`arc-gallery-hero` | ![hero-carousel](docs/previews/hero-carousel.jpg)<br>`hero-carousel` |

## Components

### Carousels

| Name | What it does | Packages |
|---|---|---|
| [`wheel-carousel`](components/carousels/wheel-carousel) | Curved vertical list of names; the photo beside it crossfades to the selected one | framer-motion, next-themes |
| [`works-wheel`](components/carousels/works-wheel) | Portfolio ring of cards around a title that opens into a 3D drum on scroll | – |
| [`3d-carousel`](components/carousels/3d-carousel) | Photos on a spinning 3D cylinder, click to open full size | framer-motion |
| [`diagonal-marquee`](components/carousels/diagonal-marquee) | Tilted rows of photo cards scrolling endlessly in alternating directions | – |
| [`card-fan-carousel`](components/carousels/card-fan-carousel) | Photo cards fanned like playing cards; hover lifts one, arrows page through | gsap, lucide-react |
| [`ink-flow-carousel`](components/carousels/ink-flow-carousel) | Fullscreen slider; photos ripple like ink, next slide pours in (WebGL fluid) | – |
| [`ink-blot-carousel`](components/carousels/ink-blot-carousel) | Fullscreen slider; next photo spreads in as an ink blot from where you tap (SVG) | – |
| [`paper-curl-carousel`](components/carousels/paper-curl-carousel) | Fullscreen slider; the photo curls over like a turning page (WebGL) | – |
| [`polaroid-line-carousel`](components/carousels/polaroid-line-carousel) | Polaroids pegged to a sagging string that swing as you drag | – |
| [`ferris-wheel-gallery`](components/carousels/ferris-wheel-gallery) | Ferris wheel with photo gondolas; turns to the chosen one | lucide-react |
| [`radial-wedge-gallery`](components/carousels/radial-wedge-gallery) | Disc of photo slices; the chosen slice widens and rotates to the top | lucide-react |
| [`elevator-doors-gallery`](components/carousels/elevator-doors-gallery) | Photos behind elevator doors; press a floor button to ride to it | – |
| [`airplane-window-gallery`](components/carousels/airplane-window-gallery) | Oval airplane windows with drifting destination views | – |
| [`scroll-gallery`](components/carousels/scroll-gallery) | Pinned fullscreen section; photos wipe in through strips on scroll | gsap, @gsap/react |

### Backgrounds

| Name | What it does | Packages |
|---|---|---|
| [`dye-whorl`](components/backgrounds/dye-whorl) | Monochrome ink swirling in water (WebGL fluid sim); the pointer stirs it | – |

### Cards

| Name | What it does | Packages |
|---|---|---|
| [`floating-card-gallery`](components/cards/floating-card-gallery) | Grid of glassy article cards that tilts toward the mouse; click opens details | framer-motion |

### Heroes

| Name | What it does | Packages |
|---|---|---|
| [`arc-gallery-hero`](components/heroes/arc-gallery-hero) | Photo cards fanned along an arc, with headline, text and two buttons | – |
| [`hero-carousel`](components/heroes/hero-carousel) | Editorial filmstrip hero; background re-grades to the focused card's colour | framer-motion |

The full notes (height requirements, CORS, React 19 / Tailwind v4 needs) are in [`catalog.md`](catalog.md) and in each component's `meta.json`.

## Project structure

```
GreficLib/
├── catalog.md                      # index of every component (start here)
├── CLAUDE.md                       # instructions for Claude Code (using & adding components)
├── components/
│   └── <category>/<name>/
│       ├── <name>.tsx              # the component → goes to components/ui/ in your project
│       ├── <name>-demo.tsx         # usage example with sample data
│       └── meta.json               # packages, props, tags, source, license
├── shared/lib/utils.ts             # the `cn` helper (clsx + tailwind-merge)
└── docs/previews/                  # screenshots used in this README
```

## Using a component

**Requirements:** a Next.js (App Router) project with Tailwind CSS and TypeScript, using the shadcn-style aliases `@/components/ui/...` and `@/lib/utils`.

1. Pick a component from the table above or from [`catalog.md`](catalog.md).
2. Copy `components/<category>/<name>/<name>.tsx` into your project's `components/ui/`.
3. If its `meta.json` lists `shared/lib/utils.ts` under `uses` and you don't have `lib/utils.ts` yet, copy it and install:
   ```bash
   npm install clsx tailwind-merge
   ```
4. Install the packages listed under `dependencies` in `meta.json`, for example:
   ```bash
   npm install framer-motion
   ```
5. Use the `<name>-demo.tsx` file as a reference for props, and swap in your own images and text.
6. If `needsHeight` is `true`, give the parent element a height (`h-screen`, `h-[600px]`, …).

```tsx
// app/page.tsx
import { WheelCarousel } from "@/components/ui/wheel-carousel";

export default function Page() {
  return (
    <main className="h-screen">
      <WheelCarousel />
    </main>
  );
}
```

### With Claude Code

The library is set up to be used through [Claude Code](https://claude.com/claude-code). `CLAUDE.md` tells it how to find, copy and install components. In any project you can say:

> Use the `wheel-carousel` component from the GreficLib library on the home page, and read the library's CLAUDE.md first.

Or describe what you need:

> From the GreficLib library, pick a component that fits a portfolio showcase.

## Adding a component

Open Claude Code in this folder, paste a 21st.dev link or the component code, and say *"add this to the library"*. `CLAUDE.md` describes the full process: naming, normalising props, writing the demo and `meta.json`, testing it in a Next.js app, and adding it to `catalog.md`.

If you paste the code yourself and it's too long for the chat, put it in `inbox/` as a file.

## Credits & license

Most components are adapted from community components published on [21st.dev](https://21st.dev) and by their original authors. The source of each one is listed in its `meta.json`. **Licenses vary by component.** Check the original source page before using one in a commercial project. `diagonal-marquee` is MIT ([Great UI](https://great-ui.com)).
