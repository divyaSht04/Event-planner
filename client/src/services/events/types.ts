// Event types matching backend
export interface Event {
  id?: number;
  title: string;
  description?: string;
  event_date: string; // ISO string format
  location: string;
  event_type: 'public' | 'private';
  created_by?: number;
  creator_name?: string;
  creator_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_date: string;
  location: string; 
  event_type: 'public' | 'private';
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  event_date?: string;
  location?: string;
  event_type?: 'public' | 'private';
}

export interface EventFilters {
  page?: number;
  limit?: number;
  event_type?: 'public' | 'private';
  search?: string;
  upcoming?: boolean;
}

export interface EventListResponse {
  events: Event[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EventResponse {
  message: string;
  event: Event;
}

export interface EventDeleteResponse {
  message: string;
}