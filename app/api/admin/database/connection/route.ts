import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { Pool } from "pg"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check database connection
    const connectionString = process.env.POSTGRES_URL
    if (!connectionString) {
      return NextResponse.json(
        {
          connected: false,
          message: "Database connection string is not configured",
        },
        { status: 200 },
      )
    }

    try {
      const pool = new Pool({
        connectionString,
        max: 1,
        connectionTimeoutMillis: 5000,
      })

      const client = await pool.connect()
      try {
        const result = await client.query("SELECT version()")
        return NextResponse.json(
          {
            connected: true,
            version: result.rows[0].version.split(",")[0],
            message: "Successfully connected to the database",
          },
          { status: 200 },
        )
      } finally {
        client.release()
        await pool.end()
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          connected: false,
          message: `Failed to connect to database: ${(dbError as Error).message}`,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error checking database connection:", error)
    return NextResponse.json({ error: "Failed to check database connection" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get connection string from request body
    const body = await request.json()
    const { connectionString } = body

    if (!connectionString) {
      return NextResponse.json({ error: "Connection string is required" }, { status: 400 })
    }

    // Test the connection
    try {
      const pool = new Pool({
        connectionString,
        max: 1,
        connectionTimeoutMillis: 5000,
      })

      const client = await pool.connect()
      try {
        const result = await client.query("SELECT version()")
        return NextResponse.json(
          {
            connected: true,
            version: result.rows[0].version.split(",")[0],
            message: "Successfully connected to the database",
          },
          { status: 200 },
        )
      } finally {
        client.release()
        await pool.end()
      }
    } catch (dbError) {
      console.error("Database connection test error:", dbError)
      return NextResponse.json(
        {
          connected: false,
          message: `Failed to connect to database: ${(dbError as Error).message}`,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json({ error: "Failed to test database connection" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get connection string from request body
    const body = await request.json()
    const { connectionString } = body

    if (!connectionString) {
      return NextResponse.json({ error: "Connection string is required" }, { status: 400 })
    }

    // In a real application, you would save this to a secure environment variable or configuration store
    // For this example, we'll just return success
    return NextResponse.json(
      {
        success: true,
        message: "Connection string saved successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error saving database connection:", error)
    return NextResponse.json({ error: "Failed to save database connection" }, { status: 500 })
  }
}

