import { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'eventuser',
    password: process.env.DB_PASSWORD || 'eventpass',
    database: process.env.DB_NAME || 'event_planner',
  },
};


export default dbConfig;