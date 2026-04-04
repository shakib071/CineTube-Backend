


import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { mediaService } from "./media.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createMedia = catchAsync(async (req: Request, res: Response) => {
  // thumbnail uploaded via multer → CloudinaryStorage → req.file.path
  const thumbnailUrl = req.file?.path;

  // parse arrays and booleans from FormData strings
  const body = {
    ...req.body,
    genre: req.body.genre
      ? JSON.parse(req.body.genre)
      : [],
    cast: req.body.cast
      ? JSON.parse(req.body.cast)
      : [],
    releaseYear: req.body.releaseYear
      ? Number(req.body.releaseYear)
      : undefined,
    releaseMonth: req.body.releaseMonth
      ? Number(req.body.releaseMonth)
      : undefined,
    price: req.body.price
      ? Number(req.body.price)
      : undefined,
    isPublished: req.body.isPublished === "true",
    isFeatured: req.body.isFeatured === "true",
  };

  const result = await mediaService.createMedia(body, thumbnailUrl);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Media created successfully",
    data: result,
  });
});

const getAllMedia = catchAsync(async (req: Request, res: Response) => {
  const result = await mediaService.getAllMedia(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMediaById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await mediaService.getMediaById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media fetched successfully",
    data: result,
  });
});

const updateMedia = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const thumbnailUrl = req.file?.path;

  const body = {
    ...req.body,
    genre: req.body.genre ? JSON.parse(req.body.genre) : undefined,
    cast: req.body.cast ? JSON.parse(req.body.cast) : undefined,
    releaseYear: req.body.releaseYear ? Number(req.body.releaseYear) : undefined,
    releaseMonth: req.body.releaseMonth ? Number(req.body.releaseMonth) : undefined,
    price: req.body.price ? Number(req.body.price) : undefined,
    isPublished: req.body.isPublished !== undefined
      ? req.body.isPublished === "true"
      : undefined,
    isFeatured: req.body.isFeatured !== undefined
      ? req.body.isFeatured === "true"
      : undefined,
  };

  const result = await mediaService.updateMedia(id as string, body, thumbnailUrl);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media updated successfully",
    data: result,
  });
});

const deleteMedia = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await mediaService.deleteMedia(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media deleted successfully",
    data: result,
  });
});

export const mediaController = {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
};
