import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { userService } from "./user.service";


const editProfile = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const {name} = req.body;
        const file = req.file;
        const imageUrl = file?.path;

        const result = await userService.editProfile(user,{name,imageUrl});
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User updated successfully",
            data: result
        })
    }
)



export const userController = {
    editProfile,
}