// admin-api/src/lib/userSettings.ts
import { prisma } from "@/lib/prisma";

/**
 * will never fail if multiple requests try to create settings at once.
 */
export async function getOrCreateUserSettings(userId: string) {
  if (!userId) throw new Error("userId is required");

  return prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}
