import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcement.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/', AnnouncementController.getAll);
router.post('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), AnnouncementController.create);

export default router;
