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

## Admin panel

A lightweight `/admin` panel lets you edit shop pricing/availability, add new
products, and manage admin accounts — no database required.

- **Accounts.** Up to 3 admins can be registered at `/admin/register`. Once all 3
  seats are used, an existing admin has to sign in and remove one (from the
  Admins section of the dashboard) before a new one can register. Passwords are
  hashed (`scrypt`) and stored in `data/admins.json`, which is gitignored — it
  never gets committed, even after local testing.
- **Sign in / out** at `/admin/login`. Sessions are a signed cookie (HMAC'd with
  `AUTH_SECRET`), so there's no session table to manage.
- **Forgot password** at `/admin/forgot-password` emails a reset link via Resend
  if `RESEND_API_KEY` is set; otherwise the link is logged to the server console
  so the flow still works in local dev without a real email account. Reset links
  expire after 30 minutes and — because the link is bound to the current password
  hash — stop working the instant they're used once, even within that window.
- **Shop editing.** Each row has its own Save button, plus a "Save all" button on
  the dashboard that batches every changed row into one request. "Add product"
  creates a brand-new listing (stored separately from the seed data in
  `src/data/shop.ts`, so nothing there is ever overwritten) that appears on
  `/shop` and gets its own `/shop/[slug]` page immediately.
- **Persistence caveat.** All of this is backed by JSON files under `data/`,
  written with plain `fs`. That's fully durable in local dev or on a host with a
  persistent disk. It is **not** reliable on serverless hosting (Vercel, Netlify
  functions) — the filesystem there is ephemeral, so a write from one request
  isn't guaranteed to still be there on the next. See the Vercel section below
  for what that means in practice and how to upgrade past it.
- **Shop → WhatsApp enquiry, not checkout.** The old "Add to Cart" buttons had no
  payment gateway behind them. Product pages now enquire via WhatsApp instead,
  per the brief.
- **Contact form → `mailto:`.** No backend/email-service credentials exist to send
  mail server-side, so the form validates client-side and opens the visitor's email
  client pre-filled to `niharikaananthoja@gmail.com`. WhatsApp is offered as the
  faster alternative alongside it.
- **Images route through a custom loader** (`src/lib/image-loader.ts`) instead of
  Next's built-in optimizer. The source photos are un-resized phone uploads
  (1-2MB+) hotlinked from ibb.co, and Next's own server-side fetch/resize times
  out against that host. The custom loader proxies through wsrv.nl (a resizing
  image CDN) instead — real byte savings (~98% smaller) without Next ever making
  the flaky request itself. If this ever needs to change, migrate the source
  images to real storage (Cloudinary, Vercel Blob, S3) and switch back to
  Next's default loader.
- **3D/animation stack:** GSAP (`ScrollTrigger` for scroll reveals, a 3D-flip
  lightbox transition, hero text stagger) and `@react-three/fiber` + `drei` for
  the hero's floating gallery-ring (real artwork as textured planes, auto-
  rotating with mouse parallax). The WebGL scene is dynamically imported
  (`ssr: false`) and skipped outright on mobile, no-WebGL, and
  `prefers-reduced-motion` — the static hero photo underneath is a complete
  hero on its own, so nothing is lost when it's skipped. `useTilt3D`
  (`src/lib/useTilt3D.ts`) adds a cheap CSS-3D hover tilt to artwork/category
  cards site-wide without any WebGL cost.
  - Gotcha worth knowing if you touch `GalleryRing.tsx`: drei's `<Image>`
    suspends on texture load, so each plane needs its own `<Suspense>`
    boundary or the whole ring silently fails to render.
- **`contactMessages`** in the original site's data (real customer emails/enquiries)
  was deliberately not carried over anywhere — it's private correspondence, not
  site content.

## Deploy to Vercel

1. **Push to GitHub** (or GitLab/Bitbucket) if you haven't already — Vercel deploys
   from a connected repo.
2. **Import the project** at [vercel.com/new](https://vercel.com/new) → select this
   repo. Framework preset auto-detects as Next.js; no build settings to change.
3. **Set environment variables** (Project Settings → Environment Variables, or on
   the import screen) — everything in `.env.example`:
   - `AUTH_SECRET` — required to enable `/admin` at all. Generate one locally with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
     and paste the output in. Without this set, `/admin/login` and
     `/admin/register` render a "not set up yet" message instead of a form.
   - `RESEND_API_KEY` — optional. Sign up at [resend.com](https://resend.com), get
     an API key, add it here to make "forgot password" actually send email.
     Without it, reset links are logged server-side (visible in the Vercel
     function logs) instead of emailed — usable for testing, not for a real
     forgotten-password admin.
   - `RESEND_FROM_EMAIL` — optional, defaults to Resend's shared sandbox sender.
     Set this to your own verified domain sender once you've set one up in
     Resend, or the sandbox default will do for a demo.
   - `WHATSAPP_NUMBER` isn't an env var — it's set directly in
     `src/data/siteConfig.ts` (see above), so nothing to configure here for it.
4. **Deploy.** Vercel builds and gives you a `*.vercel.app` URL immediately;
   attach a custom domain afterwards under Project Settings → Domains.
5. **Know the admin-panel limitation on Vercel.** Vercel's serverless functions
   don't share a persistent filesystem — writes to `data/*.json` (shop edits, new
   products, new admin accounts) can vanish between requests instead of
   sticking. This is fine for a client demo of the *flow* (register, sign in,
   edit, save), but don't rely on data persisting long-term in that
   configuration. To make it durable in production, swap the `fs`-based
   read/write calls in `src/lib/adminStore.ts` and `src/lib/shopOverrides.ts` for
   [Vercel KV](https://vercel.com/docs/storage/vercel-kv) or a small database —
   every caller (API routes, admin pages) goes through those two files' exported
   functions, so nothing else needs to change.

Any other Next.js host that gives you a persistent filesystem (a VPS, Railway,
Render, etc. running `next build && next start`) doesn't have that caveat —
`data/*.json` just works as real, durable storage there.

## QA performed

Production build, ESLint, and a headless-browser pass across every route: nav
(desktop + mobile menu, scroll-lock, close-on-navigate), gallery category filter,
lightbox (open/arrow-key nav/Escape/3D-flip transition), shop detail pages,
contact form validation, 404 page, the hero's 3D scene (renders, skips
correctly on mobile/reduced-motion), and console/network error checks. All
clean.
