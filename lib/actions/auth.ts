/**
 * Authentication Actions
 *
 * Server Actions for login, logout and session management.
 * Uses Zod validation for all inputs.
 *
 * @see .github/agents/Master.agent.md - Section 3 (Zero Trust)
 */

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  verifyPassword,
  createToken,
  setAuthCookie,
  clearAuthCookie,
  getSession,
  isAdmin,
  type UserRole,
} from "@/lib/auth";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// ===========================================
// ACTIONS
// ===========================================

export type LoginState = {
  error?: string;
  success?: boolean;
};

/**
 * Login action - authenticates user and sets session cookie
 */
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // Validate input
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { email, password } = validatedFields.data;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.ativo) {
      return { error: "Credenciais inválidas" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Credenciais inválidas" };
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      nome: user.nome,
    });

    // Set auth cookie
    await setAuthCookie(token);

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Erro interno. Tente novamente." };
  }
}

/**
 * Logout action - clears session cookie
 */
export async function logout(): Promise<void> {
  await clearAuthCookie();
  redirect("/login");
}

/**
 * Get redirect path based on user role
 */
export async function getRedirectPath(): Promise<string> {
  const session = await getSession();

  if (!session) return "/login";

  return isAdmin(session.role) ? "/dashboard" : "/chat";
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Require admin role - redirect to chat if not admin
 */
export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isAdmin(session.role)) {
    redirect("/chat");
  }

  return session;
}
