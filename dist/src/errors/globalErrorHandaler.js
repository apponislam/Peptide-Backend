"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const ApiError_1 = __importDefault(require("./ApiError"));
const index_1 = __importDefault(require("../config/index"));
const handleZodError_1 = __importDefault(require("./handleZodError"));
const handlePrismaError_1 = __importDefault(require("./handlePrismaError"));
const handleDuplicateError_1 = __importDefault(require("./handleDuplicateError"));
const handleCastError_1 = __importDefault(require("./handleCastError"));
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong!";
    let errorSources = [
        {
            path: "",
            message: "Something went wrong",
        },
    ];
    if (err?.message?.includes("Invalid `prisma.") && err?.message?.includes("Expected")) {
        const simplifiedError = (0, handlePrismaError_1.default)(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    }
    else if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    }
    else if (err instanceof ApiError_1.default) {
        statusCode = err?.statusCode;
        message = err.message;
        errorSources = [
            {
                path: "",
                message: err?.message,
            },
        ];
    }
    else if (err && typeof err === "object" && "code" in err) {
        const errorCode = err.code;
        if (errorCode === "P2002") {
            const simplifiedError = (0, handleDuplicateError_1.default)(err);
            statusCode = simplifiedError?.statusCode;
            message = simplifiedError?.message;
            errorSources = simplifiedError?.errorSources;
        }
        else if (errorCode === "P2025" || errorCode === "P2003" || errorCode === "P2006") {
            const simplifiedError = (0, handleCastError_1.default)(err);
            statusCode = simplifiedError?.statusCode;
            message = simplifiedError?.message;
            errorSources = simplifiedError?.errorSources;
        }
        else if (typeof errorCode === "string" && errorCode.startsWith("P")) {
            const simplifiedError = (0, handlePrismaError_1.default)(err);
            statusCode = simplifiedError?.statusCode;
            message = simplifiedError?.message;
            errorSources = simplifiedError?.errorSources;
        }
        else if (errorCode === 11000 || errorCode === 11001) {
            const simplifiedError = (0, handleDuplicateError_1.default)(err);
            statusCode = simplifiedError?.statusCode;
            message = simplifiedError?.message;
            errorSources = simplifiedError?.errorSources;
        }
    }
    else if (err instanceof Error) {
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
        stack: index_1.default.node_env === "development" ? err?.stack : null,
    });
};
exports.default = globalErrorHandler;
//# sourceMappingURL=globalErrorHandaler.js.map