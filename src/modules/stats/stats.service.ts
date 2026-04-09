import { th } from "zod/locales";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";


const getUserStats = async( userId: string ) => {
    
    const [user, watchlistCount, purchasesCount, rentalsCount, reviewsCount, subscription] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
        prisma.watchlist.count({ where: { userId } }),
        prisma.purchase.count({ where: { userId, type: "BUY" } }),
        prisma.purchase.count({ where: { userId, type: "RENT" } }),
        prisma.review.count({ where: { userId } }),
        prisma.subscription.findUnique({ where: { userId } }),
      ]);

    if (!user) {
      throw new AppError(status.NOT_FOUND, "User not found");
    }

    let subscriptionData = null;
    if (subscription && subscription.status === "ACTIVE") {
      subscriptionData = {
        active: true,
        planName:
          subscription.plan.charAt(0) + subscription.plan.slice(1).toLowerCase() + " Plan",
        expiresAt: subscription.endDate.toISOString().split("T")[0],
      };
    }

    const dashboardStats = {
      userName: user.name,
      watchlistCount,
      purchasesCount,
      rentalsCount,
      reviewsCount,
      subscription: subscriptionData,
    };
    return dashboardStats;
}


export const statsService = {
    getUserStats,
};