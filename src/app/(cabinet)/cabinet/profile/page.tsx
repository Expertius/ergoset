import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClientByUserId } from "@/services/cabinet";
import { ProfileForm } from "./profile-form";

export default async function CabinetProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const client = await getClientByUserId(session.id);
  if (!client) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
        <p className="text-muted-foreground">
          Ваши контактные данные
        </p>
      </div>

      <ProfileForm
        clientId={client.id}
        fullName={client.fullName}
        email={client.email || ""}
        phone={client.phone || ""}
        actualAddress={client.actualAddress || ""}
      />
    </div>
  );
}
