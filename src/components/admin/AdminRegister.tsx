"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import PasswordInput from "./PasswordInput";

export default function AdminRegister({
  configured,
  atCapacity,
  alreadySignedIn,
  isFirstEver,
}: {
  configured: boolean;
  atCapacity: boolean;
  alreadySignedIn: boolean;
  isFirstEver: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Registration failed.");
        return;
      }
      if (data?.pending) {
        setRequestSent(true);
        return;
      }
      router.push(alreadySignedIn ? "/admin/team" : "/admin");
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
          variable to enable admin registration.
        </p>
      </div>
    );
  }

  if (atCapacity) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24 text-center">
        <h1 className="font-serif text-xl text-ink">Admin limit reached</h1>
        <p className="mt-3 text-sm text-stone">
          The maximum number of admins is already registered. {alreadySignedIn ? "Remove one from the Team page" : "An existing admin has to sign in and remove one"} before a new admin can register.
        </p>
        <Link
          href={alreadySignedIn ? "/admin/team" : "/admin/login"}
          className="mt-6 inline-block rounded-full bg-charcoal px-6 py-3 text-sm text-ivory transition-colors hover:bg-accent"
        >
          {alreadySignedIn ? "Back to Team" : "Back to sign in"}
        </Link>
      </div>
    );
  }

  if (requestSent) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24 text-center">
        <h1 className="font-serif text-xl text-ink">Request sent</h1>
        <p className="mt-3 text-sm text-stone">
          {alreadySignedIn
            ? "They've been added as pending. Approve them from the Team page once they're ready to sign in."
            : "The site owner needs to approve this account before you can sign in. Check back once they have."}
        </p>
        <Link
          href={alreadySignedIn ? "/admin/team" : "/admin/login"}
          className="mt-6 inline-block rounded-full bg-charcoal px-6 py-3 text-sm text-ivory transition-colors hover:bg-accent"
        >
          {alreadySignedIn ? "Back to Team" : "Back to sign in"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-serif text-2xl text-ink">
        {alreadySignedIn ? "Add a new admin" : "Register admin"}
      </h1>
      <p className="mt-2 text-sm text-stone">
        {isFirstEver
          ? "You'll be the first admin and the owner of this shop."
          : alreadySignedIn
            ? "You'll stay signed in as yourself. They'll show up as pending until you approve them from the Team page."
            : "Your request will need approval from the site owner before you can sign in."}
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="text-sm text-stone">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-sand bg-ivory px-4 py-3 text-ink focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm text-stone">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
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
            minLength={8}
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
          {alreadySignedIn
            ? loading
              ? "Adding…"
              : "Add admin"
            : loading
              ? "Sending…"
              : isFirstEver
                ? "Register"
                : "Request access"}
        </button>
      </form>
      <Link
        href={alreadySignedIn ? "/admin/team" : "/admin/login"}
        className="mt-6 text-sm text-ink underline decoration-accent underline-offset-4 hover:text-accent"
      >
        {alreadySignedIn ? "← Back to Team" : "Already have an account? Sign in"}
      </Link>
    </div>
  );
}
