"use client";

import { useCart } from "@/lib/cart";
import type { ShopArtwork } from "@/data/shop";
import { deriveAvailability } from "@/lib/availability";
import { whatsappLink, singleArtworkEnquiryMessage, isWhatsAppConfigured } from "@/lib/whatsapp";
import KeycapButton from "./originkit/ui/keycap-button";
import WhatsAppIcon from "./WhatsAppIcon";

export default function AddToCartButton({
  art,
  size = "md",
}: {
  art: ShopArtwork;
  size?: "sm" | "md";
}) {
  const { isInCart, add, open } = useCart();
  const status = deriveAvailability(art.available);
  const inCart = isInCart(art.slug);
  const padding = size === "sm" ? "9px 20px" : "12px 26px";

  if (status === "SOLD" || status === "RESERVED" || status === "COMING_SOON") {
    const label = status === "SOLD" ? "Sold" : status === "RESERVED" ? "Reserved" : "Coming Soon";
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="cursor-not-allowed rounded-full border border-stone/30 px-6 py-3 text-sm text-stone"
      >
        {label}
      </button>
    );
  }

  if (status === "ENQUIRE_ONLY") {
    if (!isWhatsAppConfigured()) {
      return (
        <p className="text-sm text-stone">
          WhatsApp enquiry is currently unavailable. Please use the contact page.
        </p>
      );
    }
    return (
      <a
        href={whatsappLink(singleArtworkEnquiryMessage(art))}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <WhatsAppIcon className="size-4" />
        Enquire via WhatsApp
      </a>
    );
  }

  if (inCart) {
    return (
      <button
        type="button"
        onClick={open}
        className="rounded-full border border-accent px-6 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-ivory"
      >
        Added to Selection · View Selection
      </button>
    );
  }

  return (
    <KeycapButton
      label="Add to Cart"
      padding={padding}
      onClick={() => add(art.slug)}
      ariaLabel={`Add ${art.title} to your selection`}
    />
  );
}
