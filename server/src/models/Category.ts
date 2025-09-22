import { Knex } from 'knex';

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

class CategoryModel {
  private tableName = 'categories';
  private db: Knex;

  constructor(database: Knex) {
    this.db = database;
  }

  async getAll(): Promise<Category[]> {
    return this.db(this.tableName)
      .select('*')
      .orderBy('name', 'asc');
  }

  async getById(id: number): Promise<Category | null> {
    const category = await this.db(this.tableName)
      .where({ id })
      .first();
    
    return category || null;
  }

  async getByName(name: string): Promise<Category | null> {
    const category = await this.db(this.tableName)
      .where({ name })
      .first();
    
    return category || null;
  }

  async create(categoryData: CreateCategoryData): Promise<Category> {
    const [id] = await this.db(this.tableName)
      .insert(categoryData)
      .returning('id');

    const category = await this.getById(id);
    if (!category) {
      throw new Error('Failed to create category');
    }

    return category;
  }

  async update(id: number, updateData: UpdateCategoryData): Promise<Category> {
    await this.db(this.tableName)
      .where({ id })
      .update(updateData);

    const category = await this.getById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.db(this.tableName)
      .where({ id })
      .del();

    return deleted > 0;
  }

  async getCategoryWithEventCount(id: number): Promise<Category & { event_count: number } | null> {
    const result = await this.db(this.tableName)
      .leftJoin('events', 'categories.id', 'events.category_id')
      .where('categories.id', id)
      .select('categories.*')
      .count('events.id as event_count')
      .groupBy('categories.id')
      .first();

    return (result as unknown as Category & { event_count: number }) || null;
  }

  async getAllWithEventCounts(): Promise<(Category & { event_count: number })[]> {
    const results = await this.db(this.tableName)
      .leftJoin('events', 'categories.id', 'events.category_id')
      .select('categories.*')
      .count('events.id as event_count')
      .groupBy('categories.id')
      .orderBy('categories.name', 'asc');

    return results as unknown as (Category & { event_count: number })[];
  }

  async getEventsInCategory(categoryId: number): Promise<number[]> {
    const eventIds = await this.db('events')
      .where({ category_id: categoryId })
      .select('id');

    return eventIds.map((row: any) => row.id);
  }
}

export default CategoryModel;