import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
    DATABASE_URL: string,
    PORT:string,
    BETTER_AUTH_SECRET: string,
    BETTER_AUTH_URL: string,
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_CALLBACK_URL: string,
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
    EMAIL_SENDER: {
        SMTP_USER: string,
        SMTP_PASS: string,
        SMTP_HOST: string,
        SMTP_PORT: string,
        SMTP_FROM: string
    },
    FRONTEND_URL: string;
    ADMIN_NAME: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
}

const loadEnvVariables = (): EnvConfig => {

    const requiredEnvVariables = [
        "DATABASE_URL",
        "PORT",
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_CALLBACK_URL",
        "EMAIL_SENDER_SMTP_USER",
        "EMAIL_SENDER_SMTP_PASS",
        "EMAIL_SENDER_SMTP_HOST",
        "EMAIL_SENDER_SMTP_PORT",
        "EMAIL_SENDER_SMTP_FROM",
        "ACCESS_TOKEN_SECRET",
        "REFRESH_TOKEN_SECRET",
        "ACCESS_TOKEN_EXPIRES_IN",
        "REFRESH_TOKEN_EXPIRES_IN",
        "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
        "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
        "FRONTEND_URL",
        "ADMIN_NAME",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",


    ]

    requiredEnvVariables?.forEach((envVariable) => {
        if (!process.env[envVariable]) {
            throw new Error(`Missing environment variable: ${envVariable}`);
        }
    })
    
    return {
        DATABASE_URL: process.env.DATABASE_URL!,
        PORT: process.env.PORT!,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL!,
        EMAIL_SENDER: {
            SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
            SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
            SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
            SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
            SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
        },
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
        ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN!,
        REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN!,
        BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN!,
        BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE!,
        FRONTEND_URL: process.env.FRONTEND_URL!,
        ADMIN_NAME: process.env.ADMIN_NAME!,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
    }
};

export const envVars = loadEnvVariables();