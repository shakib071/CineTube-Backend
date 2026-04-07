import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { purchaseService } from "./purchase.service";

// POST /api/v1/purchase/:mediaId
const createPurchase = catchAsync(async (req: Request, res: Response) => {
  const result = await purchaseService.createPurchase(
    req.user,
    req.params.mediaId as string,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Payment session created",
    data: result,
  });
});

// GET /api/v1/purchase
const getPurchaseHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await purchaseService.getPurchaseHistory(req.user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Purchase history fetched successfully",
    data: result,
  });
});

// GET /api/v1/purchase/access/:mediaId  — check if user can watch this title
const checkAccess = catchAsync(async (req: Request, res: Response) => {
  const hasAccess = await purchaseService.hasActiveAccess(
    req.user.userId,
    req.params.mediaId as string
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Access status checked",
    data: { hasAccess },
  });
});



export const purchaseController = {
  createPurchase,
  getPurchaseHistory,
  checkAccess,

};
