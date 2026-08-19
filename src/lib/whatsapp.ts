import { WHATSAPP_NUMBER } from "@/data/siteConfig";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function artworkEnquiryMessage(title: string): string {
  return `Hello, I am interested in the artwork: ${title}. I would like to know more about its availability and pricing.`;
}

export function generalEnquiryMessage(): string {
  return "Hello, I'd like to know more about your artwork and commissions.";
}
