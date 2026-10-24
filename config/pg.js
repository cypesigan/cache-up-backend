// Neon Postgres connection. Only user accounts live here; everything else is still in MongoDB.
const { Pool } = require("pg");

let pool = null;

const getPool = () => {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Run `neon deploy` or copy the Neon connection string into .env.");
  }
  // DATABASE_URL is the pooled Neon endpoint, which suits a long-running API server.
  pool = new Pool({ connectionString: url, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 15000 });
  pool.on("error", (err) => console.error("Postgres pool error:", err.message));
  return pool;
};

const query = (text, params) => getPool().query(text, params);

const closePool = async () => {
  if (pool) await pool.end();
  pool = null;
};

const isReady = async () => {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
};

module.exports = { getPool, query, closePool, isReady };
