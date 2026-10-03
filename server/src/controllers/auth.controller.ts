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
}
