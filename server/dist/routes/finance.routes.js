"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const finance_controller_js_1 = require("../controllers/finance.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const rbac_js_1 = require("../middleware/rbac.js");
const router = (0, express_1.Router)();
// Transactions & Summary
router.get('/', auth_js_1.authenticate, (0, rbac_js_1.authorize)(['ADMIN', 'ORGANIZER']), finance_controller_js_1.FinanceController.getOverview);
router.post('/', auth_js_1.authenticate, (0, rbac_js_1.authorize)(['ADMIN', 'ORGANIZER']), finance_controller_js_1.FinanceController.createTransaction);
router.put('/:id', auth_js_1.authenticate, (0, rbac_js_1.authorize)(['ADMIN', 'ORGANIZER']), finance_controller_js_1.FinanceController.updateTransaction);
router.delete('/:id', auth_js_1.authenticate, (0, rbac_js_1.authorize)(['ADMIN']), finance_controller_js_1.FinanceController.deleteTransaction);
// Invoices
router.get('/invoices/list', auth_js_1.authenticate, (0, rbac_js_1.authorize)(['ADMIN', 'ORGANIZER']), finance_controller_js_1.FinanceController.getInvoices);
router.post('/invoices', auth_js_1.authenticate, (0, rbac_js_1.authorize)(['ADMIN', 'ORGANIZER']), finance_controller_js_1.FinanceController.createInvoice);
router.get('/invoices/:id/pdf', auth_js_1.authenticate, finance_controller_js_1.FinanceController.downloadInvoicePDF);
exports.default = router;
