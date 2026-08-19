// One-off generator: reads the scraped site-data.json and emits typed data files.
// Not part of the app build — run manually if the source JSON changes.
import { readFileSync, writeFileSync } from "node:fs";

const src = JSON.parse(
  readFileSync(
    "C:/Users/Saran/AppData/Local/Temp/claude/c--AndroidPro-niharikaartist-shop/bb725685-f93c-470f-8d67-75b5891871d1/scratchpad/site-data.json",
    "utf8"
  )
);

function slugify(title, id) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${id.slice(0, 8)}`;
}

function esc(str) {
  return (str ?? "").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

// --- gallery ---
const gallery = src.gallery.map((g, i) => {
  const id = g.id ?? `gallery-${i}`;
  return {
    id,
    slug: slugify(g.title, id),
    title: g.title,
    description: (g.description || "").trim(),
    year: g.year || "",
    category: g.category || "Other",
    imageUrl: g.imageUrl,
  };
});

const galleryTs = `// Auto-generated from the live site's content API. Edit here to update gallery content.
export type GalleryCategory =
  | "Painting"
  | "Pencil Portraits"
  | "Caricature"
  | "Live Wedding Painting"
  | "Other";

export interface GalleryArtwork {
  id: string;
  slug: string;
  title: string;
  description: string;
  year: string;
  category: GalleryCategory;
  imageUrl: string;
}

export const galleryArtworks: GalleryArtwork[] = [
${gallery
  .map(
    (g) => `  {
    id: ${JSON.stringify(g.id)},
    slug: ${JSON.stringify(g.slug)},
    title: ${JSON.stringify(g.title)},
    description: \`${esc(g.description)}\`,
    year: ${JSON.stringify(g.year)},
    category: ${JSON.stringify(g.category)},
    imageUrl: ${JSON.stringify(g.imageUrl)},
  }`
  )
  .join(",\n")}
];

export const galleryCategories: GalleryCategory[] = [
  "Painting",
  "Pencil Portraits",
  "Caricature",
  "Live Wedding Painting",
];
`;

writeFileSync("src/data/gallery.ts", galleryTs);

// --- shop ---
const shop = src.shop.map((s, i) => {
  const id = s.id ?? `shop-${i}`;
  return {
    id,
    slug: slugify(s.title, id),
    title: s.title.trim(),
    description: (s.description || "").trim(),
    price: s.price ?? 0,
    available: s.available !== false,
    imageUrl: s.imageUrl,
  };
});

const shopTs = `// Auto-generated from the live site's content API. Edit here to update shop content.
export interface ShopArtwork {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl: string;
}

export const shopArtworks: ShopArtwork[] = [
${shop
  .map(
    (s) => `  {
    id: ${JSON.stringify(s.id)},
    slug: ${JSON.stringify(s.slug)},
    title: ${JSON.stringify(s.title)},
    description: \`${esc(s.description)}\`,
    price: ${s.price},
    available: ${s.available},
    imageUrl: ${JSON.stringify(s.imageUrl)},
  }`
  )
  .join(",\n")}
];
`;

writeFileSync("src/data/shop.ts", shopTs);

// --- artist ---
const artistTs = `// Auto-generated from the live site's content API. Edit here to update artist/about content.
export const artist = {
  name: "Ananthoja Niharika",
  displayName: "Niharika Artist",
  tagline: "Where Art Meets Soul",
  heroSubtitle: "Discover unique artworks that tell stories and evoke emotions",
  profileImage: ${JSON.stringify(src.about.profileImage)},
  heroImage: ${JSON.stringify(src.home.heroImage)},
  bio: \`${esc(src.about.bio)}\`,
  awards: [
${src.about.awards.map((a) => `    \`${esc(a)}\`,`).join("\n")}
  ],
  location: "Hyderabad, India",
  email: "niharikaananthoja@gmail.com",
  activeHours: "Monday - Sunday : 9:00 AM - 6:00 PM",
  social: {
    instagram: "https://www.instagram.com/niharikartist?igsh=MXR0ZDU2b3M5aHo0Mw==",
    youtube: "https://www.youtube.com/@niharikartist",
  },
};
`;

writeFileSync("src/data/artist.ts", artistTs);

console.log(`Wrote ${gallery.length} gallery pieces, ${shop.length} shop pieces, artist.ts`);
