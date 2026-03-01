import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainContent } from "@/components/layout/main-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar />
        <MainContent>
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </MainContent>
      </div>
    </SidebarProvider>
  );
}
