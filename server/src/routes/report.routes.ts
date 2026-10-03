import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/summary', authenticate, authorize(['ADMIN', 'ORGANIZER']), ReportController.getSummaryReport);
router.get('/event/:id', authenticate, authorize(['ADMIN', 'ORGANIZER']), ReportController.getEventReport);
router.get('/download/:id', authenticate, authorize(['ADMIN', 'ORGANIZER']), ReportController.downloadPDF);

export default router;
