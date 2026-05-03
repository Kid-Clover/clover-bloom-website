# Kid Clover Website — Design Rebuild

A fresh, breathtaking redesign of drinkkidclover.com focused purely on look-and-feel and structure. No auth, no live Square integration, no event sign-up backend yet — those can be layered in later.

## Brand System

**Color palette** (from your swatch):
- Red Clover (magenta/pink) — primary brand accent
- Lavender — secondary
- Olive — botanical / nature anchor
- Brown — grounding / earth tones
- Orange, Yellow, Blue — playful accent set for icons and section highlights
- Cream/off-white background to keep the warm, kid-friendly feel from the current site

**Typography**: Abril Fatface (headings — playful, storybook display) + Cabin (body — friendly, readable).

**Iconography**: Reuse the existing Kid Clover logo and flower characters from the current site, plus new hand-drawn SVG accents (sprigs, suns, cups, doodles) sprinkled throughout for that crayon-on-paper feel.

## Pages

### 1. Home (`/`)
- Sticky header with logo + nav (Home / About / Events / Shop / Gallery)
- **Hero**: full-width image carousel of plants/farm/kids, big storybook slogan overlay ("Connecting kids to the magic of plants" or your update), prominent **Learn More** button → `/about`
- **Featured products grid**: 3–4 tea cards pulling from Shop
- **Mission** band with hand-drawn flower accents
- **Upcoming events** preview (next 3) → links to `/events`
- **Gallery teaser** strip → `/gallery`
- Footer with social links + brand mark

### 2. About / Learn More (`/about`)
- Editorial layout: portrait + storytelling sections
- Bio of your wife — herbalism journey, farming, motherhood, why she created Kid Clover
- Pull-quotes and decorative flower doodles between sections
- Placeholder copy you can edit/replace

### 3. Events (`/events`)
- Monthly calendar grid (prev/next month nav)
- Event dots/chips on dates
- Click a date or event → modal with image, description, location, time, and a **Sign up** button (stubbed — opens an "RSVP coming soon" message or external link field per event)
- Seeded with a handful of sample events (popups, farmers markets, classes)

### 4. Shop (`/shop`)
- Product grid (cards with image, name, short description, price)
- Click card → product detail **modal** with larger image, full description, ingredients, price
- **Buy Now** button → opens Square checkout URL in new tab (each product has its own URL field; placeholder links for now, you swap in real Square links per product)
- Note: cart persistence on Square is automatic when each product points to the same Square store

### 5. Gallery (`/gallery`)
- Masonry-style image grid of plants, farms, sourcing
- Lightbox on click (full-screen image with prev/next)
- Placeholder photos to start; easy to swap

## Navigation & UX
- Responsive — mobile-first, hamburger menu on small screens
- Smooth page transitions
- Hand-drawn SVG accents (squiggles, leaves, stars) as section dividers
- Hover states with playful micro-animations (gentle wiggle/bounce on icons)

## What's NOT in this plan (deferred)
- Authentication (skipped per your request)
- Real Square API integration (using outbound checkout links instead — easiest path)
- Real event RSVP backend (button is stubbed)
- CMS / admin for managing events and products (you'd edit a data file for now, or we add Lovable Cloud later)

## Technical notes
- TanStack Start with file-based routes: `index.tsx`, `about.tsx`, `events.tsx`, `shop.tsx`, `gallery.tsx`
- Brand tokens added to `src/styles.css` as CSS variables (`--clover-red`, `--lavender`, `--olive`, etc.)
- Fonts loaded via Google Fonts in root head
- Product and event data stored as typed TS arrays in `src/data/` — easy to edit later or migrate to a database
- All images placed in `src/assets/` (or `public/` for ones referenced from CSS)

After approval I'll pull the existing logo/character art from drinkkidclover.com to seed the design, then build all five pages.
