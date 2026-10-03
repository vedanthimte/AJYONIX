import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Public verification endpoint
router.get('/verify/:id', CertificateController.verify);
router.get('/:id/pdf', CertificateController.downloadPDF);

// User and Admin/Organizer endpoints
router.get('/my', authenticate, CertificateController.getMyCertificates);
router.post('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), CertificateController.generate);

export default router;
