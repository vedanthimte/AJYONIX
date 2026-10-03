import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { QRService } from '../services/qr.service.js';
import { PDFService } from '../services/pdf.service.js';
import { TransactionType } from '@prisma/client';

export class FinanceController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.query;

      const where: any = {};
      if (eventId) {
        where.eventId = String(eventId);
      }

      const transactions = await prisma.financeTransaction.findMany({
        where,
        include: {
          event: { select: { id: true, name: true } },
          vendor: { select: { id: true, name: true, category: true } },
        },
        orderBy: { date: 'desc' },
      });

      const totalIncome = transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      const netBalance = totalIncome - totalExpense;

      // Group by category for charts
      const categoryMap: Record<string, { income: number; expense: number }> = {};
      transactions.forEach((t) => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = { income: 0, expense: 0 };
        }
        if (t.type === TransactionType.INCOME) {
          categoryMap[t.category].income += t.amount;
        } else {
          categoryMap[t.category].expense += t.amount;
        }
      });

      const categoryBreakdown = Object.entries(categoryMap).map(([category, amounts]) => ({
        category,
        income: amounts.income,
        expense: amounts.expense,
        net: amounts.income - amounts.expense,
      }));

      sendSuccess(res, {
        summary: {
          totalIncome,
          totalExpense,
          netBalance,
          transactionCount: transactions.length,
        },
        categoryBreakdown,
        transactions,
      });
    } catch (error: any) {
      console.error('Finance overview error:', error);
      sendError(res, 'Failed to fetch finance records.', 'FINANCE_FETCH_ERROR', 500);
    }
  }

  static async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, description, category, amount, type, vendorId, date } = req.body;

      if (!description || !category || amount === undefined || !type) {
        sendError(res, 'Description, category, amount, and type are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const transaction = await prisma.financeTransaction.create({
        data: {
          eventId: eventId || null,
          description,
          category,
          amount: Number(amount),
          type: type as TransactionType,
          vendorId: vendorId || null,
          date: date ? new Date(date) : new Date(),
          status: 'COMPLETED',
        },
        include: {
          event: true,
          vendor: true,
        },
      });

      sendSuccess(res, transaction, 'Transaction recorded successfully', 201);
    } catch (error: any) {
      console.error('Create transaction error:', error);
      sendError(res, 'Failed to record transaction.', 'TRANSACTION_CREATE_ERROR', 500);
    }
  }

  static async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (data.amount !== undefined) data.amount = Number(data.amount);
      if (data.date) data.date = new Date(data.date);

      const updated = await prisma.financeTransaction.update({
        where: { id },
        data,
      });

      sendSuccess(res, updated, 'Transaction updated');
    } catch (error: any) {
      console.error('Update transaction error:', error);
      sendError(res, 'Failed to update transaction.', 'TRANSACTION_UPDATE_ERROR', 500);
    }
  }

  static async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.financeTransaction.delete({
        where: { id },
      });

      sendSuccess(res, null, 'Transaction deleted');
    } catch (error: any) {
      console.error('Delete transaction error:', error);
      sendError(res, 'Failed to delete transaction.', 'TRANSACTION_DELETE_ERROR', 500);
    }
  }

  // Invoices
  static async getInvoices(req: Request, res: Response): Promise<void> {
    try {
      const invoices = await prisma.invoice.findMany({
        include: {
          event: { select: { id: true, name: true } },
          vendor: { select: { id: true, name: true, category: true } },
        },
        orderBy: { date: 'desc' },
      });
      sendSuccess(res, invoices);
    } catch (error: any) {
      console.error('Get invoices error:', error);
      sendError(res, 'Failed to fetch invoices.', 'INVOICE_FETCH_ERROR', 500);
    }
  }

  static async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, vendorId, recipientName, recipientEmail, description, amount, paymentStatus } = req.body;

      if (!recipientName || !recipientEmail || !description || amount === undefined) {
        sendError(res, 'Recipient name, email, description, and amount are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const invoiceNumber = QRService.generateInvoiceNumber();

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          eventId: eventId || null,
          vendorId: vendorId || null,
          recipientName,
          recipientEmail,
          description,
          amount: Number(amount),
          paymentStatus: paymentStatus || 'PAID',
        },
        include: {
          event: true,
          vendor: true,
        },
      });

      sendSuccess(res, invoice, 'Invoice generated successfully', 201);
    } catch (error: any) {
      console.error('Create invoice error:', error);
      sendError(res, 'Failed to generate invoice.', 'INVOICE_CREATE_ERROR', 500);
    }
  }

  static async downloadInvoicePDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invoice = await prisma.invoice.findFirst({
        where: {
          OR: [{ id }, { invoiceNumber: id }],
        },
        include: {
          event: true,
          vendor: true,
        },
      });

      if (!invoice) {
        sendError(res, 'Invoice not found.', 'NOT_FOUND', 404);
        return;
      }

      await PDFService.streamInvoicePDF(res, invoice);
    } catch (error: any) {
      console.error('Invoice PDF error:', error);
      sendError(res, 'Failed to generate invoice PDF.', 'PDF_ERROR', 500);
    }
  }
}
