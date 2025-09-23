import { Knex } from "knex";

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
  user_id?: number; // For filtering events by user (used in my-events)
  search?: string; 
  upcoming?: boolean; // Filter for upcoming events
  category_id?: number;
  tag_ids?: number[];
}

export class EventModel {
  private db: Knex;

  constructor(database: Knex) {
    this.db = database;
  }

  async create(eventData: CreateEventData): Promise<Event> {
    return await this.db.transaction(async (trx) => {
      const [insertedId] = await trx("events").insert({
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        location: eventData.location,
        event_type: eventData.event_type,
        created_by: eventData.created_by,
        category_id: eventData.category_id,
      });


      if (eventData.tag_ids && eventData.tag_ids.length > 0) {
        const tagAssociations = eventData.tag_ids.map(tagId => ({
          event_id: insertedId,
          tag_id: tagId
        }));
        await trx("event_tags").insert(tagAssociations);
      }

      const event = await trx("events")
        .where({ id: insertedId })
        .select([
          "id",
          "title", 
          "description",
          "event_date",
          "location",
          "event_type",
          "created_by",
          "category_id",
          "created_at",
          "updated_at"
        ])
        .first();

      if (!event) {
        throw new Error('Failed to create event');
      }

      return event;
    });
  }

  async findById(id: number): Promise<Event | undefined> {
    const event = await this.db("events")
      .leftJoin("users", "events.created_by", "users.id")
      .leftJoin("categories", "events.category_id", "categories.id")
      .where("events.id", id)
      .select([
        "events.*",
        "users.name as creator_name",
        "users.email as creator_email",
        "categories.name as category_name"
      ])
      .first();

    if (!event) {
      return undefined;
    }

    const tags = await this.db("event_tags")
      .leftJoin("tags", "event_tags.tag_id", "tags.id")
      .where("event_tags.event_id", id)
      .select([
        "tags.id",
        "tags.name",
        "tags.description"
      ]);

    return {
      ...event,
      tags: tags || []
    };
  }

  async findAll(filters: EventFilters = {}, limit: number = 20, offset: number = 0): Promise<Event[]> {
    let query = this.db("events")
      .leftJoin("users", "events.created_by", "users.id")
      .leftJoin("categories", "events.category_id", "categories.id")
      .select([
        "events.*",
        "users.name as creator_name",
        "users.email as creator_email",
        "categories.name as category_name"
      ]);

    if (filters.event_type) {
      query = query.where("events.event_type", filters.event_type);
    }

    if (filters.created_by) {
      query = query.where("events.created_by", filters.created_by);
    }

    if (filters.user_id) {
      query = query.where("events.created_by", filters.user_id);
    }

    if (filters.category_id) {
      query = query.where("events.category_id", filters.category_id);
    }

    if (filters.tag_ids && filters.tag_ids.length > 0) {
      query = query.whereIn("events.id", function() {
        this.select("event_id")
            .from("event_tags")
            .whereIn("tag_id", filters.tag_ids!);
      });
    }

    if (filters.search) {
      query = query.where(function() {
        this.where("events.title", "like", `%${filters.search}%`)
            .orWhere("events.description", "like", `%${filters.search}%`)
            .orWhere("events.location", "like", `%${filters.search}%`);
      });
    }

    if (filters.upcoming) {
      query = query.where("events.event_date", ">=", new Date());
    }

    const events = await query
      .orderBy("events.event_date", "asc")
      .limit(limit)
      .offset(offset);

    if (events.length > 0) {
      const eventIds = events.map(event => event.id);
      const eventTags = await this.db("event_tags")
        .leftJoin("tags", "event_tags.tag_id", "tags.id")
        .whereIn("event_tags.event_id", eventIds)
        .select([
          "event_tags.event_id",
          "tags.id",
          "tags.name",
          "tags.description"
        ]);

      const tagsByEvent = eventTags.reduce((acc: any, tag: any) => {
        if (!acc[tag.event_id]) {
          acc[tag.event_id] = [];
        }
        acc[tag.event_id].push({
          id: tag.id,
          name: tag.name,
          description: tag.description
        });
        return acc;
      }, {});

      events.forEach((event: any) => {
        event.tags = tagsByEvent[event.id] || [];
      });
    }

    return events;
  }

  async findByUserId(userId: number, limit: number = 20, offset: number = 0): Promise<Event[]> {
    return await this.db("events")
      .where("created_by", userId)
      .select([
        "id",
        "title",
        "description", 
        "event_date",
        "location",
        "event_type",
        "created_by",
        "created_at",
        "updated_at"
      ])
      .orderBy("event_date", "asc")
      .limit(limit)
      .offset(offset);
  }

