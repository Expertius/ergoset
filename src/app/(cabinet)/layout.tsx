import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CabinetHeader } from "@/components/cabinet/cabinet-header";

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "CLIENT") redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <CabinetHeader fullName={session.fullName} />
      <main className="flex-1 mx-auto w-full max-w-5xl p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
