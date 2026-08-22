"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      setMessage(data?.message ?? "If that email belongs to an admin account, a reset link has been sent.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-serif text-2xl text-ink">Reset password</h1>
      <p className="mt-2 text-sm text-stone">
        Enter your admin email and we&apos;ll send a link to reset your password.
      </p>
      {message ? (
        <p className="mt-8 rounded-md border border-sand bg-ivory px-4 py-3 text-sm text-ink">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm text-stone">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-sand bg-ivory px-4 py-3 text-ink focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-charcoal px-6 py-3 text-sm text-ivory transition-colors hover:bg-accent disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <Link href="/admin/login" className="mt-6 text-sm text-ink underline decoration-accent underline-offset-4 hover:text-accent">
        Back to sign in
      </Link>
    </div>
  );
}
