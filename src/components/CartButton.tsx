"use client";

import { useCart } from "@/lib/cart";

export default function CartButton({ className = "" }: { className?: string }) {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open selection${count > 0 ? `, ${count} artwork${count === 1 ? "" : "s"}` : ""}`}
      className={`relative flex items-center gap-1.5 text-stone transition-colors hover:text-ink ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-5">
        <path d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium leading-none text-ivory">
          {count}
        </span>
      )}
    </button>
  );
}
