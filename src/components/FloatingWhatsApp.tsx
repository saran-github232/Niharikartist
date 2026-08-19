import { whatsappLink, generalEnquiryMessage } from "@/lib/whatsapp";
import WhatsAppIcon from "./WhatsAppIcon";

export default function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink(generalEnquiryMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
