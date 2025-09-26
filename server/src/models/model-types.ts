import { Request } from 'express';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  refresh_token?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone_number: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Event related interfaces
export interface Event {
  id?: number;
  title: string;
  description?: string;
  event_date: Date;
  location: string;
  event_type: 'public' | 'private';
  created_by: number;
  category_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_date: Date;
  location: string;
  event_type: 'public' | 'private';
  created_by: number;
  category_id?: number | null;
  tag_ids?: number[];
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  event_date?: Date;
  location?: string;
  event_type?: 'public' | 'private';
  category_id?: number | null;
  tag_ids?: number[];
}

export interface EventFilters {
  event_type?: 'public' | 'private';
  created_by?: number;
  user_id?: number;
  search?: string;
  upcoming?: boolean;
  category_id?: number;
  tag_ids?: number[];
  date_start?: string;
  date_end?: string;
  sortBy?: 'event_date' | 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Category related interfaces
export interface Category {
  id?: number;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

// Tag related interfaces
export interface Tag {
  id?: number;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTagData {
  name: string;
  description?: string;
}

export interface UpdateTagData {
  name?: string;
  description?: string;
}

