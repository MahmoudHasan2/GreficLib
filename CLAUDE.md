# GreficLib - personal UI component library

Visual React components (mostly from 21st.dev), cleaned up for reuse.
Stack: Next.js (App Router) + Tailwind + TypeScript, shadcn folder layout.

## Layout

```
catalog.md                     index of every component - read this first
components/<category>/<name>/
  <name>.tsx                   the component -> goes to components/ui/ in a project
  <name>-demo.tsx              usage example with sample data
  meta.json                    packages, props, tags, source, license
shared/lib/utils.ts            the `cn` helper (clsx + tailwind-merge)
```

## Using a component in a project

When asked to use a component from this library (by name or by description):

1. Find it in `catalog.md`. If the request is a description ("something circular for a portfolio"), match against `description` and `tags` in the `meta.json` files and suggest the best one or two.
2. Copy `<name>.tsx` into the project's `components/ui/`.
3. If `meta.json` lists `shared/lib/utils.ts` in `uses` and the project has no `lib/utils.ts`, copy it and `npm install clsx tailwind-merge`.
4. `npm install` the packages in `dependencies`.
5. Use the demo file as the reference for props. Replace sample images and text with the project's content.
6. If `needsHeight` is true, give the parent a height (`h-screen`, `h-[600px]`...).

Imports inside components use the `@/components/ui/...` and `@/lib/utils` aliases.

## Adding a new component

The user sends a 21st.dev link or code. For each one:

1. Get the code (the user's paste, or the page's install command / registry JSON). Check the first filename in the prompt matches the component the user named - they have pasted the wrong prompt before. Chat pastes cut off at 50k characters: if the code ends mid-line, ask for it as a file in `inbox/` (21st.dev's registry needs a login, so it can't be fetched directly).
2. Pick a short kebab-case `name` that is not in `catalog.md`, and a category. Reuse existing categories: `carousels`, `heroes`, `backgrounds`, `text-effects`, `buttons`, `cards`, `navigation`, `pricing`, `testimonials`, `footers`, `forms`, `loaders`, `3d`. Add a new one only if none fits.
3. Normalise the component:
   - content comes in through props (items, images, text), with sensible defaults so it renders with no props;
   - `"use client"` where it uses hooks or events;
   - no hydration mismatches (read browser-only values after mount);
   - TypeScript props exported (`<Name>Props`, item types);
   - light/dark handled, or noted in `meta.json`.
4. Write `<name>.tsx`, `<name>-demo.tsx`, `meta.json` (same fields as the existing ones, `source` = the link, `added` = today).
5. Test it in a real Next.js app (the user's test project, e.g. `C:\Users\wobta\Downloads\qq`): copy in, add `app/<name>/page.tsx` rendering the demo, add `<name>` to the `PAGES` list in `app/page.tsx` (the test index), `npm run build`. Tell the user the URL: `http://localhost:3000/<name>`.
6. Add a row to `catalog.md` under its category.
7. Update the showcase (`C:\Users\wobta\Desktop\greficlib-showcase`, see its README): `npm run sync`, `npm run build`, restart `npm start`, `ONLY=<name> npm run previews`, restart again.
