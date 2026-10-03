import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/', EventController.getAll);
router.get('/:id', EventController.getById);
router.post('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), EventController.create);
router.put('/:id', authenticate, authorize(['ADMIN', 'ORGANIZER']), EventController.update);
router.delete('/:id', authenticate, authorize(['ADMIN', 'ORGANIZER']), EventController.delete);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'ORGANIZER']), EventController.updateStatus);

export default router;
