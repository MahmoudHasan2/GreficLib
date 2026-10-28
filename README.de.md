<div align="center">

# GreficLib

**Eine persönliche Bibliothek animierter React-Komponenten zum Kopieren für Next.js + Tailwind.**

[🇬🇧 English](README.md) · 🇩🇪 Deutsch

![Komponenten](https://img.shields.io/badge/Komponenten-18-6366f1)
![React](https://img.shields.io/badge/React-18%20%2F%2019-61dafb?logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000?logo=nextdotjs)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)

</div>

---

GreficLib sammelt visuelle Komponenten (Karussells, Galerien, Hero-Bereiche, Hintergründe), die meisten davon von [21st.dev](https://21st.dev), und bereinigt jede so, dass sie sich direkt in ein Projekt einfügen lässt:

- **Über Props gesteuert:** Inhalte (Bilder, Einträge, Texte) kommen über Props. Sinnvolle Standardwerte sorgen dafür, dass jede Komponente auch ganz ohne Props funktioniert.
- **Typisiert:** exportierte TypeScript-Props (`<Name>Props`) und Item-Typen.
- **SSR-sicher:** `"use client"` wo nötig, keine Hydration-Fehler.
- **Theme-fähig:** Hell/Dunkel ist umgesetzt oder in `meta.json` dokumentiert.
- **Dokumentiert:** Jede Komponente hat eine Demo-Datei und eine `meta.json` mit Paketen, Props und Tags.

Es gibt kein npm-Paket. Du kopierst die Komponentendatei in dein Projekt, genau wie bei [shadcn/ui](https://ui.shadcn.com).

## Vorschau

| | | |
|:---:|:---:|:---:|
| ![wheel-carousel](docs/previews/wheel-carousel.jpg)<br>`wheel-carousel` | ![works-wheel](docs/previews/works-wheel.jpg)<br>`works-wheel` | ![3d-carousel](docs/previews/3d-carousel.jpg)<br>`3d-carousel` |
| ![diagonal-marquee](docs/previews/diagonal-marquee.jpg)<br>`diagonal-marquee` | ![card-fan-carousel](docs/previews/card-fan-carousel.jpg)<br>`card-fan-carousel` | ![ink-flow-carousel](docs/previews/ink-flow-carousel.jpg)<br>`ink-flow-carousel` |
| ![ink-blot-carousel](docs/previews/ink-blot-carousel.jpg)<br>`ink-blot-carousel` | ![paper-curl-carousel](docs/previews/paper-curl-carousel.jpg)<br>`paper-curl-carousel` | ![polaroid-line-carousel](docs/previews/polaroid-line-carousel.jpg)<br>`polaroid-line-carousel` |
| ![ferris-wheel-gallery](docs/previews/ferris-wheel-gallery.jpg)<br>`ferris-wheel-gallery` | ![radial-wedge-gallery](docs/previews/radial-wedge-gallery.jpg)<br>`radial-wedge-gallery` | ![elevator-doors-gallery](docs/previews/elevator-doors-gallery.jpg)<br>`elevator-doors-gallery` |
| ![airplane-window-gallery](docs/previews/airplane-window-gallery.jpg)<br>`airplane-window-gallery` | ![scroll-gallery](docs/previews/scroll-gallery.jpg)<br>`scroll-gallery` | ![dye-whorl](docs/previews/dye-whorl.jpg)<br>`dye-whorl` |
| ![floating-card-gallery](docs/previews/floating-card-gallery.jpg)<br>`floating-card-gallery` | ![arc-gallery-hero](docs/previews/arc-gallery-hero.jpg)<br>`arc-gallery-hero` | ![hero-carousel](docs/previews/hero-carousel.jpg)<br>`hero-carousel` |

## Komponenten

### Karussells

| Name | Beschreibung | Pakete |
|---|---|---|
| [`wheel-carousel`](components/carousels/wheel-carousel) | Gebogene vertikale Namensliste; das Foto daneben blendet zum gewählten Eintrag über | framer-motion, next-themes |
| [`works-wheel`](components/carousels/works-wheel) | Portfolio-Ring aus Karten um einen Titel, der sich beim Scrollen zu einer 3D-Trommel öffnet | – |
| [`3d-carousel`](components/carousels/3d-carousel) | Fotos auf einem rotierenden 3D-Zylinder, Klick öffnet sie in voller Größe | framer-motion |
| [`diagonal-marquee`](components/carousels/diagonal-marquee) | Schräge Reihen von Fotokarten, die endlos in wechselnden Richtungen laufen | – |
| [`card-fan-carousel`](components/carousels/card-fan-carousel) | Fotokarten wie ein Fächer aus Spielkarten; Hover hebt eine an, Pfeile blättern weiter | gsap, lucide-react |
| [`ink-flow-carousel`](components/carousels/ink-flow-carousel) | Vollbild-Slider; Fotos kräuseln sich wie Tinte, die nächste Folie fließt hinein (WebGL) | – |
| [`ink-blot-carousel`](components/carousels/ink-blot-carousel) | Vollbild-Slider; das nächste Foto breitet sich als Tintenklecks vom Tippunkt aus (SVG) | – |
| [`paper-curl-carousel`](components/carousels/paper-curl-carousel) | Vollbild-Slider; das Foto rollt sich wie eine umgeblätterte Seite ein (WebGL) | – |
| [`polaroid-line-carousel`](components/carousels/polaroid-line-carousel) | Polaroids an einer durchhängenden Schnur, die beim Ziehen schwingen | – |
| [`ferris-wheel-gallery`](components/carousels/ferris-wheel-gallery) | Riesenrad mit Foto-Gondeln; dreht sich zur gewählten Gondel | lucide-react |
| [`radial-wedge-gallery`](components/carousels/radial-wedge-gallery) | Scheibe aus Foto-Segmenten; das gewählte Segment wird breiter und dreht sich nach oben | lucide-react |
| [`elevator-doors-gallery`](components/carousels/elevator-doors-gallery) | Fotos hinter Aufzugtüren; Etagenknopf drücken und hinfahren | – |
| [`airplane-window-gallery`](components/carousels/airplane-window-gallery) | Ovale Flugzeugfenster mit vorbeiziehenden Reisezielen | – |
| [`scroll-gallery`](components/carousels/scroll-gallery) | Fixierter Vollbildbereich; Fotos wischen beim Scrollen in Streifen herein | gsap, @gsap/react |

### Hintergründe

| Name | Beschreibung | Pakete |
|---|---|---|
| [`dye-whorl`](components/backgrounds/dye-whorl) | Monochrome Tinte, die in Wasser wirbelt (WebGL-Fluidsimulation); der Mauszeiger rührt sie um | – |

### Karten

| Name | Beschreibung | Pakete |
|---|---|---|
| [`floating-card-gallery`](components/cards/floating-card-gallery) | Raster aus gläsernen Artikelkarten, das sich zur Maus neigt; Klick öffnet Details | framer-motion |

### Hero-Bereiche

| Name | Beschreibung | Pakete |
|---|---|---|
| [`arc-gallery-hero`](components/heroes/arc-gallery-hero) | Fotokarten entlang eines Bogens, darunter Überschrift, Text und zwei Buttons | – |
| [`hero-carousel`](components/heroes/hero-carousel) | Editorialer Filmstreifen-Hero; der Hintergrund nimmt die Farbe der aktiven Karte an | framer-motion |

Alle Hinweise (benötigte Höhe, CORS, React 19 / Tailwind v4) stehen in [`catalog.md`](catalog.md) und in der `meta.json` jeder Komponente.

## Projektstruktur

```
GreficLib/
├── catalog.md                      # Übersicht aller Komponenten (hier anfangen)
├── CLAUDE.md                       # Anleitung für Claude Code (Komponenten nutzen & hinzufügen)
├── components/
│   └── <kategorie>/<name>/
│       ├── <name>.tsx              # die Komponente → kommt in components/ui/ deines Projekts
│       ├── <name>-demo.tsx         # Anwendungsbeispiel mit Beispieldaten
│       └── meta.json               # Pakete, Props, Tags, Quelle, Lizenz
├── shared/lib/utils.ts             # der `cn`-Helper (clsx + tailwind-merge)
└── docs/previews/                  # Screenshots für diese README
```

## Eine Komponente verwenden

**Voraussetzungen:** ein Next.js-Projekt (App Router) mit Tailwind CSS und TypeScript und den shadcn-Aliasen `@/components/ui/...` und `@/lib/utils`.

1. Wähle eine Komponente aus der Tabelle oben oder aus [`catalog.md`](catalog.md).
2. Kopiere `components/<kategorie>/<name>/<name>.tsx` nach `components/ui/` in deinem Projekt.
3. Wenn die `meta.json` unter `uses` `shared/lib/utils.ts` aufführt und du noch keine `lib/utils.ts` hast, kopiere sie und installiere:
   ```bash
   npm install clsx tailwind-merge
   ```
4. Installiere die Pakete, die in der `meta.json` unter `dependencies` stehen, zum Beispiel:
   ```bash
   npm install framer-motion
   ```
5. Nutze die Datei `<name>-demo.tsx` als Referenz für die Props und ersetze Bilder und Texte durch deine eigenen.
6. Wenn `needsHeight` auf `true` steht, gib dem Elternelement eine Höhe (`h-screen`, `h-[600px]`, …).

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

### Mit Claude Code

Die Bibliothek ist für die Nutzung mit [Claude Code](https://claude.com/claude-code) eingerichtet. `CLAUDE.md` beschreibt, wie Komponenten gefunden, kopiert und installiert werden. In jedem Projekt kannst du zum Beispiel sagen:

> Verwende die Komponente `wheel-carousel` aus der GreficLib-Bibliothek auf der Startseite und lies zuerst die CLAUDE.md der Bibliothek.

Oder beschreibe, was du brauchst:

> Wähle aus der GreficLib-Bibliothek eine passende Komponente für ein Portfolio.

## Eine Komponente hinzufügen

Öffne Claude Code in diesem Ordner, füge einen 21st.dev-Link oder den Code ein und sag *„füge das zur Bibliothek hinzu“*. `CLAUDE.md` beschreibt den ganzen Ablauf: Benennung, Props vereinheitlichen, Demo und `meta.json` schreiben, in einer Next.js-App testen und in `catalog.md` eintragen.

Wenn du den Code selbst einfügst und er für den Chat zu lang ist, lege ihn als Datei in `inbox/` ab.

## Credits & Lizenz

Die meisten Komponenten sind Bearbeitungen von Community-Komponenten, die auf [21st.dev](https://21st.dev) und von ihren ursprünglichen Autoren veröffentlicht wurden. Die Quelle jeder Komponente steht in ihrer `meta.json`. **Die Lizenzen unterscheiden sich je nach Komponente.** Prüfe vor einer kommerziellen Nutzung die ursprüngliche Quellseite. `diagonal-marquee` steht unter MIT-Lizenz ([Great UI](https://great-ui.com)).
