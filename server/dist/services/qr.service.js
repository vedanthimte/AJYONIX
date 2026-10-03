"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
class QRService {
    /**
     * Generates a base64 DataURL representing the QR code
     */
    static async generateDataURL(data) {
        try {
            return await qrcode_1.default.toDataURL(data, {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: 320,
                color: {
                    dark: '#1e1b4b',
                    light: '#ffffff',
                },
            });
        }
        catch (error) {
            console.error('Failed to generate QR data URL:', error);
            throw new Error('QR Code generation failed');
        }
    }
    /**
     * Generates formatted registration ID e.g. AYX-2026-00124
     */
    static generateRegistrationCode(year = new Date().getFullYear()) {
        const randomSuffix = Math.floor(10000 + Math.random() * 90000); // 5 digit unique
        return `AYX-${year}-${randomSuffix}`;
    }
    /**
     * Generates formatted certificate ID e.g. CERT-AYX-2026-90124
     */
    static generateCertificateCode(year = new Date().getFullYear()) {
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        return `CERT-AYX-${year}-${randomSuffix}`;
    }
    /**
     * Generates formatted invoice ID e.g. INV-AYX-2026-00124
     */
    static generateInvoiceNumber(year = new Date().getFullYear()) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        return `INV-AYX-${year}-${randomSuffix}`;
    }
}
exports.QRService = QRService;
