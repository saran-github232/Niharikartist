import { AVAILABILITY_LABEL, type Availability } from "@/lib/availability";

const STYLES: Record<Availability, string> = {
  AVAILABLE: "bg-charcoal/90 text-ivory",
  SOLD: "bg-ink/80 text-ivory",
  RESERVED: "bg-accent text-ivory",
  ENQUIRE_ONLY: "bg-stone/80 text-ivory",
  COMING_SOON: "bg-stone/60 text-ivory",
};

export default function AvailabilityBadge({
  status,
  className = "",
}: {
  status: Availability;
  className?: string;
}) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${STYLES[status]} ${className}`}>
      {AVAILABILITY_LABEL[status]}
    </span>
  );
}
