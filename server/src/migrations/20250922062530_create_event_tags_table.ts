import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('event_tags', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable();
    table.integer('tag_id').unsigned().notNullable();
    table.timestamps(true, true);

    // Foreign key constraints
    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
    table.foreign('tag_id').references('id').inTable('tags').onDelete('CASCADE');
    
    // Ensure unique combinations (no duplicate event-tag pairs)
    table.unique(['event_id', 'tag_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('event_tags');
}

