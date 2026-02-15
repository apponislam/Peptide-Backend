"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleZodError = (err) => {
    const errorSources = err.issues.map((issue) => {
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
exports.default = handleZodError;
//# sourceMappingURL=handleZodError.js.map