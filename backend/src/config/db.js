import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const ssl = process.env.DB_SSL === "true"
  ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
  : undefined;

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "nivestha_db",
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT || 5432),
    };

if (ssl) poolConfig.ssl = ssl;

const pool = new Pool(poolConfig);

pool.connect()
  .then((client) => {
    client.release();
    console.log("PostgreSQL connected successfully");
  })
  .catch((err) => console.error("PostgreSQL connection error:", err.message));

export default pool;
