import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/siteConfig";
import { shopArtworks } from "@/data/shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/gallery", "/shop", "/contact"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));

  const shopRoutes = shopArtworks.map((a) => ({
    url: `${siteConfig.url}/shop/${a.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...shopRoutes];
}
