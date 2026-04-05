import { Response } from "express";

interface IResponseData<T> {
    httpStatusCode: number;
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
}

// Recursively convert BigInt → Number.
// Crucially: leave Date objects alone — JSON.stringify handles them fine as ISO strings.
const serializeBigInt = (value: unknown): unknown => {
    if (typeof value === "bigint") return Number(value);
    if (value instanceof Date) return value; // ← do NOT touch dates
    if (Array.isArray(value)) return value.map(serializeBigInt);
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serializeBigInt(v)])
        );
    }
    return value;
};

export const sendResponse = <T>(res: Response, responseData: IResponseData<T>) => {
    const { httpStatusCode, success, message, data, meta } = responseData;

    res.status(httpStatusCode).json({
        success,
        message,
        data: serializeBigInt(data),
        meta: meta ? serializeBigInt(meta) : undefined,
    });
};
