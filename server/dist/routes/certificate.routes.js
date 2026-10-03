"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificate_controller_js_1 = require("../controllers/certificate.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const rbac_js_1 = require("../middleware/rbac.js");
const router = (0, express_1.Router)();
// Public verification endpoint
router.get('/verify/:id', certificate_controller_js_1.CertificateController.verify);
router.get('/:id/pdf', certificate_controller_js_1.CertificateController.downloadPDF);
// User and Admin/Organizer endpoints
router.get('/my', auth_js_1.authenticate, certificate_controller_js_1.CertificateController.getMyCertificates);
router.post('/', auth_js_1.authenticate, (0, rbac_js_1.authorize)(['ADMIN', 'ORGANIZER']), certificate_controller_js_1.CertificateController.generate);
exports.default = router;
