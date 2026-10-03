"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security & Headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Allows inline QR/PDF previews in development
}));
// CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive in local development
    },
    credentials: true,
}));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
        error: 'RATE_LIMIT_EXCEEDED',
    },
});
app.use('/api', limiter);
// Body Parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ONLINE',
        service: 'Ayojanix Event Management Server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// Mount API Routes
app.use('/api', index_js_1.default);
// Centralized Error Handling
app.use(errorHandler_js_1.errorHandler);
// Start Server
app.listen(PORT, () => {
    console.log(`
=====================================================
🚀 AYOJANIX REST API SERVER IS RUNNING
=====================================================
URL:         http://localhost:${PORT}
Health:      http://localhost:${PORT}/api/health
Database:    SQLite (via Prisma)
Environment: ${process.env.NODE_ENV || 'development'}
=====================================================
`);
});
exports.default = app;
