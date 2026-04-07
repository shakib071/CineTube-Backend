import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const addToWatchlist = async (user: IRequestUser, mediaId: string) => {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new AppError(status.NOT_FOUND, "Media not found");

  const existing = await prisma.watchlist.findUnique({
    where: { userId_mediaId: { userId: user.userId, mediaId } },
  });
  if (existing) throw new AppError(status.CONFLICT, "Already in your watchlist");

  const item = await prisma.watchlist.create({
    data: { userId: user.userId, mediaId },
    include: {
      media: {
        select: {
          id: true, title: true, thumbnailUrl: true,
          type: true, pricingType: true, averageRating: true,
          totalReviews: true, genre: true, releaseYear: true,
        },
      },
    },
  });

  return item;
};

const removeFromWatchlist = async (user: IRequestUser, mediaId: string) => {
  const existing = await prisma.watchlist.findUnique({
    where: { userId_mediaId: { userId: user.userId, mediaId } },
  });
  if (!existing) throw new AppError(status.NOT_FOUND, "Item not in your watchlist");

  await prisma.watchlist.delete({
    where: { userId_mediaId: { userId: user.userId, mediaId } },
  });

  return { message: "Removed from watchlist" };
};

const getWatchlist = async (user: IRequestUser) => {
  const items = await prisma.watchlist.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    include: {
      media: {
        select: {
          id: true, title: true, thumbnailUrl: true, synopsis: true,
          type: true, pricingType: true, platform: true,
          averageRating: true, totalReviews: true,
          genre: true, releaseYear: true, director: true,
        },
      },
    },
  });

  return items;
};

// Check if a specific media is in the user's watchlist
const isInWatchlist = async (user: IRequestUser, mediaId: string) => {
  const item = await prisma.watchlist.findUnique({
    where: { userId_mediaId: { userId: user.userId, mediaId } },
  });
  return { isInWatchlist: !!item };
};

export const watchlistService = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  isInWatchlist,
};
