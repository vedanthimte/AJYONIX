import QRCode from 'qrcode';

export class QRService {
  /**
   * Generates a base64 DataURL representing the QR code
   */
  static async generateDataURL(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      });
    } catch (error) {
      console.error('Failed to generate QR data URL:', error);
      throw new Error('QR Code generation failed');
    }
  }

  /**
   * Generates formatted registration ID e.g. AYX-2026-00124
   */
  static generateRegistrationCode(year: number = new Date().getFullYear()): string {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000); // 5 digit unique
    return `AYX-${year}-${randomSuffix}`;
  }

  /**
   * Generates formatted certificate ID e.g. CERT-AYX-2026-90124
   */
  static generateCertificateCode(year: number = new Date().getFullYear()): string {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `CERT-AYX-${year}-${randomSuffix}`;
  }

  /**
   * Generates formatted invoice ID e.g. INV-AYX-2026-00124
   */
  static generateInvoiceNumber(year: number = new Date().getFullYear()): string {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `INV-AYX-${year}-${randomSuffix}`;
  }
}
