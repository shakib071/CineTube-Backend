import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";





export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Disabled for development

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

    // emailVerification: {
    //     sendOnSignIn:true,
    //     sendOnSignUp:true,
    //     autoSignInAfterVerification:true,
    // },


    user: {
        additionalFields:{
            role: {
                type: "string",
                required:true,
                default: Role.USER,
            },
            status: {
                type: "string",
                required:true,
                default: UserStatus.ACTIVE,
            },
            isDeleted: {
                type: "boolean",
                required:true,
                default: false,
            },
            
            deletedAt: {
                type: "date",
                required:false,
                default: null,
            },
        }
    },

    plugins: [
        bearer(),
        // emailOTP({
        //     overrideDefaultEmailVerification: true,
        //     async sendVerificationOTP({email, otp, type}) {
        //         if(type === "email-verification"){
        //           const user = await prisma.user.findUnique({
        //             where : {
        //                 email,
        //             }
        //           })

        //            if(!user){
        //             console.error(`User with email ${email} not found. Cannot send verification OTP.`);
        //             return;
        //            }

        //            if(user && user.role === Role.ADMIN){
        //             console.log(`User with email ${email} is a admin. Skipping sending verification OTP.`);
        //             return;
        //            }
                  
        //             if (user && !user.emailVerified){
        //             sendEmail({
        //                 to : email,
        //                 subject : "Verify your email",
        //                 templateName : "otp",
        //                 templateData :{
        //                     name : user.name,
        //                     otp,
        //                 }
        //             })
        //           }
        //         }else if(type === "forget-password"){
        //             const user = await prisma.user.findUnique({
        //                 where : {
        //                     email,
        //                 }
        //             })

        //             if(user){
        //                 sendEmail({
        //                     to : email,
        //                     subject : "Password Reset OTP",
        //                     templateName : "otp",
        //                     templateData :{
        //                         name : user.name,
        //                         otp,
        //                     }
        //                 })
        //             }
        //         }
        //     },
        //     expiresIn : 5 * 60, // 5 minutes in seconds
        //     otpLength : 6,
        // })
    ],


    session:{
        expiresIn: 60*60*60*24, //1d in seconds
        updateAge: 60*60*60*24, 
        cookieCache:{
            enabled: true,
            maxAge: 60*60*60*24,
        }
    },

    redirectUrls:{
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,

    },

    trustedOrigins: [
        envVars.BETTER_AUTH_URL || "http://localhost:3000",envVars.FRONTEND_URL
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
                    path: "/",
                }
            },
            sessionToken:{
                attributes:{
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                }
            }
        }
    },
});