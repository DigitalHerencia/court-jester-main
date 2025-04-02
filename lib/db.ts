import { Pool, type PoolClient } from "pg"

// Create a singleton pool instance
export let pool: Pool | null = null

// Get or create the database pool
function getPool(): Pool {
  if (!pool) {
    console.log("Creating new database connection pool")

    // Validate connection string
    if (!process.env.POSTGRES_URL) {
      console.error("Missing POSTGRES_URL environment variable")
      throw new Error("Database connection string is not configured")
    }

    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    // Set up event handlers
    pool.on("connect", () => {
      console.log("New client connected to PostgreSQL database")
    })

    pool.on("error", (err) => {
      console.error("PostgreSQL pool error:", err)
    })
  }

  return pool
}

// Helper function to execute queries with better error handling
export async function query(text: string, params?: unknown[]) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    console.log(`Executing query: ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`)
    if (params) {
      console.log(`Query parameters: ${JSON.stringify(params)}`)
    }

    const start = Date.now()
    const result = await client.query(text, params)
    const duration = Date.now() - start

    console.log(`Query executed in ${duration}ms, returned ${result.rowCount} rows`)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  } finally {
    client.release()
    console.log("Database client released")
  }
}

// Helper function to check database connection
export async function checkConnection() {
  try {
    console.log("Checking database connection")
    const result = await query("SELECT NOW()")
    console.log("Database connection successful:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("Database connection check failed:", error)
    throw error
  }
}

// Helper function to execute transactions with better error handling
export async function transaction<T>(cb: (client: PoolClient) => Promise<T>) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const start = Date.now()
    const result = await cb(client)
    const duration = Date.now() - start

    console.log(`Transaction executed in ${duration}ms`)
    await client.query("COMMIT")
    return result
  } catch (error) {
    console.error("Database transaction error:", error)
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
    console.log("Database client released")
  }
}

// Function to close the pool (useful for tests and graceful shutdown)
export async function closePool() {
  if (pool) {
    console.log("Closing database connection pool")
    await pool.end()
    pool = null
    console.log("Database connection pool closed")
  }
}

