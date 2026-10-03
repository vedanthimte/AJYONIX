"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const qr_service_js_1 = require("../services/qr.service.js");
const pdf_service_js_1 = require("../services/pdf.service.js");
const client_1 = require("@prisma/client");
class FinanceController {
    static async getOverview(req, res) {
        try {
            const { eventId } = req.query;
            const where = {};
            if (eventId) {
                where.eventId = String(eventId);
            }
            const transactions = await prisma_js_1.prisma.financeTransaction.findMany({
                where,
                include: {
                    event: { select: { id: true, name: true } },
                    vendor: { select: { id: true, name: true, category: true } },
                },
                orderBy: { date: 'desc' },
            });
            const totalIncome = transactions
                .filter((t) => t.type === client_1.TransactionType.INCOME)
                .reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = transactions
                .filter((t) => t.type === client_1.TransactionType.EXPENSE)
                .reduce((sum, t) => sum + t.amount, 0);
            const netBalance = totalIncome - totalExpense;
            // Group by category for charts
            const categoryMap = {};
            transactions.forEach((t) => {
                if (!categoryMap[t.category]) {
                    categoryMap[t.category] = { income: 0, expense: 0 };
                }
                if (t.type === client_1.TransactionType.INCOME) {
                    categoryMap[t.category].income += t.amount;
                }
                else {
                    categoryMap[t.category].expense += t.amount;
                }
            });
            const categoryBreakdown = Object.entries(categoryMap).map(([category, amounts]) => ({
                category,
                income: amounts.income,
                expense: amounts.expense,
                net: amounts.income - amounts.expense,
            }));
            (0, response_js_1.sendSuccess)(res, {
                summary: {
                    totalIncome,
                    totalExpense,
                    netBalance,
                    transactionCount: transactions.length,
                },
                categoryBreakdown,
                transactions,
            });
        }
        catch (error) {
            console.error('Finance overview error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch finance records.', 'FINANCE_FETCH_ERROR', 500);
        }
    }
    static async createTransaction(req, res) {
        try {
            const { eventId, description, category, amount, type, vendorId, date } = req.body;
            if (!description || !category || amount === undefined || !type) {
                (0, response_js_1.sendError)(res, 'Description, category, amount, and type are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const transaction = await prisma_js_1.prisma.financeTransaction.create({
                data: {
                    eventId: eventId || null,
                    description,
                    category,
                    amount: Number(amount),
                    type: type,
                    vendorId: vendorId || null,
                    date: date ? new Date(date) : new Date(),
                    status: 'COMPLETED',
                },
                include: {
                    event: true,
                    vendor: true,
                },
            });
            (0, response_js_1.sendSuccess)(res, transaction, 'Transaction recorded successfully', 201);
        }
        catch (error) {
            console.error('Create transaction error:', error);
            (0, response_js_1.sendError)(res, 'Failed to record transaction.', 'TRANSACTION_CREATE_ERROR', 500);
        }
    }
    static async updateTransaction(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            if (data.amount !== undefined)
                data.amount = Number(data.amount);
            if (data.date)
                data.date = new Date(data.date);
            const updated = await prisma_js_1.prisma.financeTransaction.update({
                where: { id },
                data,
            });
            (0, response_js_1.sendSuccess)(res, updated, 'Transaction updated');
        }
        catch (error) {
            console.error('Update transaction error:', error);
            (0, response_js_1.sendError)(res, 'Failed to update transaction.', 'TRANSACTION_UPDATE_ERROR', 500);
        }
    }
    static async deleteTransaction(req, res) {
        try {
            const { id } = req.params;
            await prisma_js_1.prisma.financeTransaction.delete({
                where: { id },
            });
            (0, response_js_1.sendSuccess)(res, null, 'Transaction deleted');
        }
        catch (error) {
            console.error('Delete transaction error:', error);
            (0, response_js_1.sendError)(res, 'Failed to delete transaction.', 'TRANSACTION_DELETE_ERROR', 500);
        }
    }
    // Invoices
    static async getInvoices(req, res) {
        try {
            const invoices = await prisma_js_1.prisma.invoice.findMany({
                include: {
                    event: { select: { id: true, name: true } },
                    vendor: { select: { id: true, name: true, category: true } },
                },
                orderBy: { date: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, invoices);
        }
        catch (error) {
            console.error('Get invoices error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch invoices.', 'INVOICE_FETCH_ERROR', 500);
        }
    }
    static async createInvoice(req, res) {
        try {
            const { eventId, vendorId, recipientName, recipientEmail, description, amount, paymentStatus } = req.body;
            if (!recipientName || !recipientEmail || !description || amount === undefined) {
                (0, response_js_1.sendError)(res, 'Recipient name, email, description, and amount are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const invoiceNumber = qr_service_js_1.QRService.generateInvoiceNumber();
            const invoice = await prisma_js_1.prisma.invoice.create({
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
            (0, response_js_1.sendSuccess)(res, invoice, 'Invoice generated successfully', 201);
        }
        catch (error) {
            console.error('Create invoice error:', error);
            (0, response_js_1.sendError)(res, 'Failed to generate invoice.', 'INVOICE_CREATE_ERROR', 500);
        }
    }
    static async downloadInvoicePDF(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma_js_1.prisma.invoice.findFirst({
                where: {
                    OR: [{ id }, { invoiceNumber: id }],
                },
                include: {
                    event: true,
                    vendor: true,
                },
            });
            if (!invoice) {
                (0, response_js_1.sendError)(res, 'Invoice not found.', 'NOT_FOUND', 404);
                return;
            }
            await pdf_service_js_1.PDFService.streamInvoicePDF(res, invoice);
        }
        catch (error) {
            console.error('Invoice PDF error:', error);
            (0, response_js_1.sendError)(res, 'Failed to generate invoice PDF.', 'PDF_ERROR', 500);
        }
    }
}
exports.FinanceController = FinanceController;
