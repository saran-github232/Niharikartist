"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { PublicAdmin } from "@/lib/adminStore";

const MAX_ADMINS = 3;

function Tag({ variant, children }: { variant: "owner" | "admin" | "pending" | "you"; children: ReactNode }) {
  const styles = {
    owner: "bg-charcoal text-ivory",
    admin: "border border-stone/30 text-stone",
    pending: "bg-accent text-ivory",
    you: "border border-accent text-accent",
  }[variant];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles}`}>
      {children}
    </span>
  );
}

export default function AdminTeam({
  admins,
  currentAdmin,
  ownerId,
}: {
  admins: PublicAdmin[];
  currentAdmin: PublicAdmin;
  ownerId: string | undefined;
}) {
  const router = useRouter();
  const [adminList, setAdminList] = useState(admins);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isOwner = currentAdmin.id === ownerId;

  const pending = adminList.filter((a) => a.status === "pending");
  const approved = adminList.filter((a) => a.status === "approved");

  async function removeAdmin(id: string, name: string, isReject: boolean) {
    const confirmed = window.confirm(
      isReject
        ? `Reject ${name}'s request? They won't be able to sign in.`
        : `Remove ${name} as an admin? They'll be signed out and can't sign back in.`
    );
    if (!confirmed) return;
    setError(null);
    setBusyId(id);
    const res = await fetch("/api/admin/admins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setAdminList((prev) => prev.filter((a) => a.id !== id));
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't do that.");
    }
    setBusyId(null);
    router.refresh();
  }

  async function approveAdmin(id: string) {
    setError(null);
    setBusyId(id);
    const res = await fetch("/api/admin/admins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setAdminList((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)));
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't approve that request.");
    }
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:px-8">
      <Link href="/admin" className="text-sm text-stone hover:text-accent">
        ← Back to dashboard
      </Link>

      <h1 className="mt-4 font-serif text-2xl text-ink">Team</h1>
      <p className="mt-1 text-sm text-stone">
        {isOwner
          ? `You're the owner — you approve requests and can remove other admins. ${adminList.length}/${MAX_ADMINS} seats used.`
          : `Only the owner can approve or remove admins. ${adminList.length}/${MAX_ADMINS} seats used.`}
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {isOwner && pending.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium tracking-wide text-ink">Pending requests</h2>
          <ul className="mt-3 divide-y divide-sand/60 rounded-lg border border-accent/40 bg-accent/5">
            {pending.map((admin) => (
              <li key={admin.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 truncate text-sm font-medium text-ink">
                    {admin.name}
                    <Tag variant="pending">Pending</Tag>
                  </p>
                  <p className="truncate text-xs text-stone">{admin.email}</p>
                  <p className="text-xs text-stone">
                    Requested {new Date(admin.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2 sm:self-center">
                  <button
                    type="button"
                    onClick={() => approveAdmin(admin.id)}
                    disabled={busyId === admin.id}
                    className="rounded-full bg-charcoal px-4 py-1.5 text-xs text-ivory transition-colors hover:bg-accent disabled:opacity-60"
                  >
                    {busyId === admin.id ? "…" : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAdmin(admin.id, admin.name, true)}
                    disabled={busyId === admin.id}
                    className="rounded-full border border-red-700/30 px-4 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-medium tracking-wide text-ink">Admins</h2>
        <ul className="mt-3 divide-y divide-sand/60 rounded-lg border border-sand bg-ivory">
          {approved.map((admin) => {
            const adminIsOwner = admin.id === ownerId;
            return (
              <li key={admin.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 truncate text-sm font-medium text-ink">
                    {admin.name}
                    <Tag variant={adminIsOwner ? "owner" : "admin"}>{adminIsOwner ? "Owner" : "Admin"}</Tag>
                    {admin.id === currentAdmin.id && <Tag variant="you">You</Tag>}
                  </p>
                  <p className="truncate text-xs text-stone">{admin.email}</p>
                  <p className="text-xs text-stone">
                    Joined {new Date(admin.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </p>
                </div>

                {isOwner && admin.id !== currentAdmin.id && (
                  <button
                    type="button"
                    onClick={() => removeAdmin(admin.id, admin.name, false)}
                    disabled={busyId === admin.id}
                    className="shrink-0 rounded-full border border-red-700/30 px-4 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60 sm:self-center"
                  >
                    {busyId === admin.id ? "Removing…" : "Remove"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {adminList.length < MAX_ADMINS && (
        <Link
          href="/admin/register"
          className="mt-6 inline-block rounded-full bg-charcoal px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-accent"
        >
          Register another admin
        </Link>
      )}
    </div>
  );
}
