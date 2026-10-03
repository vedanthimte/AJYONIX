"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class VendorController {
    static async getAll(req, res) {
        try {
            const vendors = await prisma_js_1.prisma.vendor.findMany({
                include: {
                    _count: { select: { transactions: true, invoices: true } },
                },
                orderBy: { rating: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, vendors);
        }
        catch (error) {
            console.error('Get vendors error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch vendors.', 'VENDOR_FETCH_ERROR', 500);
        }
    }
    static async create(req, res) {
        try {
            const { name, category, contact, services, pricing, rating } = req.body;
            if (!name || !category || !contact) {
                (0, response_js_1.sendError)(res, 'Name, category, and contact are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const vendor = await prisma_js_1.prisma.vendor.create({
                data: {
                    name,
                    category,
                    contact,
                    services: services || '',
                    pricing: Number(pricing) || 0,
                    rating: Number(rating) || 4.5,
                },
            });
            (0, response_js_1.sendSuccess)(res, vendor, 'Vendor added successfully', 201);
        }
        catch (error) {
            console.error('Create vendor error:', error);
            (0, response_js_1.sendError)(res, 'Failed to create vendor.', 'VENDOR_CREATE_ERROR', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            if (data.pricing !== undefined)
                data.pricing = Number(data.pricing);
            if (data.rating !== undefined)
                data.rating = Number(data.rating);
            const updated = await prisma_js_1.prisma.vendor.update({
                where: { id },
                data,
            });
            (0, response_js_1.sendSuccess)(res, updated, 'Vendor updated successfully');
        }
        catch (error) {
            console.error('Update vendor error:', error);
            (0, response_js_1.sendError)(res, 'Failed to update vendor.', 'VENDOR_UPDATE_ERROR', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma_js_1.prisma.vendor.delete({
                where: { id },
            });
            (0, response_js_1.sendSuccess)(res, null, 'Vendor deleted successfully');
        }
        catch (error) {
            console.error('Delete vendor error:', error);
            (0, response_js_1.sendError)(res, 'Failed to delete vendor.', 'VENDOR_DELETE_ERROR', 500);
        }
    }
}
exports.VendorController = VendorController;
