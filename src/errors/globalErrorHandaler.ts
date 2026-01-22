// import { ErrorRequestHandler } from "express";
// import { ZodError } from "zod";
// import ApiError from "./ApiError";
// import config from "../config/index";
// import handleZodError from "./handleZodError";
// import handlePrismaError from "./handlePrismaError";
// import handleDuplicateError from "./handleDuplicateError";
// import handleCastError from "./handleCastError";
// import { TErrorSources } from "../interfaces/error";

// const globalErrorHandler: ErrorRequestHandler = (err, req, res, next): void => {
//     let statusCode = 500;
//     let message = "Something went wrong!";
//     let errorSources: TErrorSources = [
//         {
//             path: "",
//             message: "Something went wrong",
//         },
//     ];

//     if (err?.message?.includes("Invalid `prisma.") && err?.message?.includes("Expected")) {
//         const simplifiedError = handlePrismaError(err);
//         statusCode = simplifiedError?.statusCode;
//         message = simplifiedError?.message;
//         errorSources = simplifiedError?.errorSources;
//     }
//     if (err instanceof ZodError) {
//         const simplifiedError = handleZodError(err);
//         statusCode = simplifiedError?.statusCode;
//         message = simplifiedError?.message;
//         errorSources = simplifiedError?.errorSources;
//     } else if (err instanceof ApiError) {
//         statusCode = err?.statusCode;
//         message = err.message;
//         errorSources = [
//             {
//                 path: "",
//                 message: err?.message,
//             },
//         ];
//     } else if (err && typeof err === "object" && "code" in err) {
//         const errorCode = (err as any).code;

//         if (errorCode === "P2002") {
//             const simplifiedError = handleDuplicateError(err);
//             statusCode = simplifiedError?.statusCode;
//             message = simplifiedError?.message;
//             errorSources = simplifiedError?.errorSources;
//         } else if (errorCode === "P2025" || errorCode === "P2003" || errorCode === "P2006") {
//             const simplifiedError = handleCastError(err);
//             statusCode = simplifiedError?.statusCode;
//             message = simplifiedError?.message;
//             errorSources = simplifiedError?.errorSources;
//         } else if (typeof errorCode === "string" && errorCode.startsWith("P")) {
//             const simplifiedError = handlePrismaError(err);
//             statusCode = simplifiedError?.statusCode;
//             message = simplifiedError?.message;
//             errorSources = simplifiedError?.errorSources;
//         } else if (errorCode === 11000 || errorCode === 11001) {
//             const simplifiedError = handleDuplicateError(err);
//             statusCode = simplifiedError?.statusCode;
//             message = simplifiedError?.message;
//             errorSources = simplifiedError?.errorSources;
//         }
//     } else if (err instanceof Error) {
//         message = err.message;
//         errorSources = [
//             {
//                 path: "",
//                 message: err?.message,
//             },
//         ];
//     }

//     res.status(statusCode).json({
//         success: false,
//         message,
//         errorSources,
//         err,
//         stack: config.node_env === "development" ? err?.stack : null,
//     });
// };

// export default globalErrorHandler;

import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import ApiError from "./ApiError";
import config from "../config/index";
import handleZodError from "./handleZodError";
import handlePrismaError from "./handlePrismaError";
import handleDuplicateError from "./handleDuplicateError";
import handleCastError from "./handleCastError";
import { TErrorSources } from "../interfaces/error";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next): void => {
    let statusCode = 500;
    let message = "Something went wrong!";
    let errorSources: TErrorSources = [
        {
            path: "",
            message: "Something went wrong",
        },
    ];

    if (err?.message?.includes("Invalid `prisma.") && err?.message?.includes("Expected")) {
        const simplifiedError = handlePrismaError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    } else if (err instanceof ZodError) {
        const simplifiedError = handleZodError(err);
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
    } else if (err && typeof err === "object" && "code" in err) {
        const errorCode = (err as any).code;

        if (errorCode === "P2002") {
            const simplifiedError = handleDuplicateError(err);
            statusCode = simplifiedError?.statusCode;
            message = simplifiedError?.message;
            errorSources = simplifiedError?.errorSources;
        } else if (errorCode === "P2025" || errorCode === "P2003" || errorCode === "P2006") {
            const simplifiedError = handleCastError(err);
            statusCode = simplifiedError?.statusCode;
            message = simplifiedError?.message;
            errorSources = simplifiedError?.errorSources;
        } else if (typeof errorCode === "string" && errorCode.startsWith("P")) {
            const simplifiedError = handlePrismaError(err);
            statusCode = simplifiedError?.statusCode;
            message = simplifiedError?.message;
            errorSources = simplifiedError?.errorSources;
        } else if (errorCode === 11000 || errorCode === 11001) {
            const simplifiedError = handleDuplicateError(err);
            statusCode = simplifiedError?.statusCode;
            message = simplifiedError?.message;
            errorSources = simplifiedError?.errorSources;
        }
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
