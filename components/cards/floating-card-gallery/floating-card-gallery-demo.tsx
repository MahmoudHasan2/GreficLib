"use client";

import { FloatingCardGallery } from "@/components/ui/floating-card-gallery";

// No `cards` = six sample articles (Unsplash). Pass your own:
// cards={[{ title, description, image, fullDescription?, avatar?, author?, category?, tags?, href? }, ...]}
// Change the look with backgroundClassName (Tailwind classes) and accentColor (glow).
export default function FloatingCardGalleryDemo() {
  return <FloatingCardGallery />;
}
