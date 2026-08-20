import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { hashPassword } from "./password";

// Same file-backed-JSON approach as shopOverrides.ts, and the same caveat
// applies: durable in local dev / on a persistent-disk host, NOT reliable on
// serverless (Vercel/Netlify functions have an ephemeral filesystem). Admin
// accounts are exactly the kind of data where that matters most — if this
// deploys to serverless, swap read/write here for a real database before
// relying on registration/login actually sticking between requests.
export const MAX_ADMINS = 3;

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  /** The very first admin ever (no one to approve them) is auto-approved.
   *  Everyone after that starts pending until the Owner approves them —
   *  a pending account can't log in. */
  status: "pending" | "approved";
}

export type PublicAdmin = Omit<AdminAccount, "passwordHash">;

const FILE_PATH = path.join(process.cwd(), "data", "admins.json");

async function readAdmins(): Promise<AdminAccount[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    // Accounts written before the approval system existed have no `status`
    // field — treat them as already-approved rather than losing them.
    return Array.isArray(parsed) ? parsed.map((a) => ({ status: "approved", ...a })) : [];
  } catch {
    return [];
  }
}

async function writeAdmins(admins: AdminAccount[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(admins, null, 2) + "\n", "utf8");
}

export function toPublicAdmin(a: AdminAccount): PublicAdmin {
  const { passwordHash: _passwordHash, ...rest } = a;
  return rest;
}

/** The earliest-registered admin is the Owner — no stored role/migration
 *  needed, and ownership transfers automatically if that account is ever
 *  removed. Only the Owner can remove other admins (registration itself
 *  stays open to anyone while a seat is free). */
export function ownerId(admins: Array<{ id: string; createdAt: string }>): string | undefined {
  if (admins.length === 0) return undefined;
  return admins.reduce((owner, a) => (a.createdAt < owner.createdAt ? a : owner)).id;
}

export async function listAdmins(): Promise<AdminAccount[]> {
  return readAdmins();
}

export async function findAdminByEmail(email: string): Promise<AdminAccount | undefined> {
  const admins = await readAdmins();
  return admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
}

export async function findAdminById(id: string): Promise<AdminAccount | undefined> {
  const admins = await readAdmins();
  return admins.find((a) => a.id === id);
}

export async function registerAdmin(
  name: string,
  email: string,
  password: string
): Promise<{ ok: true; admin: AdminAccount } | { ok: false; error: string }> {
  const admins = await readAdmins();
  if (admins.length >= MAX_ADMINS) {
    return { ok: false, error: `Maximum of ${MAX_ADMINS} admins reached. An existing admin must be removed first.` };
  }
  if (admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An admin with that email already exists." };
  }
  const admin: AdminAccount = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    status: admins.length === 0 ? "approved" : "pending",
  };
  admins.push(admin);
  await writeAdmins(admins);
  return { ok: true, admin };
}

/** Owner-only: grants a pending request access. */
export async function approveAdmin(id: string): Promise<boolean> {
  const admins = await readAdmins();
  const admin = admins.find((a) => a.id === id);
  if (!admin || admin.status === "approved") return false;
  admin.status = "approved";
  await writeAdmins(admins);
  return true;
}

export async function removeAdmin(id: string): Promise<boolean> {
  const admins = await readAdmins();
  const next = admins.filter((a) => a.id !== id);
  if (next.length === admins.length) return false;
  await writeAdmins(next);
  return true;
}

export async function setAdminPassword(id: string, newPassword: string): Promise<boolean> {
  const admins = await readAdmins();
  const admin = admins.find((a) => a.id === id);
  if (!admin) return false;
  admin.passwordHash = hashPassword(newPassword);
  await writeAdmins(admins);
  return true;
}
