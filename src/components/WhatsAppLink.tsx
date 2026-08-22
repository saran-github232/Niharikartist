"use client";

import type { ReactNode } from "react";
import { useHoverCapable } from "@/lib/useHoverCapable";

// wa.me hands off to the native WhatsApp app on mobile. Forcing target="_blank"
// there opens a new tab that just sits blank/loading while that handoff
// happens — reads as slow, and leaves an orphaned tab behind afterward. Only
// open a new tab on devices with a real mouse/trackpad, where WhatsApp Web
// opening alongside the site (not replacing it) is the expected behavior;
// touch devices navigate in place so the OS handoff is immediate and clean.
export default function WhatsAppLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const newTab = useHoverCapable();
  return (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </a>
  );
}
