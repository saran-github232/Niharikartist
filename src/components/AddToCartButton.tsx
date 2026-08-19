"use client";

import { useCart } from "@/lib/cart";
import type { ShopArtwork } from "@/data/shop";
import { deriveAvailability } from "@/lib/availability";
import { whatsappLink, singleArtworkEnquiryMessage, isWhatsAppConfigured } from "@/lib/whatsapp";
import CartIcon from "./CartIcon";
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
  const sizeClasses = size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-6 py-3 text-sm";
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  if (status === "SOLD" || status === "RESERVED" || status === "COMING_SOON") {
    const label = status === "SOLD" ? "Sold" : status === "RESERVED" ? "Reserved" : "Coming Soon";
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={`cursor-not-allowed rounded-full border border-stone/30 text-stone ${sizeClasses}`}
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
        className={`flex w-fit items-center gap-2 rounded-full bg-[#25D366] font-medium text-white transition-opacity hover:opacity-90 ${sizeClasses}`}
      >
        <WhatsAppIcon className={iconSize} />
        Enquire via WhatsApp
      </a>
    );
  }

  if (inCart) {
    return (
      <button
        type="button"
        onClick={open}
        className={`flex w-fit items-center gap-1.5 rounded-full border border-accent font-medium text-accent transition-colors hover:bg-accent hover:text-ivory ${sizeClasses}`}
      >
        <CartIcon className={iconSize} />
        Added · View
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => add(art.slug)}
      aria-label={`Add ${art.title} to your selection`}
      className={`flex w-fit items-center gap-1.5 rounded-full bg-charcoal font-medium text-ivory transition-colors hover:bg-accent ${sizeClasses}`}
    >
      <CartIcon className={iconSize} />
      Add to Cart
    </button>
  );
}
