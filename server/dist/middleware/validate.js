"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const response_js_1 = require("../utils/response.js");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                (0, response_js_1.sendError)(res, `Validation error: ${errorMessages}`, 'VALIDATION_ERROR', 400);
                return;
            }
            (0, response_js_1.sendError)(res, 'Invalid request input.', 'BAD_REQUEST', 400);
        }
    };
};
exports.validate = validate;
