export default function CartIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="20" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.15" fill="currentColor" stroke="none" />
      <path d="M1.5 2h2.4l1.2 3M5.1 5l2.05 9.23A2 2 0 0 0 9.1 16h8.4a2 2 0 0 0 1.95-1.57L21 6.5H5.1Z" />
    </svg>
  );
}
