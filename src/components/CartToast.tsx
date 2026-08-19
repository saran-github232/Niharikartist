"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

// Doubles as the screen-reader status region (role="status") and the visible
// "added to selection" confirmation — one element, so the announcement and
// the animation can never say different things.
export default function CartToast() {
  const { announcement } = useCart();
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(announcement);

  // New announcement arrived: show it. Setting state during render (React's
  // documented pattern for "state that resets when a prop/value changes")
  // instead of an effect keyed on `announcement`.
  if (announcement !== seen && announcement) {
    setSeen(announcement);
    setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4 transition-all duration-300 md:bottom-8 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {visible && (
        <span className="rounded-full bg-charcoal px-5 py-2.5 text-sm text-ivory shadow-lg">
          {announcement}
        </span>
      )}
    </div>
  );
}
