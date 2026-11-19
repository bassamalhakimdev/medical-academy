import { cookies } from "next/headers";
import { getRawSqlite } from "../db";
import { users, sessions } from "../db/schema";
import crypto from "crypto";

const COOKIE_NAME = "med_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  isActive: boolean;
  studentId: string | null;
  phone: string | null;
  groupTag: string | null;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
}

/**
 * Creates a database session and sets an HttpOnly cookie
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const sessionId = generateId();
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  const sqlite = getRawSqlite();
  sqlite
    .prepare("INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(sessionId, userId, token, expiresAt, now);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  return token;
}

/**
 * Retrieves the currently authenticated user from the session cookie
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  let token: string | undefined;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  } catch (error: any) {
    if (error?.digest) throw error;
    return null;
  }

  if (!token) return null;

  try {
    const sqlite = getRawSqlite();
    const now = Date.now();

    const row = sqlite
      .prepare(`
        SELECT 
          u.id, u.name, u.email, u.role, u.is_active, u.student_id, u.phone, u.group_tag,
          s.expires_at
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ? AND s.expires_at > ?
      `)
      .get(token, now) as any;

    if (!row || !row.is_active) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as "admin" | "student",
      isActive: Boolean(row.is_active),
      studentId: row.student_id,
      phone: row.phone,
      groupTag: row.group_tag,
    };
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}

/**
 * Destroys current session and removes cookie
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const sqlite = getRawSqlite();
      sqlite.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    }
    cookieStore.delete(COOKIE_NAME);
  } catch (error) {
    console.error("Error destroying session:", error);
  }
}

/**
 * Require valid authenticated session
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Require student role
 */
export async function requireStudent(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "student") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
