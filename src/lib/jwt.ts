import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { AccountRole, AccountStatus } from "@/types/db";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "osteosys_clinical_sonost3000_secure_jwt_secret_2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export const AUTH_COOKIE_NAME = "osteosys_auth_token";
export const REFRESH_COOKIE_NAME = "osteosys_refresh_token";

export interface AuthJWTPayload extends JWTPayload {
  accountId: string;
  email: string;
  fullName: string;
  role: AccountRole;
  status: AccountStatus;
  clinicName?: string;
}

/**
 * Signs a standard JWT access token
 */
export async function signAccessToken(
  payload: Omit<AuthJWTPayload, "iat" | "exp" | "nbf">,
  expiresIn: string = "24h"
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Signs a long-lived refresh token (7 days)
 */
export async function signRefreshToken(
  accountId: string,
  email: string,
  expiresIn: string = "7d"
): Promise<string> {
  return new SignJWT({ accountId, email, type: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and returns its payload
 */
export async function verifyAuthToken(
  token: string
): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthJWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves and verifies current user session from cookies
 */
export async function getSessionUser(): Promise<AuthJWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (!tokenCookie?.value) return null;

    const verified = await verifyAuthToken(tokenCookie.value);
    if (!verified) return null;

    return verified;
  } catch (err) {
    return null;
  }
}
