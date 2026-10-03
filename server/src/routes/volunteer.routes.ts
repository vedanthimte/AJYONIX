import { Router } from 'express';
import { VolunteerController } from '../controllers/volunteer.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), VolunteerController.getAll);
router.post('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), VolunteerController.create);
router.post('/assign', authenticate, authorize(['ADMIN', 'ORGANIZER']), VolunteerController.assignDuty);
router.get('/my-duties', authenticate, VolunteerController.getMyDuties);
router.delete('/assign/:id', authenticate, authorize(['ADMIN', 'ORGANIZER']), VolunteerController.deleteAssignment);

export default router;
