// import { TErrorSources, TGenericErrorResponse } from "../interfaces/error";
// // import { Prisma } from "../../generated/prisma/client";
// const handlePrismaError = (err: any): TGenericErrorResponse => {
//     const errorSources: TErrorSources = [];
//     let statusCode = 400;
//     let message = "Database error";
//     switch (err.code) {
//         case "P2025":
//             statusCode = 404;
//             message = "Record not found";
//             const cause = (err.meta?.cause as string) || "The requested record was not found";
//             errorSources.push({
//                 path: "",
//                 message: cause,
//             });
//             break;
//         case "P2003":
//             statusCode = 400;
//             message = "Foreign key constraint failed";
//             const fieldName = (err.meta?.field_name as string) || "field";
//             errorSources.push({
//                 path: fieldName,
//                 message: `Invalid ${fieldName} reference`,
//             });
//             break;
//         case "P2002":
//             statusCode = 409;
//             message = "Duplicate entry";
//             const target = (err.meta?.target as string[]) || ["field"];
//             errorSources.push({
//                 path: target.join(", "),
//                 message: `${target.join(", ")} must be unique`,
//             });
//             break;
//         default:
//             errorSources.push({
//                 path: "",
//                 message: err.message,
//             });
//     }
//     return {
//         statusCode,
//         message,
//         errorSources,
//     };
// };
// export default handlePrismaError;
import { Prisma } from "../generated/prisma/client";
const handlePrismaError = (err) => {
    const errorSources = [];
    let statusCode = 400;
    let message = "Database error";
    // Handle PrismaClientValidationError (validation errors)
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Validation error";
        const errorMessage = err.message;
        if (errorMessage.includes("Expected UserTier")) {
            message = "Invalid tier value";
            errorSources.push({
                path: "tier", // Always provide string
                message: "Tier must be one of: Member, VIP, Founder",
            });
        }
        else if (errorMessage.includes("Invalid value for argument")) {
            // Extract field name and expected type - FIXED REGEX
            const fieldMatch = errorMessage.match(/argument `([^`]+)`/);
            const expectedMatch = errorMessage.match(/Expected (\w+)/);
            // FIX: Always provide a string, never undefined
            const field = fieldMatch && fieldMatch[1] ? fieldMatch[1] : "field";
            const expected = expectedMatch && expectedMatch[1] ? expectedMatch[1] : "valid value";
            errorSources.push({
                path: field, // This is now guaranteed to be a string
                message: `Invalid ${field}. Expected: ${expected}`,
            });
            message = `Invalid ${field} value`;
        }
        else {
            // Generic validation error - provide default path
            errorSources.push({
                path: "data", // Don't use empty string, use "data"
                message: "Invalid data provided",
            });
        }
        return {
            statusCode,
            message,
            errorSources,
        };
    }
    // Handle PrismaClientKnownRequestError (with error codes)
    // Check if err.code exists first
    if (err.code && typeof err.code === "string") {
        switch (err.code) {
            case "P2025":
                statusCode = 404;
                message = "Record not found";
                const cause = err.meta?.cause || "The requested record was not found";
                errorSources.push({
                    path: "id", // Always provide string
                    message: cause,
                });
                break;
            case "P2003":
                statusCode = 400;
                message = "Foreign key constraint failed";
                const fieldName = err.meta?.field_name || "field";
                errorSources.push({
                    path: fieldName, // Always provide string
                    message: `Invalid ${fieldName} reference`,
                });
                break;
            case "P2002":
                statusCode = 409;
                message = "Duplicate entry";
                const target = err.meta?.target || ["field"];
                // Ensure we have a valid path (not empty string)
                const targetPath = target.length > 0 ? target.join(", ") : "data";
                errorSources.push({
                    path: targetPath, // Always provide string
                    message: `${targetPath} must be unique`,
                });
                break;
            default:
                errorSources.push({
                    path: "database", // Always provide string, not empty
                    message: err.message || "Database operation failed",
                });
        }
    }
    else {
        // If no error code, still provide valid path
        errorSources.push({
            path: "database", // Always provide string
            message: err.message || "Database operation failed",
        });
    }
    return {
        statusCode,
        message,
        errorSources,
    };
};
export default handlePrismaError;
//# sourceMappingURL=handlePrismaError.js.map