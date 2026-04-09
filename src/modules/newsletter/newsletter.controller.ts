import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { newsletterService } from "./newsletter.service";
import { IQueryParams } from "../../interfaces/query.interface";


// POST /api/v1/newsletter
const subscribe = catchAsync(async (req: Request, res: Response) => {
  const result = await newsletterService.subscribe(req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Successfully subscribed to the newsletter",
    data: result,
  });
});


// GET /api/v1/newsletter  (admin only)
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await newsletterService.getAll(req.query as IQueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Newsletter subscribers fetched",
    data: result.data,
    meta: result.meta,
  });
});

export const newsletterController = { subscribe , getAll };
