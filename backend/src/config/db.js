import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({

  user: "postgres",

  host: "localhost",

  database: "nivestha_db",

  password: "Nayan@2775",   // ✅ use REAL password here (NOT encoded)

  port: 5432,

});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected Successfully"))
  .catch(err => console.error("❌ PostgreSQL Connection Error:", err.message));

export default pool;