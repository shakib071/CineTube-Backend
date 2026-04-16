import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";
import { authService } from "./auth.service";
import { tokenUtils } from "../../utils/token";
import { sendResponse } from "../../shared/sendResponse";
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
        if(token){
            tokenUtils.setBetterAuthSessionCookie(res,token as string);
        }
        
        
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


// const googleLogin = catchAsync((req: Request, res: Response) => {
//     const redirectPath = (req.query.redirect as string) || "/dashboard";
//     const encodedRedirectPath = encodeURIComponent(redirectPath);
//     const callbackURL = `${envVars.FRONTEND_URL}/auth/callback?redirect=${encodedRedirectPath}`;

//     const html = `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Google Login</title>
//         </head>
//         <body>
//             <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
//                 <div style="text-align: center;">
//                     <p>Redirecting To Google...</p>
                    
//                 </div>
//             </div>

//             <script>
//                 const callbackURL = "${callbackURL}";
//                 const betterAuthUrl = "${envVars.BETTER_AUTH_URL}";

//                 async function signInWithGoogle() {
//                     try {
//                         const response = await fetch(betterAuthUrl + "/api/auth/sign-in/social", {
//                             method: "POST",
//                             headers: {
//                                 "Content-Type": "application/json"
//                             },
//                             credentials: "include",
//                             body: JSON.stringify({
//                                 provider: "google",
//                                 callbackURL: callbackURL
//                             })
//                         });

//                         const data = await response.json();

//                         if(data.url){
//                             window.location.href = data.url;
//                         } else {
//                             document.body.innerHTML = '<div style="text-align: center; padding: 50px;"><p>Error: Could not get Google OAuth URL</p></div>';
//                         }
//                     } catch (error) {
//                         document.body.innerHTML = '<div style="text-align: center; padding: 50px;"><p>Error: ' + error.message + '</p></div>';
//                     }
//                 }

//                 // Auto-trigger on page load
//                 window.onload = signInWithGoogle;
//             </script>
//         </body>
//         </html>
//     `;

//     // const html2 = 
//     res.send(html);
// });



const googleLogin = catchAsync((req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/user/dashboard";
    const encodedRedirectPath = encodeURIComponent(redirectPath);
    const callbackURL = `${envVars.FRONTEND_URL}/auth/callback?redirect=${encodedRedirectPath}`;

    const html = `<!DOCTYPE html><html><head><title>Redirecting...</title></head><body>
        <p style="text-align:center;margin-top:40vh;font-family:sans-serif">Redirecting to Google...</p>
        <script>
            fetch("${envVars.BETTER_AUTH_URL}/api/auth/sign-in/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ provider: "google", callbackURL: "${callbackURL}" })
            })
            .then(r => r.json())
            .then(data => { if (data.url) window.location.href = data.url; })
            .catch(e => { document.body.innerHTML = "Error: " + e.message; });
        </script>
    </body></html>`;

    res.send(html);
});


// const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
//     const redirectPath = req.query.redirect as string || "/dashboard";

//     const sessionToken = req.cookies["better-auth.session_token"];

//     if(!sessionToken){
//         return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
//     }

//     const session = await auth.api.getSession({
//         headers:{
//             "Cookie" : `better-auth.session_token=${sessionToken}`
//         }
//     })

//     if (!session) {
//         return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
//     }


//     if(session && !session.user){
//         return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
//     }

//     const result = await authService.googleLoginSuccess(session);

//     const {accessToken, refreshToken} = result;

//     tokenUtils.setAccessTokenCookie(res, accessToken);
//     tokenUtils.setRefreshTokenCookie(res, refreshToken);
//     const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
//     const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

//     res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
// })





const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const cookieHeader = req.headers.cookie || "";

  // better-auth sets __Secure- prefixed cookies in production (HTTPS)
  const sessionToken =
    req.cookies["__Secure-better-auth.session_token"] ||
    req.cookies["better-auth.session_token"] ||
    cookieHeader.match(/__Secure-better-auth\.session_token=([^;]+)/)?.[1] ||
    cookieHeader.match(/better-auth\.session_token=([^;]+)/)?.[1];

  if (!sessionToken) {
    return res
      .status(401)
      .json({ success: false, message: "No session found" });
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      Cookie: `__Secure-better-auth.session_token=${sessionToken}`,
    }),
  });

  if (!session?.user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid session" });
  }

  const result = await authService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Google login successful",
    data: { accessToken, refreshToken, sessionToken },
  });
});


const handleOAuthError = catchAsync((req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
})


const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        await authService.verifyEmail(email, otp);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Email verified successfully",
        });
    }
)

const forgetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        await authService.forgetPassword(email);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset OTP sent to email successfully",
        });
    }
)

const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;
        await authService.resetPassword(email, otp, newPassword);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset successfully",
        });
    }
)


const resendVerifyEmail = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.resendVerifyEmail(email);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Verification OTP resent successfully",
    });
  }
);

const resendForgetPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.resendForgetPassword(email);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Password reset OTP resent successfully",
    });
  }
);


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
    verifyEmail,
    forgetPassword,
    resetPassword,
    resendVerifyEmail,
    resendForgetPassword
}