import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import registrationRoutes from './registration.routes.js';
import attendanceRoutes from './attendance.routes.js';
import venueRoutes from './venue.routes.js';
import vendorRoutes from './vendor.routes.js';
import volunteerRoutes from './volunteer.routes.js';
import financeRoutes from './finance.routes.js';
import feedbackRoutes from './feedback.routes.js';
import announcementRoutes from './announcement.routes.js';
import certificateRoutes from './certificate.routes.js';
import aiRoutes from './ai.routes.js';
import reportRoutes from './report.routes.js';
import notificationRoutes from './notification.routes.js';
import userRoutes from './user.routes.js';

import { RegistrationController } from '../controllers/registration.controller.js';
import { AttendanceController } from '../controllers/attendance.controller.js';
import { FeedbackController } from '../controllers/feedback.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/registrations', registrationRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/venues', venueRoutes);
apiRouter.use('/vendors', vendorRoutes);
apiRouter.use('/volunteers', volunteerRoutes);
apiRouter.use('/finance', financeRoutes);
apiRouter.use('/feedback', feedbackRoutes);
apiRouter.use('/announcements', announcementRoutes);
apiRouter.use('/certificates', certificateRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/users', userRoutes);

// Direct endpoint aliases specified in prompt Section 32
apiRouter.post('/events/:id/register', authenticate, RegistrationController.register);
apiRouter.get('/events/:id/registrations', authenticate, authorize(['ADMIN', 'ORGANIZER', 'VOLUNTEER']), RegistrationController.getEventRegistrations);
apiRouter.get('/events/:id/attendance', authenticate, authorize(['ADMIN', 'ORGANIZER', 'VOLUNTEER']), AttendanceController.getEventAttendance);
apiRouter.post('/events/:id/feedback', authenticate, FeedbackController.submit);
apiRouter.get('/events/:id/feedback', authenticate, FeedbackController.getEventFeedback);

export default apiRouter;
