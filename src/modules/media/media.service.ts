import status from "http-status";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateMediaPayload, IUpdateMediaPayload } from "./media.validation";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const createMedia = async (
  payload: ICreateMediaPayload,
  thumbnailUrl?: string
) => {
  const media = await prisma.media.create({
    data: {
      ...payload,
      thumbnailUrl: thumbnailUrl || null,
    },
  });

  return media;
};

const getAllMedia = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.media, queryParams, {
    searchableFields: ["title", "synopsis", "director"],
    filterableFields: [
      "type",
      "pricingType",
      "platform",
      "isPublished",
      "isFeatured",
    ],
  })
    .search()
    .filter()
    .sort()
    .paginate();

    if (queryParams.genre) {
      result.where({ genre: { has: queryParams.genre } });
  }

  return result.execute();
};

const getMediaById = async (id: string) => {
  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      reviews: {
        where: { isPublished: true },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (!media) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  return media;
};

const updateMedia = async (
  id: string,
  payload: IUpdateMediaPayload,
  thumbnailUrl?: string
) => {
  const existing = await prisma.media.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  // delete old thumbnail if new one uploaded
  if (thumbnailUrl && existing.thumbnailUrl) {
    await deleteFileFromCloudinary(existing.thumbnailUrl);
  }

  const media = await prisma.media.update({
    where: { id },
    data: {
      ...payload,
      ...(thumbnailUrl && { thumbnailUrl }),
    },
  });

  return media;
};

const deleteMedia = async (id: string) => {
  const existing = await prisma.media.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  // delete thumbnail from cloudinary
  if (existing.thumbnailUrl) {
    await deleteFileFromCloudinary(existing.thumbnailUrl);
  }

  await prisma.media.delete({ where: { id } });

  return { message: "Media deleted successfully" };
};

export const mediaService = {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
};
