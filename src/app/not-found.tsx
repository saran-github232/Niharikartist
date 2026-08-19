import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <p className="font-serif text-6xl text-accent">404</p>
      <h1 className="mt-4 font-serif text-2xl text-ink">Page not found</h1>
      <p className="mt-3 text-stone">
        The piece you&apos;re looking for may have moved, sold, or never existed.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-charcoal px-6 py-3 text-sm text-ivory hover:bg-accent"
      >
        Back to Home
      </Link>
    </div>
  );
}
