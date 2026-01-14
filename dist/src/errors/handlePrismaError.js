// import { Prisma } from "../../generated/prisma/client";
const handlePrismaError = (err) => {
    const errorSources = [];
    let statusCode = 400;
    let message = "Database error";
    switch (err.code) {
        case "P2025":
            statusCode = 404;
            message = "Record not found";
            const cause = err.meta?.cause || "The requested record was not found";
            errorSources.push({
                path: "",
                message: cause,
            });
            break;
        case "P2003":
            statusCode = 400;
            message = "Foreign key constraint failed";
            const fieldName = err.meta?.field_name || "field";
            errorSources.push({
                path: fieldName,
                message: `Invalid ${fieldName} reference`,
            });
            break;
        case "P2002":
            statusCode = 409;
            message = "Duplicate entry";
            const target = err.meta?.target || ["field"];
            errorSources.push({
                path: target.join(", "),
                message: `${target.join(", ")} must be unique`,
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
export default handlePrismaError;
//# sourceMappingURL=handlePrismaError.js.map