import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { commentsService } from "./comments.service";


const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await commentsService.deleteComment(req.user, req.params.id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: null,
  });
});


export const commentsController = {
  deleteComment,
};