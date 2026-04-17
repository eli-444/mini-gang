import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
