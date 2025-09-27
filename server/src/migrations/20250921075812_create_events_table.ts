import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.datetime('event_date').notNullable();
    table.string('location', 255).notNullable();
    table.enum('event_type', ['public', 'private']).defaultTo('public');
    table.integer('created_by').unsigned().notNullable();
    table.timestamps(true, true); // created_at and updated_at
    
    // Foreign key constraint
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes for better performance
    table.index('created_by');
    table.index('event_date');
    table.index('event_type');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('events');
}

