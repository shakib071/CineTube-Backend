import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { reviewService } from "./review.service";
import { IQueryParams } from "../../interfaces/query.interface";

// ── Reviews ───────────────────────────────────────────────────────────────────

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.createReview(req.user, req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Review submitted and pending approval",
    data: result,
  });
});

// PUBLIC — for the detail page, no auth required
const getPublicReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getPublicReviews(req.query as IQueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

// ADMIN — all reviews with any filter
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getAllReviews(req.query as IQueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const approveRejectReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.approveRejectReview(req.params.id as string, req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: `Review ${req.body.status.toLowerCase()} successfully`,
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.deleteReview(req.params.id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// ── Likes ─────────────────────────────────────────────────────────────────────

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.toggleLike(req.user, req.params.id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.liked ? "Review liked" : "Review unliked",
    data: result,
  });
});

// ── Comments ──────────────────────────────────────────────────────────────────

const addComment = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.addComment(req.user, req.params.id as string, req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getPublicReviews,
  getAllReviews,
  approveRejectReview,
  deleteReview,
  toggleLike,
  addComment,
};
