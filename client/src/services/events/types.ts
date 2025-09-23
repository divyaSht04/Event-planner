export interface Event {
  id?: number;
  title: string;
  description?: string;
  event_date: string;
  location: string;
  event_type: 'public' | 'private';
  created_by?: number;
  creator_name?: string;
  creator_email?: string;
  created_at?: string;
  updated_at?: string;
  category_id?: number;
  category_name?: string;
  tags?: Tag[];
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_date: string;
  location: string;
  event_type: 'public' | 'private';
  category_id?: number;
  tag_ids?: number[];
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  event_date?: string;
  location?: string;
  event_type?: 'public' | 'private';
  category_id?: number | null;
  tag_ids?: number[];
}

export interface EventFilters {
  page?: number;
  limit?: number;
  event_type?: 'public' | 'private';
  search?: string;
  upcoming?: boolean;
  category_id?: number;
  tag_ids?: number[];
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

// Tag interfaces
export interface Tag {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TagListResponse {
  success: boolean;
  data: {
    tags: Tag[];
  };
  message: string;
}

// Category interfaces
export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  event_count?: number;
}

export interface CategoryListResponse {
  success: boolean;
  data: {
    categories: Category[];
  };
  message: string;
}