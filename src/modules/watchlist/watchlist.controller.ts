import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { watchlistService } from "./watchlist.service";

const addToWatchlist = catchAsync(async (req: Request, res: Response) => {
  const result = await watchlistService.addToWatchlist(req.user, req.params.mediaId as string);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Added to watchlist",
    data: result,
  });
});

const removeFromWatchlist = catchAsync(async (req: Request, res: Response) => {
  const result = await watchlistService.removeFromWatchlist(req.user, req.params.mediaId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const getWatchlist = catchAsync(async (req: Request, res: Response) => {
  const result = await watchlistService.getWatchlist(req.user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Watchlist fetched successfully",
    data: result,
  });
});

const checkWatchlist = catchAsync(async (req: Request, res: Response) => {
  const result = await watchlistService.isInWatchlist(req.user, req.params.mediaId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Watchlist status checked",
    data: result,
  });
});

export const watchlistController = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  checkWatchlist,
};
