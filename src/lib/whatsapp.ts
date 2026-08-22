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
//
// Titles and the header line use WhatsApp's own *bold* markdown so the
// message is scannable at a glance in the chat itself, not just readable —
// that's what was missing when the message was plain, undifferentiated text.
function artworkLines(art: ShopArtwork, index?: number): string {
  const lines: string[] = [];
  lines.push(index !== undefined ? `${index}. *${art.title}*` : `*${art.title}*`);
  const indent = index !== undefined ? "   " : "";
  if (art.price > 0) {
    lines.push(`${indent}Price: ₹${art.price.toLocaleString("en-IN")}`);
  }
  lines.push(`${indent}Availability: ${AVAILABILITY_LABEL[deriveAvailability(art.available)]}`);
  lines.push(`${indent}Link: ${artworkUrl(art.slug)}`);
  return lines.join("\n");
}

export function singleArtworkEnquiryMessage(art: ShopArtwork): string {
  return [
    `*New order enquiry — ${siteConfig.name}*`,
    "",
    artworkLines(art),
    "",
    "I'd like to know more about availability and how to purchase this.",
    "Thank you!",
  ].join("\n");
}

export function cartEnquiryMessage(items: ShopArtwork[]): string {
  if (items.length === 0) return generalEnquiryMessage();
  if (items.length === 1) return singleArtworkEnquiryMessage(items[0]);

  const body = items.map((art, i) => artworkLines(art, i + 1)).join("\n\n");
  const total = items.reduce((sum, art) => sum + art.price, 0);

  return [
    `*New order enquiry — ${siteConfig.name}*`,
    `${items.length} pieces`,
    "",
    body,
    "",
    ...(total > 0 ? [`*Total: ₹${total.toLocaleString("en-IN")}*`, ""] : []),
    "I'd like to know more about availability and how to purchase these.",
    "Thank you!",
  ].join("\n");
}
