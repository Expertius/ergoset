import { validateInviteToken } from "@/actions/invite";
import { InviteForm } from "./invite-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await validateInviteToken(token);

  if (!result.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-lg">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Ошибка</h1>
            <p className="text-muted-foreground">{result.error}</p>
          </div>
          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Перейти на страницу входа
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Активация аккаунта</h1>
          <p className="text-muted-foreground">
            Здравствуйте, {result.clientName}! Задайте пароль для входа в личный кабинет.
          </p>
        </div>
        <InviteForm token={token} email={result.clientEmail || ""} />
      </div>
    </div>
  );
}
