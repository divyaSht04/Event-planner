import { Request, Response } from 'express';
import { EventModel, CreateEventData, UpdateEventData, EventFilters } from '../models/Event';
import { logger } from '../config/LoggerConfig';

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
      const { title, description, event_date, location, event_type, category_id, tag_ids } = req.body;

      logger.info(`Event creation attempt by user ${req.user?.id}: ${title}`);

      if (!title || !event_date || !location) {
        logger.warn(`Event creation failed - missing fields by user ${req.user?.id}`);
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

      if (category_id && (!Number.isInteger(category_id) || category_id <= 0)) {
        res.status(400).json({ 
          error: 'Category ID must be a positive integer' 
        });
        return;
      }

      if (tag_ids && (!Array.isArray(tag_ids) || !tag_ids.every(id => Number.isInteger(id) && id > 0))) {
        res.status(400).json({ 
          error: 'Tag IDs must be an array of positive integers' 
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
        category_id: category_id || undefined,
        tag_ids: tag_ids || [],
      };

      const event = await this.eventModel.create(eventData);

      res.status(201).json({
        message: 'Event created successfully',
        event,
      });
    } catch (error) {
      logger.error(`Event creation failed by user ${req.user?.id}: ${error}`);
      logger.error(`Event creation error: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        event_type,
        search,
        upcoming,
        category_id,
        tag_ids,
        date_start,
        date_end,
        page = 1,
        limit = 10,
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

      if (category_id) {
        const categoryIdNum = parseInt(category_id as string, 10);
        if (!isNaN(categoryIdNum)) {
          filters.category_id = categoryIdNum;
        }
      }

      if (tag_ids) {
        try {
          const tagIdsArray = Array.isArray(tag_ids) ? tag_ids : [tag_ids];
          const tagIdsNumbers = tagIdsArray
            .map(id => parseInt(id as string, 10))
            .filter(id => !isNaN(id));
          
          if (tagIdsNumbers.length > 0) {
            filters.tag_ids = tagIdsNumbers;
          }
        } catch (error) {
          // Ignore invalid tag_ids
        }
      }

      // Date filtering
      if (date_start) {
        filters.date_start = date_start as string;
      }
      
      if (date_end) {
        filters.date_end = date_end as string;
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
      logger.error(`Get events error: ${error}`);
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
      logger.error(`Get event by ID error: ${error}`);
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

      const {
        search,
        upcoming,
        category_id,
        tag_ids,
        date_start,
        date_end,
        page = 1,
        limit = 20,
      } = req.query;

      const filters: EventFilters = {};
      filters.user_id = req.user.id; // Only get events for the authenticated user
      
      if (search) {
        filters.search = search as string;
      }
      
      if (upcoming === 'true') {
        filters.upcoming = true;
      }

      if (category_id) {
        const categoryIdNum = parseInt(category_id as string, 10);
        if (!isNaN(categoryIdNum)) {
          filters.category_id = categoryIdNum;
        }
      }

      if (tag_ids) {
        try {
          const tagIdsArray = Array.isArray(tag_ids) ? tag_ids : [tag_ids];
          const tagIdsNumbers = tagIdsArray
            .map(id => parseInt(id as string, 10))
            .filter(id => !isNaN(id));
          
          if (tagIdsNumbers.length > 0) {
            filters.tag_ids = tagIdsNumbers;
          }
        } catch (error) {
          // Ignore invalid tag_ids
        }
      }

      // Date filtering
      if (date_start) {
        filters.date_start = date_start as string;
      }
      
      if (date_end) {
        filters.date_end = date_end as string;
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
        },
      });
    } catch (error) {
      logger.error(`Get user events error: ${error}`);
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

      const { title, description, event_date, location, event_type, category_id, tag_ids } = req.body;
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

      // Handle category_id update
      if (category_id !== undefined) {
        if (category_id === null || category_id === '') {
          updateData.category_id = null;
        } else {
          const categoryIdNum = parseInt(category_id as string, 10);
          if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
            res.status(400).json({ 
              error: 'Category ID must be a positive integer or null' 
            });
            return;
          }
          updateData.category_id = categoryIdNum;
        }
      }

      // Handle tag_ids update
      if (tag_ids !== undefined) {
        if (!Array.isArray(tag_ids)) {
          res.status(400).json({ 
            error: 'Tag IDs must be an array' 
          });
          return;
        }
        
        if (tag_ids.length > 0 && !tag_ids.every(id => Number.isInteger(id) && id > 0)) {
          res.status(400).json({ 
            error: 'All tag IDs must be positive integers' 
          });
          return;
        }
        
        updateData.tag_ids = tag_ids;
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
      logger.error(`Update event error: ${error}`);
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
      logger.error(`Delete event error: ${error}`);
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
      logger.error(`Get upcoming events error: ${error}`);
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
      logger.error(`Get past events error: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}