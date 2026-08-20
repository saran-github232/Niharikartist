import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, decodeSessionCookie, isAuthConfigured } from "@/lib/adminAuth";
import AdminLogin from "@/components/admin/AdminLogin";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const jar = await cookies();
  if (decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin");

  return <AdminLogin configured={isAuthConfigured()} />;
}
