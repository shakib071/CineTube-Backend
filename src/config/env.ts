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
    }
};

export const envVars = loadEnvVariables();