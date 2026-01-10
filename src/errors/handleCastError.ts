import { TErrorSources, TGenericErrorResponse } from "@/interfaces/error";
import { PrismaClient } from "../../../generated/prisma/client";

const handleCastError = (err: PrismaClient.PrismaClientKnownRequestError): TGenericErrorResponse => {
    const errorSources: TErrorSources = [];
    let statusCode = 400;
    let message = "Invalid data";

    switch (err.code) {
        // Record not found (similar to Mongoose CastError for invalid IDs)
        case "P2025":
            statusCode = 404;
            message = "Record not found";

            // Extract field name from meta if available
            const field = (err.meta?.modelName as string) || "record";
            const cause = (err.meta?.cause as string) || "The requested record was not found";

            errorSources.push({
                path: "",
                message: cause,
            });
            break;

        // Invalid ID format (when UUID or ID format is wrong)
        case "P2003":
            statusCode = 400;
            message = "Invalid reference";

            const fieldName = (err.meta?.field_name as string) || "field";
            errorSources.push({
                path: fieldName,
                message: `Invalid reference for ${fieldName}`,
            });
            break;

        // Type mismatch or invalid data format
        case "P2006":
            statusCode = 400;
            message = "Invalid value provided";

            const valueError = err.message.includes("value") ? err.message.split(":").pop()?.trim() || "Invalid value" : "Invalid data format";

            errorSources.push({
                path: "",
                message: valueError,
            });
            break;

        default:
            errorSources.push({
                path: "",
                message: err.message,
            });
    }

    return {
        statusCode,
        message,
        errorSources,
    };
};

export default handleCastError;
