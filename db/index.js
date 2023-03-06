import 'dotenv/config';
import * as pg from 'pg'
const { Pool } = pg.default

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
})

export const query = (text, params, callback) => {
  return pool.query(text, params, callback)
}