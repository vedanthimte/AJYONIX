import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/', VendorController.getAll);
router.post('/', authenticate, authorize(['ADMIN', 'ORGANIZER']), VendorController.create);
router.put('/:id', authenticate, authorize(['ADMIN', 'ORGANIZER']), VendorController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), VendorController.delete);

export default router;
