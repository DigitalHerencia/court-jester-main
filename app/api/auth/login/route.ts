// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signToken } from "@/lib/auth";
import { query } from "@/lib/db";

const loginSchema = z.object({
  credential: z.string().min(1, "Credential is required")
});


async function getOffenderByInmateNumber(inmateNumber: string) {
  const querySQL = {
    text: `SELECT * FROM offenders WHERE inmate_number = $1`,
    values: [inmateNumber],
  };
const { rows } = await query(querySQL.text, querySQL.values);

  return rows[0];
}

async function createOffender(offender: {
  inmateNumber: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  status: string;
  facility?: string;
  age?: number;
  height?: string;
  weight?: number;
  eyeColor?: string;
  hair?: string;
  ethnicity?: string;
  mugshotUrl?: string;
}) {
  const querySQL = {
    text: `INSERT INTO offenders (inmate_number, last_name, first_name, middle_name, status, facility, age, height, weight, eye_color, hair, ethnicity, mugshot_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    values: [
      offender.inmateNumber,
      offender.lastName,
      offender.firstName,
      offender.middleName,
      offender.status,
      offender.facility,
      offender.age,
      offender.height,
      offender.weight,
      offender.eyeColor,
      offender.hair,
      offender.ethnicity,
      offender.mugshotUrl,
    ],
  };
const { rows } = await query(querySQL.text, querySQL.values);

  return rows[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors }, { status: 400 });
    }
    const { credential } = parsed.data;

    // Check if admin
    if (credential === "admin86") {
      const token = signToken({ role: "admin" });
      const response = NextResponse.json({ success: true, role: "admin" });
      response.cookies.set("token", token, { httpOnly: true, path: "/" });
      return response;
    }

    // Otherwise, treat as offender login. Validate inmate number (digits only).
    const inmateNumberSchema = z.string().regex(/^\d+$/, "Invalid inmate number");
    const inmateNumber = inmateNumberSchema.parse(credential);

    // Query database for offender record
    const offender = await getOffenderByInmateNumber(inmateNumber);
    if (!offender) {
      // Create new offender record with pending status
      const newOffender = await createOffender({
          inmateNumber, status: "pending",
          lastName: "",
          firstName: ""
      });
      const token = signToken({ role: "offender", offenderId: newOffender.id, newUser: true });
      const response = NextResponse.json({ success: true, role: "offender", newUser: true });
      response.cookies.set("token", token, { httpOnly: true, path: "/" });
      return response;
    } else {
      // Offender exists; issue token without newUser flag
      const token = signToken({ role: "offender", offenderId: offender.id });
      const response = NextResponse.json({ success: true, role: "offender", offenderId: offender.id });
      response.cookies.set("token", token, { httpOnly: true, path: "/" });
      return response;
    }
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
