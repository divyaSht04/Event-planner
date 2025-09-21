import type { Knex } from "knex";
import dotenv from 'dotenv';

dotenv.config();

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'eventuser',
      password: process.env.DB_PASSWORD || 'eventpass',
      database: process.env.DB_NAME || 'event_planner'
    } as Knex.MySql2ConnectionConfig,
    migrations: {
      directory: './src/migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './src/seeds'
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!
    } as Knex.MySql2ConnectionConfig,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './dist/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './dist/seeds'
    }
  }
};

module.exports = config;