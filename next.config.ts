import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ibb.co source images are un-resized phone photos (1-2MB+ each) and Next's
    // built-in optimizer times out fetching them server-side. A custom loader
    // routes through a resizing proxy instead — see src/lib/image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

export default nextConfig;
