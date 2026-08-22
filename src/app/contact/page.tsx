import type { Metadata } from "next";
import { artist } from "@/data/artist";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { whatsappLink, generalEnquiryMessage } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import WhatsAppLink from "@/components/WhatsAppLink";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about commissions, prints, or collaborations.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading
        eyebrow="Contact"
        title="Get In Touch"
        description="Have a question or want to work together? I'd love to hear from you."
      />

      <div className="mt-12 grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
        <div>
          <h2 className="font-serif text-xl text-ink">Contact Information</h2>
          <p className="mt-2 text-sm text-stone">
            Fill out the form and I&apos;ll get back to you as soon as possible.
          </p>

          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-sm font-medium text-ink">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${artist.email}`} className="text-stone hover:text-accent">
                  {artist.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-ink">Location</dt>
              <dd className="mt-1 text-stone">{artist.location}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-ink">Active Hours</dt>
              <dd className="mt-1 text-stone">{artist.activeHours}</dd>
            </div>
          </dl>

          <WhatsAppLink
            href={whatsappLink(generalEnquiryMessage())}
            className="mt-8 flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <WhatsAppIcon className="size-4" />
            Chat on WhatsApp
          </WhatsAppLink>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
