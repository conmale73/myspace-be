const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error";

    if (err instanceof ErrorResponse) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Log the original error to the console
    console.error(err);

    res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
