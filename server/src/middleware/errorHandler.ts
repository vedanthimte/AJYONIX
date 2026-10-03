import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('API Error Exception:', err.message || err);

  const statusCode = err.statusCode || (err.name === 'UnauthorizedError' ? 401 : 500);
  const message = err.message || 'An unexpected internal server error occurred.';
  const errorCode = err.code || err.errorCode || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
  });
};
