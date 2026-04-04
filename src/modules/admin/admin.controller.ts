import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { adminUserService } from "./admin.service";
import { IQueryParams } from "../../interfaces/query.interface";


const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminUserService.getAllUsers(req.query as IQueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const blockUnblockUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status: userStatus } = req.body;
  const result = await adminUserService.blockUnblockUser(id as string, userStatus);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminUserService.softDeleteUser(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const adminUserController = {
  getAllUsers,
  blockUnblockUser,
  softDeleteUser,
};
