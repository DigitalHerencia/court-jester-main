import { Pool, type PoolClient } from "pg"

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

    // Log pool events
    pool.on("connect", () => {
      console.log("Database client connected")
    })

    pool.on("error", (err) => {
      console.error("Unexpected database error on idle client:", err)
    })
  }

  return pool
}

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

