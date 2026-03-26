import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";





export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // make it true later for email verification

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
        envVars.BETTER_AUTH_URL || "http://localhost:3000",
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