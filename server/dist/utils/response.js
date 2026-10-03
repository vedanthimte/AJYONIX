"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, errorCode = 'INTERNAL_ERROR', statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: errorCode,
    });
};
exports.sendError = sendError;
