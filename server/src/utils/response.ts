import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  errorCode = 'INTERNAL_ERROR',
  statusCode = 500
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
  });
};
