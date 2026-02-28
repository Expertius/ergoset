import { prisma } from "./db";
import { getSession } from "./auth";

export async function logAudit(
  entityType: string,
  entityId: string,
  action: string,
  payload?: Record<string, unknown>
) {
  try {
    const session = await getSession();
    await prisma.auditLog.create({
      data: {
        userId: session?.id,
        entityType,
        entityId,
        action,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
      },
    });
  } catch {
    // Non-critical: don't break operations if audit fails
  }
}
