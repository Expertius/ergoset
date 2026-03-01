import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ManagerDashboard } from "@/components/dashboard/manager-dashboard";
import { LogisticsDashboard } from "@/components/dashboard/logistics-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  switch (session.role) {
    case "MANAGER":
      return <ManagerDashboard userId={session.id} />;
    case "LOGISTICS":
      return <LogisticsDashboard />;
    default:
      return <AdminDashboard />;
  }
}
