import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP, oAuthProxy } from "better-auth/plugins";
import { sendEmail } from "../utils/email";





export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, // block login until email verified

    },


    socialProviders:{
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,

            mapProfileToUser: () => {
                return {
                    role: Role.USER,
                    status: UserStatus.ACTIVE,
                    isDeleted: false,
                    emailVerified: true,
                    deletedAt: null,
                }
            },
        }
    },

    emailVerification: {
        sendOnSignIn:true,
        sendOnSignUp:true,
        autoSignInAfterVerification:true,
    },


    user: {
        additionalFields:{
            role: {
                type: "string",
                required:true,
                defaultValue: Role.USER,
            },
            status: {
                type: "string",
                required:true,
                defaultValue: UserStatus.ACTIVE,
            },
            isDeleted: {
                type: "boolean",
                required:true,
                defaultValue: false,
            },
            
            deletedAt: {
                type: "date",
                required:false,
                defaultValue: null,
            },
        }
    },

    plugins: [
        oAuthProxy(),
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({email, otp, type}) {
                if(type === "email-verification"){
                  const user = await prisma.user.findUnique({
                    where : {
                        email,
                    }
                  })

                   if(!user){
                    // console.error(`User with email ${email} not found. Cannot send verification OTP.`);
                    return;
                   }

                   if(user && user.role === Role.ADMIN){
                    // console.log(`User with email ${email} is a admin. Skipping sending verification OTP.`);
                    return;
                   }
                  
                    if (user && !user.emailVerified){
                    sendEmail({
                        to : email,
                        subject : " Email Verification OTP - CineTube",
                        html: `
                            <h2>Email Verification</h2>
                            <p>Hello ${user.name},</p>
                            <p>Your verification OTP is:</p>
                            <h1 style="letter-spacing:3px;">${otp}</h1>
                            <p>This OTP expires in 5 minutes.</p>
                            <br/>
                            <p>— CineTube Team</p>
                        `
                    });
                  }
                }else if(type === "forget-password"){
                    const user = await prisma.user.findUnique({
                        where : {
                            email,
                        }
                    })

                    if(user){
                        sendEmail({
                            to : email,
                            subject : "Password Reset OTP",
                            html: `
                                <h2>Password Reset</h2>
                                <p>Hello ${user.name},</p>
                                <p>Your password reset OTP is:</p>
                                <h1 style="letter-spacing:3px;">${otp}</h1>
                                <p>This OTP expires in 5 minutes.</p>
                                <br/>
                                <p>— CineTube Team</p>
                            `
                        });
                    }
                }
            },
            expiresIn : 5 * 60, // 5 minutes in seconds
            otpLength : 6,
        })
    ],


    session:{
        expiresIn: 60*60*60*24, //1d in seconds
        updateAge: 60*60*60*24, 
        cookieCache:{
            enabled: true,
            maxAge: 60*60*60*24,
        }
    },

    redirectURLs:{
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,

    },

    trustedOrigins: [
        envVars.BETTER_AUTH_URL || "http://localhost:5000",envVars.FRONTEND_URL
    ],
    advanced: {
        // disableCSRFCheck: true,
        useSecureCookies : false,
        cookies:{
            state:{
                attributes:{
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    partitioned: true,
                }
            },
            sessionToken:{
                attributes:{
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    partitioned: true,
                }
            }
        }
    },
});