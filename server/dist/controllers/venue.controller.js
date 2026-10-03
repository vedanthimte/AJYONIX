"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class VenueController {
    static async getAll(req, res) {
        try {
            const venues = await prisma_js_1.prisma.venue.findMany({
                include: {
                    _count: { select: { events: true } },
                },
                orderBy: { name: 'asc' },
            });
            (0, response_js_1.sendSuccess)(res, venues);
        }
        catch (error) {
            console.error('Get venues error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch venues.', 'VENUE_FETCH_ERROR', 500);
        }
    }
    static async create(req, res) {
        try {
            const { name, location, capacity, facilities, availability, price } = req.body;
            if (!name || !location || !capacity) {
                (0, response_js_1.sendError)(res, 'Name, location, and capacity are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const venue = await prisma_js_1.prisma.venue.create({
                data: {
                    name,
                    location,
                    capacity: Number(capacity),
                    facilities: facilities || 'Standard seating and lighting',
                    availability: availability !== undefined ? Boolean(availability) : true,
                    price: Number(price) || 0,
                },
            });
            (0, response_js_1.sendSuccess)(res, venue, 'Venue added successfully', 201);
        }
        catch (error) {
            console.error('Create venue error:', error);
            (0, response_js_1.sendError)(res, 'Failed to create venue.', 'VENUE_CREATE_ERROR', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            if (data.capacity)
                data.capacity = Number(data.capacity);
            if (data.price !== undefined)
                data.price = Number(data.price);
            if (data.availability !== undefined)
                data.availability = Boolean(data.availability);
            const updated = await prisma_js_1.prisma.venue.update({
                where: { id },
                data,
            });
            (0, response_js_1.sendSuccess)(res, updated, 'Venue updated successfully');
        }
        catch (error) {
            console.error('Update venue error:', error);
            (0, response_js_1.sendError)(res, 'Failed to update venue.', 'VENUE_UPDATE_ERROR', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma_js_1.prisma.venue.delete({
                where: { id },
            });
            (0, response_js_1.sendSuccess)(res, null, 'Venue deleted successfully');
        }
        catch (error) {
            console.error('Delete venue error:', error);
            (0, response_js_1.sendError)(res, 'Failed to delete venue.', 'VENUE_DELETE_ERROR', 500);
        }
    }
}
exports.VenueController = VenueController;
