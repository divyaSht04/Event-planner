import { Request, Response } from 'express';
import { EventModel, CreateEventData, UpdateEventData, EventFilters } from '../models/Event';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export class EventController {
  private eventModel: EventModel;

  constructor(eventModel: EventModel) {
    this.eventModel = eventModel;
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, description, event_date, location, event_type } = req.body;

      if (!title || !event_date || !location) {
        res.status(400).json({ 
          error: 'Title, event date, and location are required' 
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const eventDate = new Date(event_date);
      if (eventDate <= new Date()) {
        res.status(400).json({ 
          error: 'Event date must be in the future' 
        });
        return;
      }

      if (event_type && !['public', 'private'].includes(event_type)) {
        res.status(400).json({ 
          error: 'Event type must be either "public" or "private"' 
        });
        return;
      }

      const eventData: CreateEventData = {
        title: title.trim(),
        description: description?.trim(),
        event_date: eventDate,
        location: location.trim(),
        event_type: event_type || 'public',
        created_by: req.user.id,
      };

      const event = await this.eventModel.create(eventData);

      res.status(201).json({
        message: 'Event created successfully',
        event,
      });
    } catch (error) {
      console.error('Event creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        event_type,
        search,
        upcoming,
        page = 1,
        limit = 20,
      } = req.query;

      const filters: EventFilters = {};
      
      if (event_type) {
        filters.event_type = event_type as 'public' | 'private';
      }
      
      if (search) {
        filters.search = search as string;
      }
      
      if (upcoming === 'true') {
        filters.upcoming = true;
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const [events, totalCount] = await Promise.all([
        this.eventModel.findAll(filters, limitNum, offset),
        this.eventModel.getEventCount(filters),
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.json({
        events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get event by ID
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Event ID is required' });
        return;
      }
      
      const eventId = parseInt(id, 10);

      if (isNaN(eventId)) {
        res.status(400).json({ error: 'Invalid event ID' });
        return;
      }

      const event = await this.eventModel.findById(eventId);

      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.json({ event });
    } catch (error) {
      console.error('Get event by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's events
  async getUserEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const events = await this.eventModel.findByUserId(
        req.user.id, 
        limitNum, 
        offset
      );

      res.json({ events });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update event
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Event ID is required' });
        return;
      }
      
      const eventId = parseInt(id, 10);

      if (isNaN(eventId)) {
        res.status(400).json({ error: 'Invalid event ID' });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if event exists and user is the owner
      const existingEvent = await this.eventModel.findById(eventId);
      if (!existingEvent) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      if (existingEvent.created_by !== req.user.id) {
        res.status(403).json({ 
          error: 'Unauthorized: You can only edit your own events' 
        });
        return;
      }

      const { title, description, event_date, location, event_type } = req.body;
      const updateData: UpdateEventData = {};

      // Build update data with validation
      if (title !== undefined) {
        if (!title.trim()) {
          res.status(400).json({ error: 'Title cannot be empty' });
          return;
        }
        updateData.title = title.trim();
      }

      if (description !== undefined) {
        updateData.description = description?.trim();
      }

      if (event_date !== undefined) {
        const eventDate = new Date(event_date);
        if (eventDate <= new Date()) {
          res.status(400).json({ 
            error: 'Event date must be in the future' 
          });
          return;
        }
        updateData.event_date = eventDate;
      }

      if (location !== undefined) {
        if (!location.trim()) {
          res.status(400).json({ error: 'Location cannot be empty' });
          return;
        }
        updateData.location = location.trim();
      }

      if (event_type !== undefined) {
        if (!['public', 'private'].includes(event_type)) {
          res.status(400).json({ 
            error: 'Event type must be either "public" or "private"' 
          });
          return;
        }
        updateData.event_type = event_type;
      }

      const updatedEvent = await this.eventModel.update(eventId, updateData);

      if (!updatedEvent) {
        res.status(500).json({ error: 'Failed to update event' });
        return;
      }

      res.json({
        message: 'Event updated successfully',
        event: updatedEvent,
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Event ID is required' });
        return;
      }
      
      const eventId = parseInt(id, 10);

      if (isNaN(eventId)) {
        res.status(400).json({ error: 'Invalid event ID' });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if event exists and user is the owner
      const existingEvent = await this.eventModel.findById(eventId);
      if (!existingEvent) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      if (existingEvent.created_by !== req.user.id) {
        res.status(403).json({ 
          error: 'Unauthorized: You can only delete your own events' 
        });
        return;
      }

      const deleted = await this.eventModel.delete(eventId);

      if (!deleted) {
        res.status(500).json({ error: 'Failed to delete event' });
        return;
      }

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get upcoming events (public endpoint)
  async getUpcoming(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      const limitNum = parseInt(limit as string, 10);

      const events = await this.eventModel.getUpcomingEvents(limitNum);

      res.json({ events });
    } catch (error) {
      console.error('Get upcoming events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get past events
  async getPast(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      const limitNum = parseInt(limit as string, 10);

      const events = await this.eventModel.getPastEvents(limitNum);

      res.json({ events });
    } catch (error) {
      console.error('Get past events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}