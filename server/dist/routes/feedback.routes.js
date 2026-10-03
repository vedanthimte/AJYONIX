"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedback_controller_js_1 = require("../controllers/feedback.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/event/:id', auth_js_1.authenticate, feedback_controller_js_1.FeedbackController.submit);
router.get('/event/:id', auth_js_1.authenticate, feedback_controller_js_1.FeedbackController.getEventFeedback);
exports.default = router;
