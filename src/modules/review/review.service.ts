import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  ICreateReviewPayload,
  IApproveRejectPayload,
  ICreateCommentPayload,
} from "./review.validation";

// ── Reviews ───────────────────────────────────────────────────────────────────

const createReview = async (user: IRequestUser, payload: ICreateReviewPayload) => {
  const media = await prisma.media.findUnique({ where: { id: payload.mediaId } });
  if (!media) throw new AppError(status.NOT_FOUND, "Media not found");

  // one review per user per media
  const existing = await prisma.review.findFirst({
    where: { userId: user.userId, mediaId: payload.mediaId },
  });
  if (existing) throw new AppError(status.CONFLICT, "You have already reviewed this title");

  const review = await prisma.review.create({
    data: {
      userId: user.userId,
      mediaId: payload.mediaId,
      rating: payload.rating,
      review_content: payload.review_content,
      hasSpoiler: payload.hasSpoiler ?? false,
      tags: payload.tags ?? [],
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return review;
};

const getPublicReviews = async (queryParams: IQueryParams) => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 5;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    isPublished: true, // only approved reviews
  };

  if (queryParams.mediaId) where.mediaId = queryParams.mediaId;

  const [total, data] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        likes: { select: { id: true, userId: true } },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, image: true } },
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAllReviews = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.review, queryParams, {
    searchableFields: ["review_content"],
    filterableFields: ["status", "isPublished", "mediaId"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute();

  return result;
};

const approveRejectReview = async (id: string, payload: IApproveRejectPayload) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError(status.NOT_FOUND, "Review not found");

  const isPublished = payload.status === "APPROVED";

  const updated = await prisma.review.update({
    where: { id },
    data: { status: payload.status, isPublished },
  });

  // recompute averageRating and totalReviews on the media
  const stats = await prisma.review.aggregate({
    where: { mediaId: review.mediaId, isPublished: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.media.update({
    where: { id: review.mediaId },
    data: {
      averageRating: stats._avg.rating ? Number(stats._avg.rating) : null,
      totalReviews: stats._count.id,
    },
  });

  return updated;
};

const deleteReview = async (id: string) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError(status.NOT_FOUND, "Review not found");

  await prisma.review.delete({ where: { id } });

  // recompute after delete
  const stats = await prisma.review.aggregate({
    where: { mediaId: review.mediaId, isPublished: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.media.update({
    where: { id: review.mediaId },
    data: {
      averageRating: stats._avg.rating ? Number(stats._avg.rating) : null,
      totalReviews: stats._count.id,
    },
  });

  return { message: "Review deleted successfully" };
};

// ── Likes ─────────────────────────────────────────────────────────────────────

const toggleLike = async (user: IRequestUser, reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(status.NOT_FOUND, "Review not found");

  const existing = await prisma.like.findUnique({
    where: { userId_reviewId: { userId: user.userId, reviewId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  await prisma.like.create({ data: { userId: user.userId, reviewId } });
  return { liked: true };
};

// ── Comments ──────────────────────────────────────────────────────────────────

const addComment = async (
  user: IRequestUser,
  reviewId: string,
  payload: ICreateCommentPayload
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(status.NOT_FOUND, "Review not found");

  // validate parent comment belongs to same review
  if (payload.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: payload.parentId } });
    if (!parent) throw new AppError(status.NOT_FOUND, "Parent comment not found");
    if (parent.reviewId !== reviewId)
      throw new AppError(status.BAD_REQUEST, "Parent comment does not belong to this review");
  }

  const comment = await prisma.comment.create({
    data: {
      userId: user.userId,
      reviewId,
      content: payload.content,
      parentId: payload.parentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  return comment;
};



export const reviewService = {
  createReview,
  getPublicReviews,
  getAllReviews,
  approveRejectReview,
  deleteReview,
  toggleLike,
  addComment,
};
