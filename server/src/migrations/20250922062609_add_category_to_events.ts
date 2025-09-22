import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('events', (table) => {
    table.integer('category_id').unsigned().nullable();
    table.foreign('category_id').references('id').inTable('categories').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('events', (table) => {
    table.dropForeign(['category_id']);
    table.dropColumn('category_id');
  });
}

