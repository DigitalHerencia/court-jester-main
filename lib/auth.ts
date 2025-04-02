import jwt from "jsonwebtoken"

interface TokenPayload {
  id: string
  offenderId?: number
  role: "admin" | "offender"
  createdAt: string
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN || "24h"
  const expiresInNumber = expiresIn.endsWith("h")
    ? Number.parseInt(expiresIn.slice(0, -1), 10) * 3600
    : expiresIn.endsWith("d")
      ? Number.parseInt(expiresIn.slice(0, -1), 10) * 86400
      : Number.parseInt(expiresIn, 10)

  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret", { expiresIn: expiresInNumber }, (err, token) => {
      if (err) return reject(err)
      resolve(token as string)
    })
  })
}

export async function verifyToken(token?: string): Promise<TokenPayload | null> {
  if (!token) return null

  try {
    return await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET || "fallback-secret", (err, decoded) => {
        if (err) return reject(err)
        resolve(decoded as TokenPayload)
      })
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export async function requireAdmin(token?: string): Promise<TokenPayload | null> {
  const payload = await verifyToken(token)
  if (!payload || payload.role !== "admin") return null
  return payload
}

export async function requireOffender(token?: string, offenderId?: number): Promise<TokenPayload | null> {
  const payload = await verifyToken(token)
  if (!payload || payload.role !== "offender") return null

  // If offenderId is provided, ensure the token belongs to that offender
  if (offenderId && payload.offenderId !== offenderId) return null

  return payload
}

