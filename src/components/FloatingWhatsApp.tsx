"use client";

import { usePathname } from "next/navigation";
import { whatsappLink, generalEnquiryMessage } from "@/lib/whatsapp";
import WhatsAppIcon from "./WhatsAppIcon";
import WhatsAppLink from "./WhatsAppLink";

export default function FloatingWhatsApp() {
  // /cart already has its own prominent "Enquire via WhatsApp" CTA — the
  // floating button there would just sit on top of it on small screens.
  const pathname = usePathname();
  if (pathname === "/cart") return null;

  return (
    <WhatsAppLink
      href={whatsappLink(generalEnquiryMessage())}
      ariaLabel="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
    >
      <WhatsAppIcon className="size-7" />
    </WhatsAppLink>
  );
}
