import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/change-password', authenticate, AuthController.changePassword);
router.post('/change-password', authenticate, AuthController.changePassword);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;
