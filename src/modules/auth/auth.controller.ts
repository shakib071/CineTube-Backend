import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";
import { authService } from "./auth.service";
import { tokenUtils } from "../../utils/token";
import { sendResponse } from "../../shared/sendResponse";
import { log } from "node:console";
import { be } from "zod/v4/locales";
import { CookieUtils } from "../../utils/cookie";



const register = catchAsync(
    async (req:Request,res:Response) => {
        const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue);
        const payload = req.body;

        const result = await authService.register(payload);

        const {accessToken,refreshToken,token,...rest} = result;

        tokenUtils.setAccessTokenCookie(res,accessToken);
        tokenUtils.setRefreshTokenCookie(res,refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res,token as string);
        
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "User registered successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest,
            }
        })
    }
)

const login = catchAsync(
    async (req:Request,res:Response) => {
        const payload = req.body;
        const result = await authService.login(payload);
        const {accessToken,refreshToken,token,...rest} = result;

        tokenUtils.setAccessTokenCookie(res,accessToken);
        tokenUtils.setRefreshTokenCookie(res,refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res,token as string);
        
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest,
            }
        })
    }
)


const getMe = catchAsync(
    async (req:Request,res:Response) => {
        const user = req.user;
        const result = await authService.getMe(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User profile fetched successfully",
            data: result
        })
    }
)


const logout = catchAsync(
    async (req:Request,res:Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        const result = await authService.logout(betterAuthSessionToken);
        CookieUtils.clearCookie(res,'accessToken',{
            httpOnly: true,
            secure:true,
            sameSite: "none"
        });
        CookieUtils.clearCookie(res,'refreshToken',{
            httpOnly: true,
            secure:true,
            sameSite: "none"
        });
        CookieUtils.clearCookie(res,'better-auth.session_token',{
            httpOnly: true,
            secure:true,
            sameSite: "none"
        });
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result
        })
    }
)




export const authController = {
    register,
    login,
    getMe,
    logout,
}