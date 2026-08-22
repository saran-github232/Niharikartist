"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import PasswordInput from "./PasswordInput";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Login failed.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24 text-center">
        <h1 className="font-serif text-xl text-ink">Admin isn&apos;t set up yet</h1>
        <p className="mt-3 text-sm text-stone">
          Set an <code className="rounded bg-paper px-1.5 py-0.5">AUTH_SECRET</code> environment
          variable to enable the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-serif text-2xl text-ink">Admin sign in</h1>
      <p className="mt-2 text-sm text-stone">Sign in to manage shop pricing, availability and products.</p>
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
        <div>
          <label htmlFor="password" className="text-sm text-stone">
            Password
          </label>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-charcoal px-6 py-3 text-sm text-ivory transition-colors hover:bg-accent disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/admin/forgot-password" className="text-stone hover:text-accent">
          Forgot password?
        </Link>
        <Link href="/admin/register" className="text-stone hover:text-accent">
          Register admin
        </Link>
      </div>
    </div>
  );
}
