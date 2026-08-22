# Niharika Artist — niharikartist.shop

Next.js (App Router) + TypeScript + Tailwind rebuild of the artist portfolio/shop.
All content (gallery, shop, bio) was pulled from the live site's own `/api/site-data`
endpoint and is now stored as static, editable data files — see below.

## Run locally

```bash
npm install
npm run dev
```

## WhatsApp

`src/data/siteConfig.ts` → `WHATSAPP_NUMBER` (digits only, country code first, e.g.
`"919876543210"`) is the one place to change the number. Every CTA — floating
button, nav, hero, shop enquiry, cart, contact page — reads from this single
constant via `src/lib/whatsapp.ts`, which also builds the pre-filled enquiry
message (bolded title/total using WhatsApp's own `*text*` markdown, so it's
scannable in the chat itself — see `cartEnquiryMessage`/`singleArtworkEnquiryMessage`).

Links go through `src/components/WhatsAppLink.tsx` rather than a plain `<a>`:
it only opens a new tab on devices with a real mouse/trackpad (where WhatsApp
Web opening alongside the site is expected). On touch devices it navigates in
place, so the OS hands off to the WhatsApp app immediately instead of leaving
a blank tab loading behind it.

## Update content

Everything is plain TypeScript data, no CMS/database:

- `src/data/gallery.ts` — the 51 portfolio pieces (title, description, year, category, image)
- `src/data/shop.ts` — the 14 seed items for sale (adds price, availability). Admin-added
  products live separately in `data/shop-additions.json` — see the Admin panel section.
- `src/data/artist.ts` — bio, awards, profile/hero images, email, location, social links
- `src/data/siteConfig.ts` — site name, nav, WhatsApp number

Add/remove/edit an object in the relevant array and the corresponding page, card,
filter, sitemap entry, and (for shop) static detail page at `/shop/[slug]`
regenerate automatically on next build — nothing else to touch.

The "N" logo mark (navbar, footer, browser tab icon, iOS home-screen icon) is
generated from code, not an image file — `src/components/Logo.tsx` for the
on-page badge, `src/app/icon.tsx` / `src/app/apple-icon.tsx` for the favicon.
Edit those directly to change the mark; there's no separate asset to swap.

`scripts/gen-data.mjs` is the one-off script originally used to generate these
files from the live site's JSON; it's not part of the app and doesn't need to run
again unless you're re-importing from that source.

## Admin panel

A lightweight `/admin` panel lets you edit shop pricing/availability, add and
remove products, and manage admin accounts — no database required.

- **Accounts and approval.** Up to 3 admin seats. Registering (`/admin/register`)
  creates a *request*, not instant access — every account after the very first
  one sits **pending** until the current **Owner** approves it from the Team
  page (`/admin/team`), and a pending account can't sign in. The very first
  admin ever registered is auto-approved and becomes the Owner immediately
  (nobody exists yet to approve them). Passwords are hashed (`scrypt`) and
  stored in `data/admins.json`, which is gitignored — it never gets committed,
  even after local testing.
- **Owner.** Only the Owner can approve/reject requests, remove other admins, or
  transfer ownership. Ownership is a real, explicit flag (`isOwner` in
  `data/admins.json`) — not just "whoever signed up first" — so it can be
  handed off deliberately: Team page → **Make Owner** on any other approved
  admin. The outgoing Owner keeps their account, just demoted to a regular
  admin. This is the intended handoff path once a client takes over the site:
  register their account, have the current Owner approve it, then transfer
  ownership to them.
- **Sign in / out** at `/admin/login`. Sessions are a signed cookie (HMAC'd with
  `AUTH_SECRET`), so there's no session table to manage.
- **Forgot password** at `/admin/forgot-password` emails a reset link via Resend
  if `RESEND_API_KEY` is set; otherwise the link is logged to the server console
  so the flow still works in local dev without a real email account. Reset links
  expire after 30 minutes and — because the link is bound to the current password
  hash — stop working the instant they're used once, even within that window.
