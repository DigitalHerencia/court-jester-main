import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"

export async function POST(_request: NextRequest) {
  try {
    // Add email and phone columns if they don't exist
    await query(`
      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE offenders 
          ADD COLUMN email VARCHAR(255),
          ADD COLUMN phone VARCHAR(50);
        EXCEPTION
          WHEN duplicate_column THEN 
            NULL;
        END;
      END $$;
    `)

    return NextResponse.json({ message: "Migration completed successfully" })
  } catch (error) {
    console.error("Migration failed:", error)
    return NextResponse.json({ error: "Migration failed" }, { status: 500 })
  }
}