// lib/auth.ts
import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  offenderId?: number;
  role: "admin" | "offender";
  createdAt: string;
}

/**
 * Generates a JWT token from a payload
 */
export async function generateToken(payload: TokenPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN || "24h";
  const expiresInNumber = expiresIn.endsWith("h")
    ? parseInt(expiresIn.slice(0, -1), 10) * 3600
    : expiresIn.endsWith("d")
      ? parseInt(expiresIn.slice(0, -1), 10) * 86400
      : parseInt(expiresIn, 10);

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: expiresInNumber },
      (err, token) => {
        if (err) return reject(err);
        resolve(token as string);
      }
    );
  });
}

/**
 * Verifies a token and returns its decoded payload
 */
export async function verifyToken(token?: string): Promise<TokenPayload | null> {
  if (!token) return null;

  try {
    return await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET || "fallback-secret", (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as TokenPayload);
      });
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Admin auth guard
 */
export async function requireAdmin(token?: string): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

/**
 * Offender auth guard with optional ID check
 */
export async function requireOffender(token?: string, offenderId?: number): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "offender") return null;
  if (offenderId && payload.offenderId !== offenderId) return null;
  return payload;
}
