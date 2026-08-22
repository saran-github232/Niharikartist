"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { deriveAvailability } from "@/lib/availability";
import { whatsappLink, cartEnquiryMessage, isWhatsAppConfigured } from "@/lib/whatsapp";
import FadeImage from "@/components/FadeImage";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import SectionHeading from "@/components/SectionHeading";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import WhatsAppLink from "@/components/WhatsAppLink";

export default function CartPage() {
  const { items, count, remove } = useCart();
  const whatsappReady = isWhatsAppConfigured();
  const enquireLabel = count > 1 ? "Discuss This Selection" : "Enquire via WhatsApp";

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading
        eyebrow="Enquiry Cart"
        title="Your Selection"
        description="Review the artwork you've saved, then send one enquiry to the artist."
      />

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center py-16 text-center">
          <p className="font-serif text-xl text-ink">Your selection is empty.</p>
          <p className="mt-2 max-w-sm text-stone">
            Explore the collection and save artwork you&apos;re interested in.
          </p>
          <Link
            href="/shop"
            className="mt-8 rounded-full bg-charcoal px-7 py-3 text-sm text-ivory transition-colors hover:bg-accent"
          >
            Explore Artwork
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-12 divide-y divide-sand/60">
            {items.map((art) => {
              const status = deriveAvailability(art.available);
              return (
                <li key={art.slug} className="flex flex-col gap-6 py-8 sm:flex-row">
                  <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-sand sm:w-40">
                    <FadeImage
                      src={art.imageUrl}
                      alt={art.title}
                      fill
                      sizes="(min-width: 640px) 160px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h3 className="font-serif text-xl text-ink">{art.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone">
                      {art.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {art.price > 0 && (
                        <span className="text-accent">₹{art.price.toLocaleString("en-IN")}</span>
                      )}
                      <AvailabilityBadge status={status} />
                    </div>
                    <div className="mt-4 flex items-center gap-5 text-sm">
                      <Link
                        href={`/shop/${art.slug}`}
                        className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
                      >
                        View artwork
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(art.slug)}
                        className="text-stone underline underline-offset-4 hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 flex flex-col items-center gap-4 border-t border-sand/60 pt-10 text-center">
            {whatsappReady ? (
              <WhatsAppLink
                href={whatsappLink(cartEnquiryMessage(items))}
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="size-4" />
                {enquireLabel}
              </WhatsAppLink>
            ) : (
              <p className="text-sm text-stone">
                WhatsApp enquiry is currently unavailable. Please use the contact page.
              </p>
            )}
            <Link
              href="/shop"
              className="text-sm text-stone underline decoration-accent underline-offset-4 hover:text-accent"
            >
              Continue exploring
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
