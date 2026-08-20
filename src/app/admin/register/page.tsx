import { cookies } from "next/headers";
import { ADMIN_COOKIE, decodeSessionCookie, isAuthConfigured } from "@/lib/adminAuth";
import { MAX_ADMINS, listAdmins } from "@/lib/adminStore";
import AdminRegister from "@/components/admin/AdminRegister";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminRegisterPage() {
  const jar = await cookies();
  // Deliberately not redirected away when already signed in: an existing
  // admin reaches this page from the Team page to add a teammate, and
  // should stay signed in as themselves while doing it.
  const alreadySignedIn = Boolean(decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value));

  const admins = await listAdmins();
  return (
    <AdminRegister
      configured={isAuthConfigured()}
      atCapacity={admins.length >= MAX_ADMINS}
      alreadySignedIn={alreadySignedIn}
      isFirstEver={admins.length === 0}
    />
  );
}
