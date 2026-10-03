"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const response_js_1 = require("../utils/response.js");
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_js_1.sendError)(res, 'Authentication required before authorization.', 'UNAUTHORIZED', 401);
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, response_js_1.sendError)(res, `Access denied. Role '${req.user.role}' is not authorized to access this resource.`, 'FORBIDDEN', 403);
            return;
        }
        next();
    };
};
exports.authorize = authorize;
