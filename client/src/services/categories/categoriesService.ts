import api from '../api';
import type { Category } from '../events/types';

class CategoryService {

  async getAllCategories(includeEventCount = false): Promise<Category[]> {
    try {
      const response = await api.get<{ success: boolean; data: { categories: Category[] }; message: string }>(
        `/categories?include_event_count=${includeEventCount}`
      );
      return response.data.data.categories;
    } catch (error: any) {
      console.error('Error fetching categories:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch categories');
    }
  }

  async getCategoryById(categoryId: number, includeEventCount = false): Promise<Category> {
    try {
      const response = await api.get<{ success: boolean; data: { category: Category }; message: string }>(
        `/categories/${categoryId}?include_event_count=${includeEventCount}`
      );
      return response.data.data.category;
    } catch (error: any) {
      console.error('Error fetching category:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch category');
    }
  }

  async getCategoryEvents(categoryId: number): Promise<number[]> {
    try {
      const response = await api.get<{ success: boolean; data: { category: Category; eventIds: number[] }; message: string }>(
        `/categories/${categoryId}/events`
      );
      return response.data.data.eventIds;
    } catch (error: any) {
      console.error('Error fetching category events:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch category events');
    }
  }
}

export default new CategoryService();