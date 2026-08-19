// Availability is intentionally a richer type than the data currently uses —
// today every ShopArtwork only carries `available: boolean`, so `deriveAvailability`
// only ever produces AVAILABLE/SOLD. RESERVED/ENQUIRE_ONLY/COMING_SOON exist so
// the UI (AddToCartButton, AvailabilityBadge) already knows how to render them
// the day the data model grows a real status field — nothing to rewire then.
export type Availability = "AVAILABLE" | "SOLD" | "RESERVED" | "ENQUIRE_ONLY" | "COMING_SOON";

export function deriveAvailability(available: boolean): Availability {
  return available ? "AVAILABLE" : "SOLD";
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  AVAILABLE: "Available",
  SOLD: "Sold",
  RESERVED: "Reserved",
  ENQUIRE_ONLY: "Enquire",
  COMING_SOON: "Coming Soon",
};
