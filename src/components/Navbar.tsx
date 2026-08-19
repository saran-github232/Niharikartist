"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig, WHATSAPP_NUMBER } from "@/data/siteConfig";
import { whatsappLink, generalEnquiryMessage } from "@/lib/whatsapp";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openForPath, setOpenForPath] = useState(pathname);

  // Close the mobile menu on navigation without an effect: if the pathname
  // changed since we last rendered open, reset during render (React's
  // recommended pattern for state that depends on a prop change).
  if (pathname !== openForPath) {
    setOpenForPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-sand/60 bg-ivory/90 backdrop-blur-md py-2"
          : "border-transparent bg-ivory/70 backdrop-blur-sm py-4"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="font-serif text-lg font-medium tracking-wide text-ink md:text-xl"
        >
          Niharika Artist
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative text-sm tracking-wide transition-colors ${
                pathname === item.href ? "text-ink" : "text-stone hover:text-ink"
              }`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300 ${
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
          {WHATSAPP_NUMBER && (
            <a
              href={whatsappLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-charcoal px-5 py-2 text-sm text-ivory transition-colors hover:bg-accent"
            >
              WhatsApp
            </a>
          )}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center md:hidden"
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 top-0 h-px w-6 bg-ink transition-transform duration-300 ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 h-px w-6 -translate-y-1/2 bg-ink transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-6 bg-ink transition-transform duration-300 ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 border-t border-sand/60 bg-ivory px-5 py-4">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-3 text-base ${
                pathname === item.href ? "bg-paper text-ink" : "text-stone"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={whatsappLink(generalEnquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-full bg-charcoal px-5 py-3 text-center text-base text-ivory"
          >
            Enquire on WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
