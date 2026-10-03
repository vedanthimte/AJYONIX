import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.post('/check-in', authenticate, authorize(['ADMIN', 'ORGANIZER', 'VOLUNTEER']), AttendanceController.checkIn);
router.post('/check-out', authenticate, authorize(['ADMIN', 'ORGANIZER', 'VOLUNTEER']), AttendanceController.checkOut);
router.get('/event/:id', authenticate, authorize(['ADMIN', 'ORGANIZER', 'VOLUNTEER']), AttendanceController.getEventAttendance);

export default router;
