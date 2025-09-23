import api from '../api';
import type { Tag } from '../events/types';

class TagService {

  async getAllTags(includeEventCount = false): Promise<Tag[]> {
    try {
      const response = await api.get<{ success: boolean; data: { tags: Tag[] }; message: string }>(
        `/tags?include_event_count=${includeEventCount}`
      );
      return response.data.data.tags;
    } catch (error: any) {
      console.error('Error fetching tags:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch tags');
    }
  }

  async getTagById(tagId: number, includeEventCount = false): Promise<Tag> {
    try {
      const response = await api.get<{ success: boolean; data: { tag: Tag }; message: string }>(
        `/tags/${tagId}?include_event_count=${includeEventCount}`
      );
      return response.data.data.tag;
    } catch (error: any) {
      console.error('Error fetching tag:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch tag');
    }
  }

  async getTagEvents(tagId: number): Promise<number[]> {
    try {
      const response = await api.get<{ success: boolean; data: { tag: Tag; eventIds: number[] }; message: string }>(
        `/tags/${tagId}/events`
      );
      return response.data.data.eventIds;
    } catch (error: any) {
      console.error('Error fetching tag events:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch tag events');
    }
  }
}

export default new TagService();