- **Shop editing.** Each row has its own Save button, plus a "Save all" button on
  the dashboard that batches every changed row into one request. **Add product**
  uploads a photo directly from your device (resized client-side, previewed in
  the exact card frame it'll appear in — no external image URL needed) and
  creates a brand-new listing, stored separately from the seed data in
  `src/data/shop.ts` so nothing there is ever overwritten. It appears on `/shop`
  and gets its own `/shop/[slug]` page immediately. Every row also has a delete
  (trash) button — seed items are soft-deleted via an override flag (the source
  file is never rewritten), admin-added products are removed outright.
- **Dashboard stats.** Products, Available, Sold, and total Inventory value (₹,
  summed across Available items) all update live as you edit rows, before you
  even hit Save.
- **Storage.** `src/lib/kv.ts` is the one place every read/write actually goes
  through (`adminStore.ts` and `shopOverrides.ts` both call it, nothing else
  touches storage directly). In local dev it falls back to plain JSON files
  under `data/` — same as before, nothing to set up. In production it needs
  `KV_REST_API_URL`/`KV_REST_API_TOKEN` (a Redis store via the Vercel
  Marketplace) — **required**, not optional: Vercel's serverless filesystem is
  read-only, so without these, every write (register, approve, save, add
  product...) fails outright rather than just "not persisting." See the Vercel
  section below for setup.
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
  lightbox transition, hero text stagger) plus two CSS-3D pieces built to avoid
  any WebGL cost: `SpinImageOrbit` (`src/components/SpinImageOrbit.tsx`) is the
  hero's rotating tilted-ellipse image ring, desktop-only and skipped under
  `prefers-reduced-motion`; `CoverflowCarousel` (framer-motion) is the Home
  page's "Featured artwork" showcase. `useTilt3D` (`src/lib/useTilt3D.ts`) adds
  a cheap hover tilt to artwork/category cards site-wide, hover-capable
  pointers only (no-op on touch). An earlier WebGL version of the hero
  (`@react-three/fiber` + `drei`) was replaced by `SpinImageOrbit` for a
  lighter, dependency-free equivalent — nothing in the current codebase uses
  `@react-three/fiber` or `drei`.
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
4. **Add a Redis store — required for the admin panel to work at all.** Vercel's
   serverless functions have a **read-only** filesystem, so without this every
   admin write (register, approve, save, add product) fails with a generic
   error. In your Vercel project: **Storage → Marketplace Database Integrations
   → search "Upstash"** (or **Redis**) → install → create a new database (free
   tier is enough) → link it to this project. Vercel injects
   `KV_REST_API_URL`/`KV_REST_API_TOKEN` automatically — nothing to copy by
   hand. Redeploy after linking it (Deployments → ⋯ → Redeploy) if you added it
   after the first deploy.
5. **Deploy.** Vercel builds and gives you a `*.vercel.app` URL immediately;
   attach a custom domain afterwards under Project Settings → Domains.

Any other Next.js host with a persistent filesystem (a VPS, Railway, Render,
etc. running `next build && next start`) doesn't need step 4 at all — leave
`KV_REST_API_URL` unset there and `src/lib/kv.ts` falls back to `data/*.json`
files automatically, same as local dev.

## QA performed

`tsc --noEmit`, ESLint, and `next build` all clean on every change. Public
site: headless-browser pass across every route — nav (desktop + mobile menu,
scroll-lock, close-on-navigate), gallery category filter, lightbox
(open/arrow-key nav/Escape/3D-flip transition), shop detail pages, cart, contact
form validation, 404 page, console/network error checks.

Admin panel: verified directly against the running server (not just the UI) —
registration up to the 3-seat cap and blocked past it, pending accounts
correctly refused login until approved, owner-only enforcement on
approve/reject/remove/transfer-ownership (checked server-side, not just hidden
in the UI), ownership transfer end-to-end including the demoted former owner
losing access, single-use password-reset tokens, shop Save/Save All/Add
Product (including the client-side image upload path)/Delete for both seed and
admin-added products, and that removed test data never leaked into the real
`data/admins.json` or `data/shop-overrides.json`.
