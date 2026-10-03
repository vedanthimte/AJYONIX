import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class VendorController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const vendors = await prisma.vendor.findMany({
        include: {
          _count: { select: { transactions: true, invoices: true } },
        },
        orderBy: { rating: 'desc' },
      });
      sendSuccess(res, vendors);
    } catch (error: any) {
      console.error('Get vendors error:', error);
      sendError(res, 'Failed to fetch vendors.', 'VENDOR_FETCH_ERROR', 500);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, category, contact, services, pricing, rating } = req.body;

      if (!name || !category || !contact) {
        sendError(res, 'Name, category, and contact are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const vendor = await prisma.vendor.create({
        data: {
          name,
          category,
          contact,
          services: services || '',
          pricing: Number(pricing) || 0,
          rating: Number(rating) || 4.5,
        },
      });

      sendSuccess(res, vendor, 'Vendor added successfully', 201);
    } catch (error: any) {
      console.error('Create vendor error:', error);
      sendError(res, 'Failed to create vendor.', 'VENDOR_CREATE_ERROR', 500);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (data.pricing !== undefined) data.pricing = Number(data.pricing);
      if (data.rating !== undefined) data.rating = Number(data.rating);

      const updated = await prisma.vendor.update({
        where: { id },
        data,
      });

      sendSuccess(res, updated, 'Vendor updated successfully');
    } catch (error: any) {
      console.error('Update vendor error:', error);
      sendError(res, 'Failed to update vendor.', 'VENDOR_UPDATE_ERROR', 500);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.vendor.delete({
        where: { id },
      });

      sendSuccess(res, null, 'Vendor deleted successfully');
    } catch (error: any) {
      console.error('Delete vendor error:', error);
      sendError(res, 'Failed to delete vendor.', 'VENDOR_DELETE_ERROR', 500);
    }
  }
}
