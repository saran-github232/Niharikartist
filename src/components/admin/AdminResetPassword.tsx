"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import PasswordInput from "./PasswordInput";

export default function AdminResetPassword({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Reset failed.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24 text-center">
        <h1 className="font-serif text-xl text-ink">Missing reset token</h1>
        <p className="mt-3 text-sm text-stone">
          This page needs a reset link. Request one from{" "}
          <Link href="/admin/forgot-password" className="text-accent">
            the forgot-password page
          </Link>
          .
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24 text-center">
        <h1 className="font-serif text-xl text-ink">Password updated</h1>
        <p className="mt-3 text-sm text-stone">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-serif text-2xl text-ink">Set a new password</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="password" className="text-sm text-stone">
            New password
          </label>
          <PasswordInput
            id="password"
            required
            minLength={8}
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-stone">At least 8 characters.</p>
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
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
