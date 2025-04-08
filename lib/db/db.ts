// lib/db/db.ts
import { Pool, type PoolClient } from "pg";

export let pool: Pool | null = null;

/**
 * Returns the singleton Pool instance, creating one if necessary.
 * Includes logging for connection events.
 */
function getPool(): Pool {
  if (!pool) {
    console.log("Creating new database connection pool");

    if (!process.env.POSTGRES_URL) {
      console.error("Missing POSTGRES_URL environment variable");
      throw new Error("Database connection string is not configured");
    }

    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("connect", () => {
      console.log("New client connected to PostgreSQL database");
    });

    pool.on("error", (err) => {
      console.error("PostgreSQL pool error:", err);
    });
  }
  return pool;
}

/**
 * Executes a database query with detailed logging.
 */
export async function query(text: string, params?: unknown[]) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    console.log(`Executing query: ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`);
    if (params) {
      console.log(`Query parameters: ${JSON.stringify(params)}`);
    }
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms, returned ${result.rowCount} rows`);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    client.release();
    console.log("Database client released");
  }
}

/**
 * Checks connectivity to the database.
 */
export async function checkConnection() {
  try {
    console.log("Checking database connection");
    const result = await query("SELECT NOW()");
    console.log("Database connection successful:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Database connection check failed:", error);
    throw error;
  }
}

/**
 * Executes a transaction with proper error handling and logging.
 */
export async function transaction<T>(cb: (client: PoolClient) => Promise<T>) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const start = Date.now();
    const result = await cb(client);
    const duration = Date.now() - start;
    console.log(`Transaction executed in ${duration}ms`);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    console.error("Database transaction error:", error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    console.log("Database client released after transaction");
  }
}

/**
 * Closes the database connection pool.
 */
export async function closePool() {
  if (pool) {
    console.log("Closing database connection pool");
    await pool.end();
    pool = null;
    console.log("Database connection pool closed");
  }
}

export { getPool };
