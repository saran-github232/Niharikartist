"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { shopArtworks, type ShopArtwork } from "@/data/shop";
import {
  addSlug,
  clearSlugs,
  getServerSlugsSnapshot,
  getSlugsSnapshot,
  removeSlug,
  subscribeSlugs,
} from "./cartStore";

// Cart events are stubbed as a no-op console log rather than wired to a real
// analytics service — none is configured yet. The call sites below are
// exactly where a real tracker would hook in later.
export function trackEvent(name: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
     
    console.debug("[cart event]", name, data);
  }
}

interface CartContextValue {
  slugs: string[];
  items: ShopArtwork[];
  count: number;
  isInCart: (slug: string) => boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  announcement: string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const slugs = useSyncExternalStore(subscribeSlugs, getSlugsSnapshot, getServerSlugsSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const add = useCallback((slug: string) => {
    const added = addSlug(slug);
    if (!added) return;
    trackEvent("add_to_cart", { slug });
    const art = shopArtworks.find((a) => a.slug === slug);
    setAnnouncement(art ? `Added ${art.title} to your selection.` : "Added to your selection.");
  }, []);

  const remove = useCallback((slug: string) => {
    const art = shopArtworks.find((a) => a.slug === slug);
    const removed = removeSlug(slug);
    if (!removed) return;
    trackEvent("remove_from_cart", { slug });
    setAnnouncement(art ? `Removed ${art.title} from your selection.` : "Removed from your selection.");
  }, []);

  const clear = useCallback(() => clearSlugs(), []);
  const isInCart = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const items = useMemo(
    () =>
      slugs
        .map((slug) => shopArtworks.find((a) => a.slug === slug))
        .filter((a): a is ShopArtwork => !!a),
    [slugs]
  );

  const open = useCallback(() => {
    trackEvent("cart_open");
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value: CartContextValue = {
    slugs,
    items,
    count: items.length,
    isInCart,
    add,
    remove,
    clear,
    isOpen,
    open,
    close,
    announcement,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
