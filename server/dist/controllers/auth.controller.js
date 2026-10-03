"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = require("../config/prisma.js");
const jwt_js_1 = require("../config/jwt.js");
const response_js_1 = require("../utils/response.js");
const client_1 = require("@prisma/client");
class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, role, phone, department } = req.body;
            if (!name || !email || !password) {
                (0, response_js_1.sendError)(res, 'Name, email, and password are required fields.', 'VALIDATION_ERROR', 400);
                return;
            }
            const existingUser = await prisma_js_1.prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (existingUser) {
                (0, response_js_1.sendError)(res, 'An account with this email address already exists.', 'EMAIL_EXISTS', 409);
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Validate role or default to PARTICIPANT
            const userRole = Object.values(client_1.Role).includes(role) ? role : client_1.Role.PARTICIPANT;
            const newUser = await prisma_js_1.prisma.user.create({
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
            if (userRole === client_1.Role.VOLUNTEER) {
                await prisma_js_1.prisma.volunteer.create({
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
            await prisma_js_1.prisma.notification.create({
                data: {
                    userId: newUser.id,
                    title: 'Welcome to Ayojanix!',
                    message: `Your account has been created successfully with the ${userRole} role.`,
                    type: 'WELCOME',
                },
            });
            const token = (0, jwt_js_1.signToken)({
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name,
            });
            (0, response_js_1.sendSuccess)(res, {
                token,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    phone: newUser.phone,
                    department: newUser.department,
                },
            }, 'Registration successful', 201);
        }
        catch (error) {
            console.error('Registration error:', error);
            (0, response_js_1.sendError)(res, 'Registration failed due to a server error.', 'REGISTRATION_ERROR', 500);
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                (0, response_js_1.sendError)(res, 'Email and password are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const user = await prisma_js_1.prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user) {
                (0, response_js_1.sendError)(res, 'Invalid email or password credentials.', 'INVALID_CREDENTIALS', 401);
                return;
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                (0, response_js_1.sendError)(res, 'Invalid email or password credentials.', 'INVALID_CREDENTIALS', 401);
                return;
            }
            const token = (0, jwt_js_1.signToken)({
                userId: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
            });
            (0, response_js_1.sendSuccess)(res, {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    department: user.department,
                },
            }, 'Login successful');
        }
        catch (error) {
            console.error('Login error:', error);
            (0, response_js_1.sendError)(res, 'Login failed due to a server error.', 'LOGIN_ERROR', 500);
        }
    }
    static async me(req, res) {
        try {
            if (!req.user) {
                (0, response_js_1.sendError)(res, 'Unauthorized', 'UNAUTHORIZED', 401);
                return;
            }
            const user = await prisma_js_1.prisma.user.findUnique({
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
                (0, response_js_1.sendError)(res, 'User not found.', 'NOT_FOUND', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, user);
        }
        catch (error) {
            console.error('Me endpoint error:', error);
            (0, response_js_1.sendError)(res, 'Failed to retrieve profile.', 'INTERNAL_ERROR', 500);
        }
    }
}
exports.AuthController = AuthController;
