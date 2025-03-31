import jwt from "jsonwebtoken"

export interface TokenPayload {
  role: "admin" | "offender"
  offenderId?: number
  createdAt: string
  id: string
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

  return new Promise((resolve) => {
    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret", (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err)
        return resolve(null)
      }
      resolve(decoded as TokenPayload)
    })
  })
}

export async function requireAdmin(token?: string): Promise<TokenPayload | null> {
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload || payload.role !== "admin") {
    return null
  }

  return payload
}

export async function requireOffender(token?: string, offenderId?: number): Promise<TokenPayload | null> {
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload || payload.role !== "offender" || (offenderId && payload.offenderId !== offenderId)) {
    return null
  }

  return payload
}

