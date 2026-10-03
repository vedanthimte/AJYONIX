import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Transactions & Summary
router.get('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), FinanceController.getOverview);
router.post('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), FinanceController.createTransaction);
router.put('/:id', authenticate, authorize(['ADMIN', 'ORGANIZER']), FinanceController.updateTransaction);
router.delete('/:id', authenticate, authorize(['ADMIN']), FinanceController.deleteTransaction);

// Invoices
router.get('/invoices/list', authenticate, authorize(['ADMIN', 'ORGANIZER']), FinanceController.getInvoices);
router.post('/invoices', authenticate, authorize(['ADMIN', 'ORGANIZER']), FinanceController.createInvoice);
router.get('/invoices/:id/pdf', authenticate, FinanceController.downloadInvoicePDF);

export default router;
