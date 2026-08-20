import AdminResetPassword from "@/components/admin/AdminResetPassword";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <AdminResetPassword token={token ?? ""} />;
}
