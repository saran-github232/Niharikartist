import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminConfigured, isValidSession } from "@/lib/adminAuth";
import { getEffectiveShopArtworks } from "@/lib/shopOverrides";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const jar = await cookies();
  const authed = isValidSession(jar.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return <AdminLogin configured={isAdminConfigured()} />;
  }

  const items = await getEffectiveShopArtworks();
  return <AdminDashboard initialItems={items} />;
}
