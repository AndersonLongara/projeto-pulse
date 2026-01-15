/**
 * Authentication Library
 *
 * JWT-based authentication with HttpOnly cookies.
 * Implements Zero Trust security protocols.
 *
 * @see .github/agents/Master.agent.md - Section 3 (Security Protocols)
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { hash, compare } from "bcryptjs";

// ===========================================
// TYPES
// ===========================================

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  nome: string;
  exp?: number;
  iat?: number;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  nome: string;
}

// ===========================================
// CONSTANTS
// ===========================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulse-dev-secret-change-in-production"
);

const COOKIE_NAME = "pulse-auth-token";
const TOKEN_EXPIRY = "7d"; // 7 days

// ===========================================
// PASSWORD HASHING
// ===========================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// ===========================================
// JWT OPERATIONS
// ===========================================

/**
 * Create a signed JWT token
 */
export async function createToken(payload: Omit<JWTPayload, "exp" | "iat">): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ===========================================
// SESSION MANAGEMENT
// ===========================================

/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current session user from cookie
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    nome: payload.nome,
  };
}

/**
 * Get auth token from cookies (for API routes)
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

// ===========================================
// RBAC UTILITIES
// ===========================================

/**
 * Check if user has admin privileges (ADMIN or SUPER_ADMIN)
 */
export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Check if user has super admin privileges
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Check if user can access a specific resource
 */
export function canAccess(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}
