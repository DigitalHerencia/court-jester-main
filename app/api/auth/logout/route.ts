import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Create a response with a success message.
  const response = NextResponse.json({ success: true });

  // Clear the token cookie by setting an empty value and maxAge of 0.
  response.cookies.set("token", "", { maxAge: 0, path: "/" });

  return response;
}
