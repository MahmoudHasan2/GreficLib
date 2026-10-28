# GreficLib Catalog

One row per component. Path: `components/<category>/<name>/`. Full details in each `meta.json`.

## Carousels

| Name | What it looks like | Packages | Notes |
|---|---|---|---|
| `wheel-carousel` | Curved vertical list of names, photo beside it crossfades to the selected one | framer-motion, next-themes | Parent needs height. `mode`: light/dark/system/custom |
| `works-wheel` | Portfolio: ring of cards around a title that opens into a 3D drum on scroll | none | Parent needs height. `items` required |
| `3d-carousel` | Photos on a spinning 3D cylinder, click to open | framer-motion | `full-page.tsx` is a ready home page |
| `diagonal-marquee` | Tilted rows of photo cards scrolling endlessly in alternating directions, fades top/bottom | none | Good hero background. Default `h-screen` |
| `card-fan-carousel` | Photo cards fanned out like playing cards; hover lifts one, arrows page through 7+ | gsap, lucide-react | Springy GSAP animation. Self-sizing height |
| `ink-flow-carousel` | Fullscreen slider: photo ripples like ink under the pointer, next slide pours in as ink (WebGL fluid) | none | Images must allow CORS. Heavy - one per page, hero |
| `ink-blot-carousel` | Fullscreen slider: next photo spreads in as a ragged ink blot from where you tap; big serif titles | none | Lighter than ink-flow (SVG, no WebGL). Works with no images |
| `paper-curl-carousel` | Fullscreen slider: the photo curls over like a page turning (drag the edge), paper back + shadow | none | Images must allow CORS. Light WebGL. Editorial / magazine feel |
| `polaroid-line-carousel` | Polaroid photos pegged to a sagging string; drag and they slide and swing on their pegs | none | Playful / nostalgic. Works with no images |
| `ferris-wheel-gallery` | A Ferris wheel whose gondolas hold photo thumbnails; turns to the chosen one, big photo + title beside it | lucide-react | Tailwind v4 + React 19. Portfolio section, not fullscreen |
| `radial-wedge-gallery` | A disc of photo pie-slices; the chosen slice widens and rotates to the top, hub shows its title, opens full with an iris | lucide-react | Square section, React 19. Hover-driven |
| `elevator-doors-gallery` | Photos behind elevator doors: press a floor button, doors close, floors count up, doors open on the photo; step inside to zoom | none | Card (max 560px). Hotels / buildings / venues. Tailwind v4 + React 19 |
| `airplane-window-gallery` | Oval airplane windows with drifting destination views; shades swap them; click to fly through the window | none | Card 3:2. Travel / tourism / airlines. React 19 |
| `scroll-gallery` | Fullscreen section pins on scroll; next photo wipes in through horizontal strips, title band swaps | gsap, @gsap/react | Agency / featured work. Put in page flow, not a fixed-height box |

## Backgrounds

| Name | What it looks like | Packages | Notes |
|---|---|---|---|
| `dye-whorl` | Monochrome ink swirling in water (real WebGL fluid sim); pointer stirs it; content goes on top as children | none | Follows light/dark theme. Give it a height. Heavy - one per page |

## Cards

| Name | What it looks like | Packages | Notes |
|---|---|---|---|
| `floating-card-gallery` | Grid of dark glassy article cards (image, author, category) that tilts toward the mouse; click opens full text + tags + CTA | framer-motion | Always dark, purple glow. Blog / features / portfolio section |

## Heroes

| Name | What it looks like | Packages | Notes |
|---|---|---|---|
| `arc-gallery-hero` | Photo cards fanned along a half-circle arc, big headline + description + 2 buttons under it | none | Landing-page hero. Text/buttons are props. Follows theme |
| `hero-carousel` | Editorial filmstrip hero: focused card full height, others cut to half; background re-graded to its accent colour; big headline + meta | framer-motion | Fashion / events / lookbook. Parent needs height |
