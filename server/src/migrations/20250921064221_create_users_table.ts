import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('name', 255).notNullable();
    table.string('phone_number', 20).notNullable();
    table.text('refresh_token').nullable();
    table.timestamps(true, true); // created_at and updated_at
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}