  async update(id: number, updateData: UpdateEventData): Promise<Event | null> {
    return await this.db.transaction(async (trx) => {
      const { tag_ids, ...eventUpdateData } = updateData;

      const updated = await trx("events")
        .where({ id })
        .update({
          ...eventUpdateData,
          updated_at: trx.fn.now()
        });

      if (updated === 0) {
        return null;
      }

      if (tag_ids !== undefined) {
        // Remove existing tag associations
        await trx("event_tags").where("event_id", id).del();

        if (tag_ids.length > 0) {
          const tagAssociations = tag_ids.map(tagId => ({
            event_id: id,
            tag_id: tagId
          }));
          await trx("event_tags").insert(tagAssociations);
        }
      }

      const event = await this.findById(id);
      return event || null;
    });
  }

  async delete(id: number): Promise<boolean> {
    return await this.db.transaction(async (trx) => {
      await trx("event_tags").where("event_id", id).del();

      const deleted = await trx("events")
        .where({ id })
        .del();

      return deleted > 0;
    });
  }

  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    return await this.db("events")
      .leftJoin("users", "events.created_by", "users.id")
      .where("events.event_date", ">=", new Date())
      .where("events.event_type", "public")
      .select([
        "events.*",
        "users.name as creator_name"
      ])
      .orderBy("events.event_date", "asc")
      .limit(limit);
  }

  async getPastEvents(limit: number = 10): Promise<Event[]> {
    return await this.db("events")
      .leftJoin("users", "events.created_by", "users.id")
      .where("events.event_date", "<", new Date())
      .select([
        "events.*",
        "users.name as creator_name"
      ])
      .orderBy("events.event_date", "desc")
      .limit(limit);
  }

  async getEventCount(filters: EventFilters = {}): Promise<number> {
    let query = this.db("events");

    if (filters.event_type) {
      query = query.where("event_type", filters.event_type);
    }

    if (filters.created_by) {
      query = query.where("created_by", filters.created_by);
    }

    if (filters.category_id) {
      query = query.where("category_id", filters.category_id);
    }

    if (filters.tag_ids && filters.tag_ids.length > 0) {
      query = query.whereIn("id", function() {
        this.select("event_id")
            .from("event_tags")
            .whereIn("tag_id", filters.tag_ids!);
      });
    }

    if (filters.search) {
      query = query.where(function() {
        this.where("title", "like", `%${filters.search}%`)
            .orWhere("description", "like", `%${filters.search}%`)
            .orWhere("location", "like", `%${filters.search}%`);
      });
    }

    if (filters.upcoming) {
      query = query.where("event_date", ">=", new Date());
    }

    const result = await query.count("id as count").first();
    return result ? Number(result.count) : 0;
  }

  // Helper method to get events by tag
  async findByTagId(tagId: number, limit: number = 20, offset: number = 0): Promise<Event[]> {
    const eventIds = await this.db("event_tags")
      .where("tag_id", tagId)
      .select("event_id")
      .pluck("event_id");

    if (eventIds.length === 0) {
      return [];
    }

    return await this.findAll({ upcoming: false }, limit, offset);
  }

  // Helper method to get events by category
  async findByCategoryId(categoryId: number, limit: number = 20, offset: number = 0): Promise<Event[]> {
    return await this.findAll({ category_id: categoryId }, limit, offset);
  }

  async addTagsToEvent(eventId: number, tagIds: number[]): Promise<boolean> {
    try {
      const tagAssociations = tagIds.map(tagId => ({
        event_id: eventId,
        tag_id: tagId
      }));
      await this.db("event_tags").insert(tagAssociations);
      return true;
    } catch (error) {
      console.error('Error adding tags to event:', error);
      return false;
    }
  }

  async removeTagsFromEvent(eventId: number, tagIds?: number[]): Promise<boolean> {
    try {
      let query = this.db("event_tags").where("event_id", eventId);
      
      if (tagIds && tagIds.length > 0) {
        query = query.whereIn("tag_id", tagIds);
      }
      
      await query.del();
      return true;
    } catch (error) {
      console.error('Error removing tags from event:', error);
      return false;
    }
  }

  async getEventTags(eventId: number): Promise<any[]> {
    return await this.db("event_tags")
      .leftJoin("tags", "event_tags.tag_id", "tags.id")
      .where("event_tags.event_id", eventId)
      .select([
        "tags.id",
        "tags.name",
        "tags.description"
      ]);
  }
}