// admin-api/src/lib/userSettings.ts
import { prisma } from "./prisma";

export async function getOrCreateUserSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId },
    });
  }

  return settings;
}
