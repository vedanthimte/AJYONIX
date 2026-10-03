"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_js_1 = require("../config/jwt.js");
const response_js_1 = require("../utils/response.js");
const prisma_js_1 = require("../config/prisma.js");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, response_js_1.sendError)(res, 'Authentication required. No token provided.', 'UNAUTHORIZED', 401);
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_js_1.verifyToken)(token);
        // Optionally check if user still exists
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, name: true, department: true },
        });
        if (!user) {
            (0, response_js_1.sendError)(res, 'User no longer exists.', 'USER_NOT_FOUND', 401);
            return;
        }
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            department: user.department,
        };
        next();
    }
    catch (error) {
        (0, response_js_1.sendError)(res, 'Invalid or expired authentication token.', 'INVALID_TOKEN', 401);
    }
};
exports.authenticate = authenticate;
