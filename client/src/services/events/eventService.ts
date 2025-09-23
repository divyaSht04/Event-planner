import api from '../api';
import type {
  Event,
  CreateEventData,
  UpdateEventData,
  EventFilters,
  EventListResponse,
  EventResponse,
  EventDeleteResponse
} from './types';

class EventService {

  async createEvent(eventData: CreateEventData): Promise<EventResponse> {
    try {
      const response = await api.post<EventResponse>('/events', eventData);
      return response.data;
    } catch (error: any) {
      console.error('Create event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to create event');
    }
  }

  async getAllEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.search) params.append('search', filters.search);
      if (filters.upcoming) params.append('upcoming', 'true');
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
      if (filters.tag_ids && filters.tag_ids.length > 0) {
        filters.tag_ids.forEach(id => params.append('tag_ids', id.toString()));
      }
      if (filters.date_start) params.append('date_start', filters.date_start);
      if (filters.date_end) params.append('date_end', filters.date_end);

      const queryString = params.toString();
      const url = queryString ? `/events?${queryString}` : '/events';
      
      const response = await api.get<EventListResponse>(url);
      return response.data;
    } catch (error: any) {
      console.error('Get events error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch events');
    }
  }

  async getMyEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.search) params.append('search', filters.search);
      if (filters.upcoming) params.append('upcoming', 'true');
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
      if (filters.tag_ids && filters.tag_ids.length > 0) {
        filters.tag_ids.forEach(id => params.append('tag_ids', id.toString()));
      }
      if (filters.date_start) params.append('date_start', filters.date_start);
      if (filters.date_end) params.append('date_end', filters.date_end);

      const queryString = params.toString();
      const url = queryString ? `/events/my-events?${queryString}` : '/events/my-events';
      
      const response = await api.get<EventListResponse>(url);
      return response.data;
    } catch (error: any) {
      console.error('Get my events error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch your events');
    }
  }

  async getEventById(eventId: number): Promise<Event> {
    try {
      const response = await api.get<{ event: Event }>(`/events/${eventId}`);
      return response.data.event;
    } catch (error: any) {
      console.error('Get event by ID error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch event');
    }
  }

  async updateEvent(eventId: number, updateData: UpdateEventData): Promise<EventResponse> {
    try {
      const response = await api.put<EventResponse>(`/events/${eventId}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Update event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update event');
    }
  }

  async deleteEvent(eventId: number): Promise<EventDeleteResponse> {
    try {
      const response = await api.delete<EventDeleteResponse>(`/events/${eventId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to delete event');
    }
  }

  async getUpcomingEvents(limit: number = 10): Promise<EventListResponse> {
    try {
      const response = await api.get<EventListResponse>(`/events/upcoming?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Get upcoming events error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch upcoming events');
    }
  }

  async getPastEvents(limit: number = 10): Promise<EventListResponse> {
    try {
      const response = await api.get<EventListResponse>(`/events/past?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Get past events error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch past events');
    }
  }

  async searchEvents(searchTerm: string, filters: Omit<EventFilters, 'search'> = {}): Promise<EventListResponse> {
    try {
      return await this.getAllEvents({ ...filters, search: searchTerm });
    } catch (error: any) {
      console.error('Search events error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to search events');
    }
  }

  async getEventsByType(eventType: 'public' | 'private', filters: Omit<EventFilters, 'event_type'> = {}): Promise<EventListResponse> {
    try {
      return await this.getAllEvents({ ...filters, event_type: eventType });
    } catch (error: any) {
      console.error('Get events by type error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || `Failed to fetch ${eventType} events`);
    }
  }
}

export const eventService = new EventService();
export default EventService;