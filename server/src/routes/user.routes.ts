import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), UserController.getAll);
router.patch('/:id/role', authenticate, authorize(['ADMIN']), UserController.updateRole);

export default router;
