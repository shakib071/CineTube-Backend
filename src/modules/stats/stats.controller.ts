import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { statsService } from "./stats.service";


const getUserStats = catchAsync(async (req: Request, res: Response) => {
    

    const result = await statsService.getUserStats(req.user.userId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: " User Stats fetched successfully",
        data: result,
    });
});

export const statsController = {
    getUserStats,
};