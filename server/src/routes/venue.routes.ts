import { Router } from 'express';
import { VenueController } from '../controllers/venue.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/', VenueController.getAll);
router.post('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), VenueController.create);
router.put('/:id', authenticate, authorize(['ADMIN', 'ORGANIZER']), VenueController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), VenueController.delete);

export default router;
