"use client";

import { useCart } from "@/lib/cart";
import CartIcon from "./CartIcon";

export default function CartButton({ className = "" }: { className?: string }) {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart${count > 0 ? `, ${count} artwork${count === 1 ? "" : "s"}` : ""}`}
      className={`relative flex items-center gap-1.5 text-stone transition-colors hover:text-ink ${className}`}
    >
      <CartIcon className="size-5" />
      <span className="hidden text-sm sm:inline">Cart</span>
      {count > 0 && (
        <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium leading-none text-ivory">
          {count}
        </span>
      )}
    </button>
  );
}
