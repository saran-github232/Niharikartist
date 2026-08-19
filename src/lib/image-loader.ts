// Custom Next.js image loader. The gallery/shop images are hotlinked from
// ibb.co (a free host with no resizing of its own), and Next's built-in
// optimizer times out trying to fetch+resize them server-side. Routing
// through wsrv.nl (a resizing image proxy) fixes both problems at once:
// the browser fetches an already-correctly-sized webp directly, and Next
// never has to make the flaky server-side request itself.
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 75),
    output: "webp",
    fit: "cover",
  });
  return `https://wsrv.nl/?${params.toString()}`;
}
