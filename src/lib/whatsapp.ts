import { WHATSAPP_NUMBER, siteConfig } from "@/data/siteConfig";
import type { ShopArtwork } from "@/data/shop";
import { AVAILABILITY_LABEL, deriveAvailability } from "./availability";

export function isWhatsAppConfigured(): boolean {
  return typeof WHATSAPP_NUMBER === "string" && WHATSAPP_NUMBER.trim().length > 0;
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function generalEnquiryMessage(): string {
  return "Hello, I'd like to know more about your artwork and commissions.";
}

function artworkUrl(slug: string): string {
  return `${siteConfig.url}/shop/${slug}`;
}

// Only fields that genuinely exist as structured data are included — the
// artwork's freeform `description` (which often contains medium/size as
// prose) isn't parsed apart here, since that would be guessing at a format
// that isn't consistent across entries. The artwork URL carries that detail.
function artworkLines(art: ShopArtwork, index?: number): string {
  const lines: string[] = [];
  lines.push(index !== undefined ? `${index}. ${art.title}` : art.title);
  const indent = index !== undefined ? "   " : "";
  if (art.price > 0) {
    lines.push(`${indent}Price: ₹${art.price.toLocaleString("en-IN")}`);
  }
  lines.push(`${indent}Availability: ${AVAILABILITY_LABEL[deriveAvailability(art.available)]}`);
  lines.push(`${indent}View: ${artworkUrl(art.slug)}`);
  return lines.join("\n");
}

export function singleArtworkEnquiryMessage(art: ShopArtwork): string {
  return [
    "Hello, I'm interested in the following artwork:",
    "",
    artworkLines(art),
    "",
    "I would like to know more about its availability and purchase details.",
    "Thank you.",
  ].join("\n");
}

export function cartEnquiryMessage(items: ShopArtwork[]): string {
  if (items.length === 0) return generalEnquiryMessage();
  if (items.length === 1) return singleArtworkEnquiryMessage(items[0]);

  const body = items.map((art, i) => artworkLines(art, i + 1)).join("\n\n");
  return [
    "Hello, I'm interested in the following artworks from your collection:",
    "",
    body,
    "",
    "I would like to know more about the availability and purchase details of these artworks.",
    "Thank you.",
  ].join("\n");
}
