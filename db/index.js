import "dotenv/config";
import * as pg from "pg";
const { Pool } = pg.default;

let pool;
if (process.env.NODE_ENV == "development") {
  console.log('Development.')
  pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
  });
} else {
  console.log('Connection string connection.')
  const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };

  console.log("Logged in.");

  pool = new Pool(config);
}

export const query = (text, params, callback) => {
  return pool.query(text, params, callback);
};
