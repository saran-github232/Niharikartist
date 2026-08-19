import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ibb.co" }],
    // ponytail: ibb.co is a free hotlink host; Next's server-side re-fetch/resize
    // times out against it under load. Serving originals unoptimized is correct
    // here — upgrade to optimized delivery only after migrating images to a real
    // CDN/storage (Cloudinary, Vercel Blob, S3) that Next can reliably fetch from.
    unoptimized: true,
  },
};

export default nextConfig;
