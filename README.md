# Niharika Artist — niharikartist.shop

Next.js (App Router) + TypeScript + Tailwind rebuild of the artist portfolio/shop.
All content (gallery, shop, bio) was pulled from the live site's own `/api/site-data`
endpoint and is now stored as static, editable data files — see below.

## Run locally

```bash
npm install
npm run dev
```

## Set the WhatsApp number

There was no phone number anywhere on the original site, so every WhatsApp button
currently points at a placeholder. Before going live, edit one line:

`src/data/siteConfig.ts` → `WHATSAPP_NUMBER` (digits only, country code first, e.g.
`"919876543210"`). Every CTA — floating button, nav, hero, shop enquiry, contact
page — reads from this single constant via `src/lib/whatsapp.ts`.

## Update content

Everything is plain TypeScript data, no CMS/database:

- `src/data/gallery.ts` — the 50 portfolio pieces (title, description, year, category, image)
- `src/data/shop.ts` — the 13 items for sale (adds price, availability)
- `src/data/artist.ts` — bio, awards, profile/hero images, email, location, social links
- `src/data/siteConfig.ts` — site name, nav, WhatsApp number

Add/remove/edit an object in the relevant array and the corresponding page, card,
filter, sitemap entry, and (for shop) static detail page at `/shop/[slug]`
regenerate automatically on next build — nothing else to touch.

`scripts/gen-data.mjs` is the one-off script originally used to generate these
files from the live site's JSON; it's not part of the app and doesn't need to run
again unless you're re-importing from that source.

## Architecture notes / assumptions

- **No live admin/CMS backend.** The original site had a `/login` admin panel backed
  by a database. This rebuild trades that for flat data files, which is simpler to
  host, free, and just as easy to edit for a solo artist maintaining their own site.
  If a self-service editing UI becomes a real need later, that's a distinct project.
- **Shop → WhatsApp enquiry, not checkout.** The old "Add to Cart" buttons had no
  payment gateway behind them. Product pages now enquire via WhatsApp instead,
  per the brief.
- **Contact form → `mailto:`.** No backend/email-service credentials exist to send
  mail server-side, so the form validates client-side and opens the visitor's email
  client pre-filled to `niharikaananthoja@gmail.com`. WhatsApp is offered as the
  faster alternative alongside it.
- **Images are served unoptimized** (`next.config.ts`) — they're hotlinked from
  ibb.co, a free image host that times out under Next's server-side re-fetch/resize.
  If this ever needs real optimization, migrate the images to proper storage
  (Cloudinary, Vercel Blob, S3) first, then flip `images.unoptimized` off.
- **`contactMessages`** in the original site's data (real customer emails/enquiries)
  was deliberately not carried over anywhere — it's private correspondence, not
  site content.

## Deploy

Any Next.js host works (Vercel is the path of least resistance — connect the repo,
no environment variables required). `next build && next start`, or `next build`
with static export hosting since every route is static except `/gallery` (uses
`searchParams` for the category filter, so it's server-rendered — cheap either way).

## QA performed

Production build, ESLint, and a headless-browser pass across every route: nav
(desktop + mobile menu, scroll-lock, close-on-navigate), gallery category filter,
lightbox (open/arrow-key nav/Escape), shop detail pages, contact form validation,
404 page, and console/network error checks. All clean.
