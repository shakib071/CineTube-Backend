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
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";



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

const changePassword = catchAsync(
    async (req:Request,res:Response) => {
        const payload = req.body;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        const result = await authService.changePassword(payload,betterAuthSessionToken);

        const {accessToken,refreshToken,token} = result;

        tokenUtils.setAccessTokenCookie(res,accessToken);
        tokenUtils.setRefreshTokenCookie(res,refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res,token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: result
        })
    }
)



const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
        }
        const result = await authService.getNewToken(refreshToken, betterAuthSessionToken);

        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New tokens generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,
            },
        });
    }
)


const googleLogin = catchAsync((req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/dashboard";

    const encodedRedirectPath = encodeURIComponent(redirectPath as string);

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

    res.render("googleRedirect", {
        callbackURL : callbackURL,
        betterAuthUrl : envVars.BETTER_AUTH_URL,
    })
})


const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";

    const sessionToken = req.cookies["better-auth.session_token"];

    if(!sessionToken){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
        headers:{
            "Cookie" : `better-auth.session_token=${sessionToken}`
        }
    })

    if (!session) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }


    if(session && !session.user){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await authService.googleLoginSuccess(session);

    const {accessToken, refreshToken} = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
})


const handleOAuthError = catchAsync((req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
})


export const authController = {
    register,
    login,
    getMe,
    logout,
    changePassword,
    getNewToken,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError,
}