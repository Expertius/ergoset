import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { UserProvider } from "@/components/layout/user-context";
import { MainContent } from "@/components/layout/main-content";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "CLIENT") redirect("/cabinet");

  return (
    <UserProvider role={session.role} fullName={session.fullName}>
      <SidebarProvider>
        <div className="min-h-screen">
          <Sidebar />
          <MainContent>
            <Header />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </MainContent>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
