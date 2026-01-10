// globalErrorHandler.ts
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import ApiError from "./ApiError";
import config from "../config/index";
import handlePrismaError from "./handlePrismaError";
import { TErrorSources } from "@/interfaces/error";
import handleZodError from "./handleZodError";

// Type guard for Prisma errors
const isPrismaError = (err: any): err is { code: string; meta?: any; message: string } => {
    return err && typeof err === "object" && "code" in err && typeof err.code === "string" && err.code.startsWith("P");
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next): void => {
    let statusCode = 500;
    let message = "Something went wrong!";
    let errorSources: TErrorSources = [
        {
            path: "",
            message: "Something went wrong",
        },
    ];

    if (err instanceof ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    } else if (isPrismaError(err)) {
        const simplifiedError = handlePrismaError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    } else if (err instanceof ApiError) {
        statusCode = err?.statusCode;
        message = err.message;
        errorSources = [
            {
                path: "",
                message: err?.message,
            },
        ];
    } else if (err instanceof Error) {
        message = err.message;
        errorSources = [
            {
                path: "",
                message: err?.message,
            },
        ];
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err,
        stack: config.node_env === "development" ? err?.stack : null,
    });
};

export default globalErrorHandler;
