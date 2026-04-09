
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

const getStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalMedia,
    totalMovies,
    totalSeries,
    totalReviews,
    pendingReviews,
    totalNewsletterSubscribers,
    totalActiveSubscriptions,
    revenueResult,
    recentPurchases,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { isDeleted: false, status: "ACTIVE" } }),
    prisma.media.count({ where: { isPublished: true } }),
    prisma.media.count({ where: { isPublished: true, type: "MOVIE" } }),
    prisma.media.count({ where: { isPublished: true, type: "SERIES" } }),
    prisma.review.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.newsletter.count(),
    prisma.subscription.count({ where: { status: "ACTIVE", endDate: { gt: new Date() } } }),
    prisma.purchase.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.purchase.findMany({
      where: { status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, name: true, email: true } },
        media: { select: { id: true, title: true } },
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
    },
    media: {
      total: totalMedia,
      movies: totalMovies,
      series: totalSeries,
    },
    reviews: {
      total: totalReviews,
      pending: pendingReviews,
      approved: totalReviews - pendingReviews,
    },
    newsletter: {
      totalSubscribers: totalNewsletterSubscribers,
    },
    subscriptions: {
      active: totalActiveSubscriptions,
    },
    revenue: {
      total: revenueResult._sum.amount ?? 0,
    },
    recentPurchases,
  };
};

export const statsService = {
    getUserStats,
    getStats
};