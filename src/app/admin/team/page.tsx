import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, decodeSessionCookie } from "@/lib/adminAuth";
import { findAdminById, listAdmins, ownerId, toPublicAdmin } from "@/lib/adminStore";
import AdminTeam from "@/components/admin/AdminTeam";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const jar = await cookies();
  const session = decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value);
  if (!session) redirect("/admin/login");

  const [admins, currentAdmin] = await Promise.all([listAdmins(), findAdminById(session.adminId)]);
  if (!currentAdmin) redirect("/admin/login");

  return (
    <AdminTeam
      admins={admins.map(toPublicAdmin)}
      currentAdmin={toPublicAdmin(currentAdmin)}
      ownerId={ownerId(admins)}
    />
  );
}
