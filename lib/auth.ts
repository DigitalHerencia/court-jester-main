// lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // In production, set via environment variable
const JWT_EXPIRES_IN = "7d";

interface TokenPayload {
  role: "admin" | "offender";
  offenderId?: number;
  newUser?: boolean;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function requireAdmin(token: string | undefined): Promise<TokenPayload | null> {
  if (!token) return null;
  const payload = verifyToken(token);
  return payload && payload.role === "admin" ? payload : null;
}

export async function requireOffender(token: string | undefined): Promise<TokenPayload | null> {
  if (!token) return null;
  const payload = verifyToken(token);
  return payload && payload.role === "offender" ? payload : null;
}
