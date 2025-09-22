import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tags', (table) => {
    table.increments('id').primary();
    table.string('name', 50).notNullable().unique();
    table.text('description').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('tags');
}

