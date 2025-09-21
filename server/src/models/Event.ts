import { Knex } from "knex";

export interface Event {
  id?: number;
  title: string;
  description?: string;
  event_date: Date;
  location: string;
  event_type: 'public' | 'private';
  created_by: number;
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
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  event_date?: Date;
  location?: string;
  event_type?: 'public' | 'private';
}

export interface EventFilters {
  event_type?: 'public' | 'private';
  created_by?: number;
  search?: string; // For title/description search
  upcoming?: boolean; // Filter for upcoming events
}

export class EventModel {
  private db: Knex;

  constructor(database: Knex) {
    this.db = database;
  }

  async create(eventData: CreateEventData): Promise<Event> {
    const [insertedId] = await this.db("events").insert({
      title: eventData.title,
      description: eventData.description,
      event_date: eventData.event_date,
      location: eventData.location,
      event_type: eventData.event_type,
      created_by: eventData.created_by,
    });

    const event = await this.db("events")
      .where({ id: insertedId })
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
      .first();

    if (!event) {
      throw new Error('Failed to create event');
    }

    return event;
  }

  async findById(id: number): Promise<Event | undefined> {
    return await this.db("events")
      .leftJoin("users", "events.created_by", "users.id")
      .where("events.id", id)
      .select([
        "events.*",
        "users.name as creator_name",
        "users.email as creator_email"
      ])
      .first();
  }

  async findAll(filters: EventFilters = {}, limit: number = 20, offset: number = 0): Promise<Event[]> {
    let query = this.db("events")
      .leftJoin("users", "events.created_by", "users.id")
      .select([
        "events.*",
        "users.name as creator_name",
        "users.email as creator_email"
      ]);

    if (filters.event_type) {
      query = query.where("events.event_type", filters.event_type);
    }

    if (filters.created_by) {
      query = query.where("events.created_by", filters.created_by);
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

    return await query
      .orderBy("events.event_date", "asc")
      .limit(limit)
      .offset(offset);
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
    const updated = await this.db("events")
      .where({ id })
      .update({
        ...updateData,
        updated_at: this.db.fn.now()
      });

    if (updated === 0) {
      return null;
    }

    // Return the updated event
    const event = await this.findById(id);
    return event || null;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.db("events")
      .where({ id })
      .del();

    return deleted > 0;
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
}