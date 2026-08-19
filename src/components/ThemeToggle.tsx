"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const noopSubscribe = () => () => {};
// Server always renders "not mounted yet"; the client snapshot flips to true
// once hydration is done. Using useSyncExternalStore for this (rather than a
// useState+useEffect mount flag) avoids the same "setState in an effect"
// pattern flagged elsewhere in this codebase.
function useHasMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" className="size-3.5">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.55 1.55M17.85 17.85l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.55-1.55M17.85 6.15l1.55-1.55" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
      <path d="M20.7 14.3A8.5 8.5 0 0 1 9.7 3.3a.6.6 0 0 0-.7-.85A10 10 0 1 0 21.55 15a.6.6 0 0 0-.85-.7Z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
      <rect x="3" y="4.5" width="18" height="12" rx="1.6" />
      <path d="M8.5 20h7M12 16.5V20" />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();

  // Avoid a hydration mismatch: the server has no idea what the user's (or
  // OS's) theme preference is, so nothing is marked "active" until mounted.
  const current = mounted ? theme : undefined;

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border border-sand/70 p-0.5 ${className}`}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          aria-label={opt.label}
          aria-pressed={current === opt.value}
          className={`flex size-7 items-center justify-center rounded-full transition-colors ${
            current === opt.value ? "bg-charcoal text-ivory" : "text-stone hover:text-ink"
          }`}
        >
          {opt.value === "light" && <SunIcon />}
          {opt.value === "dark" && <MoonIcon />}
          {opt.value === "system" && <SystemIcon />}
        </button>
      ))}
    </div>
  );
}
