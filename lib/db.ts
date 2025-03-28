"use server"

import pg from "pg"
const { Pool } = pg

let pool: pg.Pool | null = null

// Initialize the pool lazily
function getPool() {
  if (!pool) {
    // Check if we have a connection string
    if (!process.env.POSTGRES_URL) {
      console.error("No database connection string provided")
      throw new Error("Database connection not configured")
    }

    // Create a new pool with SSL configuration for Neon
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Neon PostgreSQL
      },
      // Add connection timeout
      connectionTimeoutMillis: 10000,
      // Add idle timeout
      idleTimeoutMillis: 30000,
      // Add max clients
      max: 20,
    })

    // Add error handler to the pool
    pool.on("error", (err: any) => {
      console.error("Unexpected error on idle client", err)
      pool = null // Reset pool on error
    })
  }

  return pool
}

// Helper function to execute SQL queries
export async function query(text: string, params?: any[]) {
  try {
    const pool = getPool()
    const res = await pool.query(text, params)
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

// Check database connection
export async function checkDatabaseConnection() {
  try {
    console.log("Checking database connection...")
    const testResult = await query("SELECT 1 as test")
    console.log("Database connection successful:", testResult.rows[0])
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

// Get database tables
export async function getDatabaseTables() {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    return result.rows.map((row: { table_name: any }) => row.table_name)
  } catch (error) {
    console.error("Error getting database tables:", error)
    return []
  }
}

// Get table row counts
export async function getTableRowCounts() {
  try {
    const tables = await getDatabaseTables()
    const counts: Record<string, number> = {}

    for (const table of tables) {
      const result = await query(`SELECT COUNT(*) FROM ${table}`)
      counts[table] = Number.parseInt(result.rows[0].count)
    }

    return counts
  } catch (error) {
    console.error("Error getting table row counts:", error)
    return {}
  }
}

// Initialize the database with the schema
export async function initializeDatabase() {
  try {
    console.log("Checking database connection...")

    // Test the connection first
    try {
      const testResult = await query("SELECT 1 as test")
      console.log("Database connection successful:", testResult.rows[0])
    } catch (connectionError) {
      console.error("Database connection failed:", connectionError)
      return false
    }

    console.log("Checking if admin user exists...")

    // Check if admin user exists
    const adminCheck = await query("SELECT * FROM users WHERE username = $1", ["admin"])

    if (adminCheck.rowCount === 0) {
      console.log("Creating admin user...")
      // Insert admin user with password 'admin'
      await query("INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)", [
        "admin",
        "$2b$10$X7VYVy1GUERl.Uo/5z.YUOtZY0r5gZ5VnhWK5/5.I5jWXSEFyimYO",
        "admin",
      ])
      console.log("Admin user created")
    } else {
      console.log("Admin user already exists")
    }

    return true
  } catch (error) {
    console.error("Error initializing database", error)
    return false
  }
}

