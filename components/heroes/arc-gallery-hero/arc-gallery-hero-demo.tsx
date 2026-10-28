"use client";

import { ArcGalleryHero } from "@/components/ui/arc-gallery-hero";

// No props = 12 Unsplash photos and the sample copy. Typical use:
// <ArcGalleryHero
//   images={[...urls]}
//   title="Your headline"
//   description="One or two lines."
//   primaryAction={{ label: "Get started", href: "/signup" }}
//   secondaryAction={{ label: "Learn more", href: "#features" }}   // or null to hide
// />
export default function ArcGalleryHeroDemo() {
  return <ArcGalleryHero />;
}
