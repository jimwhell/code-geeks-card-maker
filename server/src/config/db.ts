import pkg from "pg";
import logger from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool: pkg.Pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  logger.info("Connection pool established with Database");
});

export default pool;
