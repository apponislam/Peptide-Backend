const handleDuplicateError = (err) => {
    const errorSources = [];
    let statusCode = 409;
    let message = "Duplicate entry";
    if (err.code === "P2002") {
        const targetFields = err.meta?.target || ["field"];
        targetFields.forEach((field) => {
            errorSources.push({
                path: field,
                message: `${field} must be unique`,
            });
        });
        message = `${targetFields.join(", ")} must be unique`;
    }
    else if (err.message && err.message.includes("duplicate")) {
        const match = err.message.match(/"([^"]*)"/);
        const extractedMessage = match ? match[1] : "value";
        errorSources.push({
            path: extractedMessage,
            message: `${extractedMessage} already exists`,
        });
        message = `${extractedMessage} already exists`;
        statusCode = 409;
    }
    else {
        errorSources.push({
            path: "",
            message: "Duplicate entry found",
        });
    }
    return {
        statusCode,
        message,
        errorSources,
    };
};
export default handleDuplicateError;
//# sourceMappingURL=handleDuplicateError.js.map