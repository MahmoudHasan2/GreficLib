"use client";

import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";

// Placeholder art from Unsplash. Swap the photos and the titles for your own
// index - the wheel sizes its ring to however many pieces it is handed.
const ART = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

const WORKS: WorksWheelItem[] = [
  {
    title: "Prismatic Rift",
    image: ART("1541701494587-cb58502866ab"),
    href: "#prismatic-rift",
  },
  {
    title: "Ember Clouds",
    image: ART("1462331940025-496dfbfc7564"),
    href: "#ember-clouds",
  },
  {
    title: "Neon Portal",
    image: ART("1550684848-fac1c5b4e853"),
    href: "#neon-portal",
  },
  {
    title: "Red Ribbon",
    image: ART("1557672172-298e090bd0f1"),
    href: "#red-ribbon",
  },
  {
    title: "Celestial",
    image: ART("1506318137071-a8e063b4bec0"),
    href: "#celestial",
  },
  {
    title: "Uplight",
    image: ART("1614850523459-c2f4c699c52e"),
    href: "#uplight",
  },
  {
    title: "Indigo Marble",
    image: ART("1579546929518-9e396f3cc809"),
    href: "#indigo-marble",
  },
  {
    title: "Launch Window",
    image: ART("1517976487492-5750f3195933"),
    href: "#launch-window",
  },
  {
    title: "Cosmic Wave",
    image: ART("1446776811953-b23d57bd21aa"),
    href: "#cosmic-wave",
  },
];

export default function WorksWheelDemo() {
  return (
    <div className="bg-background text-foreground w-full h-screen">
      <WorksWheel items={WORKS} label="Works '26" action="View" />
    </div>
  );
}
