import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);
    
    // Build query based on search parameter
    let sql = `
      SELECT 
        id, 
        inmate_number, 
        last_name, 
        first_name, 
        status, 
        facility, 
        created_at
      FROM offenders
    `;
    
    const queryParams: unknown[] = [];
    
    if (search) {
      sql += `
        WHERE 
          inmate_number ILIKE $1 OR
          last_name ILIKE $1 OR
          first_name ILIKE $1 OR
          facility ILIKE $1
      `;
      queryParams.push(`%${search}%`);
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Execute query to fetch offenders
    const result = await query(sql, queryParams);
    
    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) FROM offenders ${
        search
          ? "WHERE inmate_number ILIKE $1 OR last_name ILIKE $1 OR first_name ILIKE $1 OR facility ILIKE $1"
          : ""
      }`,
      search ? [`%${search}%`] : []
    );
    
    const total: number = Number.parseInt(String(countResult.rows[0].count));
    
    return NextResponse.json({
      offenders: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching offenders:", error);
    return NextResponse.json({ error: "Failed to fetch offenders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const { inmate_number, first_name, last_name, status } = body;
    
    if (!inmate_number || !first_name || !last_name || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Check if offender already exists
    const existingOffender = await query("SELECT id FROM offenders WHERE inmate_number = $1", [inmate_number]);
    
    if ((existingOffender.rowCount ?? 0) > 0) {
      return NextResponse.json({ error: "Offender with this inmate number already exists" }, { status: 409 });
    }
    
    // Insert new offender
    const result = await query(
      `
        INSERT INTO offenders (
          inmate_number, 
          first_name, 
          last_name, 
          middle_name, 
          status, 
          facility, 
          age, 
          height, 
          weight, 
          eye_color, 
          hair, 
          ethnicity, 
          created_at,
          updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id
      `,
      [
        inmate_number,
        first_name,
        last_name,
        body.middle_name || null,
        status,
        body.facility || null,
        body.age || null,
        body.height || null,
        body.weight || null,
        body.eye_color || null,
        body.hair || null,
        body.ethnicity || null,
      ]
    );
    
    const newOffenderId = result.rows[0].id;
    
    // Create notification for new offender registration
    await query(
      `
        INSERT INTO notifications (
          user_id,
          type,
          message,
          read,
          created_at
        )
        VALUES ($1, $2, $3, $4, NOW())
      `,
      [newOffenderId, "new_registration", `New offender registration: ${last_name}, ${first_name} (${inmate_number})`, false]
    );
    
    return NextResponse.json(
      {
        id: newOffenderId,
        message: "Offender created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating offender:", error);
    return NextResponse.json({ error: "Failed to create offender" }, { status: 500 });
  }
}
