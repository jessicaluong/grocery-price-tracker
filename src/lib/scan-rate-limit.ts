import prisma from "@/lib/db";
import { DAILY_SCAN_LIMIT, MONTHLY_SCAN_LIMIT } from "./constants";

export async function checkAndUpdateScanUsage(userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return prisma.$transaction(async (tx) => {
    const userUsage = await tx.scanUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (userUsage && userUsage.count >= DAILY_SCAN_LIMIT) {
      return { success: false, message: "Daily scan limit reached" };
    }

    const { _sum } = await tx.scanUsage.aggregate({
      _sum: { count: true },
      where: { date: { gte: firstOfMonth } },
    });

    if ((_sum.count ?? 0) >= MONTHLY_SCAN_LIMIT) {
      return { success: false, message: "Monthly scan limit reached" };
    }

    await tx.scanUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { count: { increment: 1 } },
      create: { userId, date: today, count: 1 },
    });

    return { success: true };
  });
}

export async function getScanUsage(userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [userUsage, totalMonthlyUsage] = await Promise.all([
    prisma.scanUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    }),

    prisma.scanUsage.aggregate({
      _sum: { count: true },
      where: { date: { gte: firstOfMonth } },
    }),
  ]);

  const dailyUsed = userUsage?.count || 0;
  const dailyRemaining = Math.max(0, DAILY_SCAN_LIMIT - dailyUsed);

  const monthlyUsed = totalMonthlyUsage?._sum.count || 0;
  const monthlyRemaining = Math.max(0, MONTHLY_SCAN_LIMIT - monthlyUsed);

  return {
    dailyRemaining,
    monthlyRemaining,
  };
}
