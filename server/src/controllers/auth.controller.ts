import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { signToken } from '../config/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Role } from '@prisma/client';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, phone, department } = req.body;

      if (!name || !email || !password) {
        sendError(res, 'Name, email, and password are required fields.', 'VALIDATION_ERROR', 400);
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        sendError(res, 'An account with this email address already exists.', 'EMAIL_EXISTS', 409);
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Validate role or default to PARTICIPANT
      const userRole = Object.values(Role).includes(role) ? role : Role.PARTICIPANT;

      const newUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: userRole,
          phone: phone || null,
          department: department || null,
        },
      });

      // If user registered as volunteer, create volunteer record
      if (userRole === Role.VOLUNTEER) {
        await prisma.volunteer.create({
          data: {
            userId: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone || '',
            skills: 'General Event Support',
            department: newUser.department || 'General',
          },
        });
      }

      // Welcome Notification
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          title: 'Welcome to Ayojanix!',
          message: `Your account has been created successfully with the ${userRole} role.`,
          type: 'WELCOME',
        },
      });

      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      });

      sendSuccess(
        res,
        {
          token,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            department: newUser.department,
          },
        },
        'Registration successful',
        201
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      sendError(res, 'Registration failed due to a server error.', 'REGISTRATION_ERROR', 500);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        sendError(res, 'Email and password are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        sendError(res, 'Invalid email or password credentials.', 'INVALID_CREDENTIALS', 401);
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        sendError(res, 'Invalid email or password credentials.', 'INVALID_CREDENTIALS', 401);
        return;
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      sendSuccess(
        res,
        {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            department: user.department,
          },
        },
        'Login successful'
      );
    } catch (error: any) {
      console.error('Login error:', error);
      sendError(res, 'Login failed due to a server error.', 'LOGIN_ERROR', 500);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          department: true,
          createdAt: true,
          notifications: {
            where: { read: false },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        sendError(res, 'User not found.', 'NOT_FOUND', 404);
        return;
      }

      sendSuccess(res, user);
    } catch (error: any) {
      console.error('Me endpoint error:', error);
      sendError(res, 'Failed to retrieve profile.', 'INTERNAL_ERROR', 500);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
        return;
      }

      const { name, phone, department, avatar } = req.body;
      const userId = req.user.userId;

      if (name !== undefined && !name.trim()) {
        sendError(res, 'Name cannot be empty', 'VALIDATION_ERROR', 400);
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name: name.trim() }),
          ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
          ...(department !== undefined && { department: department ? department.trim() : null }),
          ...(avatar !== undefined && { avatar: avatar ? avatar.trim() : null }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          department: true,
          avatar: true,
          createdAt: true,
        },
      });

      // Synchronize with Volunteer profile if exists
      if (req.user.role === 'VOLUNTEER') {
        await prisma.volunteer.updateMany({
          where: { userId },
          data: {
            name: updatedUser.name,
            phone: updatedUser.phone || '',
            department: updatedUser.department || 'General',
          },
        });
      }

      sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      sendError(res, 'Failed to update profile.', 'UPDATE_PROFILE_ERROR', 500);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        sendError(res, 'Both current and new password are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      if (newPassword.length < 6) {
        sendError(res, 'New password must be at least 6 characters long.', 'VALIDATION_ERROR', 400);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        sendError(res, 'User record not found.', 'NOT_FOUND', 404);
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        sendError(res, 'Current password does not match.', 'INVALID_CREDENTIALS', 400);
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
      });

      // Notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Security Alert: Password Changed',
          message: 'Your account password was successfully updated.',
          type: 'SECURITY',
        },
      });

      sendSuccess(res, null, 'Password changed successfully!');
    } catch (error: any) {
      console.error('Change password error:', error);
      sendError(res, 'Failed to change password.', 'CHANGE_PASSWORD_ERROR', 500);
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        sendError(res, 'Email address is required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        sendError(res, 'No registered account found with that email address.', 'NOT_FOUND', 404);
        return;
      }

      // Generate 6-digit verification code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Log notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Password Reset Verification Code',
          message: `Your Ayojanix security reset code is: ${resetCode}. It is valid for single use.`,
          type: 'SECURITY',
        },
      });

      sendSuccess(
        res,
        {
          email: user.email,
          resetCode,
          message: 'A verification code has been generated. Use this code to reset your password.',
        },
        'Reset code generated successfully'
      );
    } catch (error: any) {
      console.error('Forgot password error:', error);
      sendError(res, 'Failed to process forgot password request.', 'FORGOT_PASSWORD_ERROR', 500);
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, resetCode, newPassword } = req.body;

      if (!email || !newPassword) {
        sendError(res, 'Email and new password are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      if (newPassword.length < 6) {
        sendError(res, 'Password must be at least 6 characters long.', 'VALIDATION_ERROR', 400);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        sendError(res, 'User record not found.', 'NOT_FOUND', 404);
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Password Reset Completed',
          message: 'Your account password has been reset successfully. You can now login with your new credentials.',
          type: 'SECURITY',
        },
      });

      sendSuccess(res, null, 'Password has been reset successfully. Please log in with your new credentials.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      sendError(res, 'Failed to reset password.', 'RESET_PASSWORD_ERROR', 500);
    }
  }
}
