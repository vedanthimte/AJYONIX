import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { sendError } from '../utils/response.js';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required before authorization.', 'UNAUTHORIZED', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        'FORBIDDEN',
        403
      );
      return;
    }

    next();
  };
};
