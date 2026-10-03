import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class VenueController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const venues = await prisma.venue.findMany({
        include: {
          _count: { select: { events: true } },
        },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, venues);
    } catch (error: any) {
      console.error('Get venues error:', error);
      sendError(res, 'Failed to fetch venues.', 'VENUE_FETCH_ERROR', 500);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, location, capacity, facilities, availability, price } = req.body;

      if (!name || !location || !capacity) {
        sendError(res, 'Name, location, and capacity are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const venue = await prisma.venue.create({
        data: {
          name,
          location,
          capacity: Number(capacity),
          facilities: facilities || 'Standard seating and lighting',
          availability: availability !== undefined ? Boolean(availability) : true,
          price: Number(price) || 0,
        },
      });

      sendSuccess(res, venue, 'Venue added successfully', 201);
    } catch (error: any) {
      console.error('Create venue error:', error);
      sendError(res, 'Failed to create venue.', 'VENUE_CREATE_ERROR', 500);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (data.capacity) data.capacity = Number(data.capacity);
      if (data.price !== undefined) data.price = Number(data.price);
      if (data.availability !== undefined) data.availability = Boolean(data.availability);

      const updated = await prisma.venue.update({
        where: { id },
        data,
      });

      sendSuccess(res, updated, 'Venue updated successfully');
    } catch (error: any) {
      console.error('Update venue error:', error);
      sendError(res, 'Failed to update venue.', 'VENUE_UPDATE_ERROR', 500);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.venue.delete({
        where: { id },
      });

      sendSuccess(res, null, 'Venue deleted successfully');
    } catch (error: any) {
      console.error('Delete venue error:', error);
      sendError(res, 'Failed to delete venue.', 'VENUE_DELETE_ERROR', 500);
    }
  }
}
