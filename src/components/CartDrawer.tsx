"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { deriveAvailability } from "@/lib/availability";
import { whatsappLink, cartEnquiryMessage, isWhatsAppConfigured } from "@/lib/whatsapp";
import FadeImage from "./FadeImage";
import AvailabilityBadge from "./AvailabilityBadge";
import WhatsAppIcon from "./WhatsAppIcon";

export default function CartDrawer() {
  const { items, count, isOpen, close, remove } = useCart();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const whatsappReady = isWhatsAppConfigured();
  const enquireLabel = count > 1 ? "Discuss This Selection" : "Enquire via WhatsApp";

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Your selection">
      <div className="absolute inset-0 bg-ink/50" onClick={close} />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-2xl">
        <div className="flex items-center justify-between border-b border-sand/60 px-5 py-4">
          <h2 className="font-serif text-lg text-ink">Your Selection</h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <EmptyState onExplore={close} />
          ) : (
            <ul className="divide-y divide-sand/60">
              {items.map((art) => {
                const status = deriveAvailability(art.available);
                return (
                  <li key={art.slug} className="flex gap-4 py-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-sand">
                      <FadeImage src={art.imageUrl} alt={art.title} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-sm text-ink">{art.title}</p>
                      {art.price > 0 && (
                        <p className="mt-0.5 text-sm text-accent">₹{art.price.toLocaleString("en-IN")}</p>
                      )}
                      <div className="mt-1.5">
                        <AvailabilityBadge status={status} />
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <Link
                          href={`/shop/${art.slug}`}
                          onClick={close}
                          className="text-stone underline decoration-accent underline-offset-2 hover:text-accent"
                        >
                          View artwork
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(art.slug)}
                          className="text-stone underline underline-offset-2 hover:text-accent"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-sand/60 px-5 py-4">
            <div className="flex gap-3">
              <Link
                href="/shop"
                onClick={close}
                className="flex-1 rounded-full border border-stone/30 px-4 py-2.5 text-center text-sm text-ink hover:border-accent hover:text-accent"
              >
                Continue Exploring
              </Link>
              <Link
                href="/cart"
                onClick={close}
                className="flex-1 rounded-full border border-stone/30 px-4 py-2.5 text-center text-sm text-ink hover:border-accent hover:text-accent"
              >
                View Selection
              </Link>
            </div>
            {whatsappReady ? (
              <a
                href={whatsappLink(cartEnquiryMessage(items))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="size-4" />
                {enquireLabel}
              </a>
            ) : (
              <p className="text-center text-sm text-stone">
                WhatsApp enquiry is currently unavailable. Please use the contact page.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <p className="font-serif text-lg text-ink">Your selection is empty.</p>
      <p className="mt-2 max-w-xs text-sm text-stone">
        Explore the collection and save artwork you&apos;re interested in.
      </p>
      <Link
        href="/shop"
        onClick={onExplore}
        className="mt-6 rounded-full bg-charcoal px-6 py-2.5 text-sm text-ivory hover:bg-accent"
      >
        Explore Artwork
      </Link>
    </div>
  );
}
