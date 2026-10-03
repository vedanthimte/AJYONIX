import { Router } from 'express';
import { RegistrationController } from '../controllers/registration.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/my', authenticate, RegistrationController.getMyRegistrations);
router.get('/:id', authenticate, RegistrationController.getById);
router.post('/event/:id', authenticate, RegistrationController.register);
router.get('/event/:id', authenticate, authorize(['ADMIN', 'ORGANIZER', 'VOLUNTEER']), RegistrationController.getEventRegistrations);

export default router;
