export default function Logo({ className = "size-9 text-base" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-charcoal font-serif font-medium text-ivory ${className}`}
    >
      N
    </span>
  );
}
