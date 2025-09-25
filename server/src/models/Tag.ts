import { Knex } from 'knex';
import type { Tag, CreateTagData, UpdateTagData } from "./model-types";

class TagModel {
  private tableName = 'tags';
  private db: Knex;

  constructor(database: Knex) {
    this.db = database;
  }

  async getAll(): Promise<Tag[]> {
    return this.db(this.tableName)
      .select('*')
      .orderBy('name', 'asc');
  }

  async getById(id: number): Promise<Tag | null> {
    const tag = await this.db(this.tableName)
      .where({ id })
      .first();
    
    return tag || null;
  }

  async getByName(name: string): Promise<Tag | null> {
    const tag = await this.db(this.tableName)
      .where({ name })
      .first();
    
    return tag || null;
  }

  async create(tagData: CreateTagData): Promise<Tag> {
    const [id] = await this.db(this.tableName)
      .insert(tagData)
      .returning('id');

    const tag = await this.getById(id);
    if (!tag) {
      throw new Error('Failed to create tag');
    }

    return tag;
  }

  async update(id: number, updateData: UpdateTagData): Promise<Tag> {
    await this.db(this.tableName)
      .where({ id })
      .update(updateData);

    const tag = await this.getById(id);
    if (!tag) {
      throw new Error('Tag not found');
    }

    return tag;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.db(this.tableName)
      .where({ id })
      .del();

    return deleted > 0;
  }

  async getTagsByEventId(eventId: number): Promise<Tag[]> {
    return this.db(this.tableName)
      .join('event_tags', 'tags.id', 'event_tags.tag_id')
      .where('event_tags.event_id', eventId)
      .select('tags.*')
      .orderBy('tags.name', 'asc');
  }

  async addTagToEvent(eventId: number, tagId: number): Promise<void> {
    await this.db('event_tags').insert({
      event_id: eventId,
      tag_id: tagId
    });
  }

  async removeTagFromEvent(eventId: number, tagId: number): Promise<boolean> {
    const deleted = await this.db('event_tags')
      .where({
        event_id: eventId,
        tag_id: tagId
      })
      .del();

    return deleted > 0;
  }

  async setEventTags(eventId: number, tagIds: number[]): Promise<void> {
    // Remove existing tags for this event
    await this.db('event_tags')
      .where({ event_id: eventId })
      .del();

    // Add new tags if any
    if (tagIds.length > 0) {
      const eventTags = tagIds.map(tagId => ({
        event_id: eventId,
        tag_id: tagId
      }));

      await this.db('event_tags').insert(eventTags);
    }
  }

  async getEventsWithTag(tagId: number): Promise<number[]> {
    const eventIds = await this.db('event_tags')
      .where({ tag_id: tagId })
      .select('event_id');

    return eventIds.map((row: any) => row.event_id);
  }
}

export default TagModel;