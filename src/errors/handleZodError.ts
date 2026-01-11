import { TErrorSources, TGenericErrorResponse } from "../interfaces/error";
import { ZodError } from "zod";

const handleZodError = (err: ZodError): TGenericErrorResponse => {
    const errorSources: TErrorSources = err.issues.map((issue) => {
        const lastPath = issue.path[issue.path.length - 1];

        return {
            // Handles different types (string, number, symbol)
            path: typeof lastPath === "symbol" ? lastPath.toString() : String(lastPath),
            message: issue.message,
        };
    });

    return {
        statusCode: 400,
        // Uses actual error message from first issue
        message: err.issues[0]?.message || "Validation error",
        errorSources,
    };
};

export default handleZodError;
