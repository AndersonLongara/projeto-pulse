/**
 * User Management Actions
 *
 * Server Actions for creating, updating and managing users.
 * Only accessible by ADMIN and SUPER_ADMIN roles.
 *
 * @see .github/agents/Master.agent.md - Section 3 (Zero Trust)
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword, getSession, isAdmin } from "@/lib/auth";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const createUserSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"], {
    message: "Tipo de usuário inválido",
  }),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
});

const updateUserSchema = z.object({
  id: z.string(),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  ativo: z.boolean(),
});

// ===========================================
// TYPES
// ===========================================

export type UserActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// ===========================================
// ACTIONS
// ===========================================

/**
 * Get all users (for admin listing)
 */
export async function getUsers() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        role: true,
        cargo: true,
        departamento: true,
        ativo: true,
        createdAt: true,
        situacao: true,
        vacationPeriods: {
          orderBy: { inicioAquisitivo: "desc" },
          take: 1,
          select: {
            diasSaldo: true,
            dataLimite: true,
          },
        },
        _count: {
          select: {
            chatSessions: true,
          },
        },
      },
      orderBy: { nome: "asc" },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Get detailed user information including all vacation periods
 */
export async function getUserDetails(userId: string) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vacationPeriods: {
          orderBy: { inicioAquisitivo: "desc" },
        },
        _count: {
          select: {
            chatSessions: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}
export async function createUser(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { error: "Acesso não autorizado" };
  }

  // Only SUPER_ADMIN can create other admins
  const targetRole = formData.get("role") as string;
  if (
    (targetRole === "ADMIN" || targetRole === "SUPER_ADMIN") &&
    session.role !== "SUPER_ADMIN"
  ) {
    return { error: "Apenas Super Admin pode criar administradores" };
  }

  const validatedFields = createUserSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    matricula: formData.get("matricula"),
    password: formData.get("password"),
    role: formData.get("role"),
    cargo: formData.get("cargo") || undefined,
    departamento: formData.get("departamento") || undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const data = validatedFields.data;

  try {
    // Check if email or matricula already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          { matricula: data.matricula },
        ],
      },
    });

    if (existing) {
      if (existing.email === data.email.toLowerCase()) {
        return { error: "Este email já está em uso" };
      }
      return { error: "Esta matrícula já está em uso" };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email.toLowerCase(),
        matricula: data.matricula,
        passwordHash,
        role: data.role,
        cargo: data.cargo,
        departamento: data.departamento,
      },
    });

    revalidatePath("/users");
    return { success: true, message: "Usuário criado com sucesso!" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Erro ao criar usuário. Tente novamente." };
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { error: "Acesso não autorizado" };
  }

  const targetRole = formData.get("role") as string;
  if (
    (targetRole === "ADMIN" || targetRole === "SUPER_ADMIN") &&
    session.role !== "SUPER_ADMIN"
  ) {
    return { error: "Apenas Super Admin pode definir administradores" };
  }

  const validatedFields = updateUserSchema.safeParse({
    id: formData.get("id"),
    nome: formData.get("nome"),
    email: formData.get("email"),
    matricula: formData.get("matricula"),
    role: formData.get("role"),
    cargo: formData.get("cargo") || undefined,
    departamento: formData.get("departamento") || undefined,
    ativo: formData.get("ativo") === "true",
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const data = validatedFields.data;

  try {
    // Check for conflicts with other users
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          { matricula: data.matricula },
        ],
        NOT: { id: data.id },
      },
    });

    if (existing) {
      if (existing.email === data.email.toLowerCase()) {
        return { error: "Este email já está em uso por outro usuário" };
      }
      return { error: "Esta matrícula já está em uso por outro usuário" };
    }

    // Update user
    await prisma.user.update({
      where: { id: data.id },
      data: {
        nome: data.nome,
        email: data.email.toLowerCase(),
        matricula: data.matricula,
        role: data.role,
        cargo: data.cargo,
        departamento: data.departamento,
        ativo: data.ativo,
      },
    });

    revalidatePath("/users");
    return { success: true, message: "Usuário atualizado com sucesso!" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Erro ao atualizar usuário. Tente novamente." };
  }
}

/**
 * Delete a user (soft delete - just deactivate)
 */
export async function deleteUser(userId: string): Promise<UserActionState> {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return { error: "Apenas Super Admin pode excluir usuários" };
  }

  // Prevent self-deletion
  if (userId === session.id) {
    return { error: "Você não pode excluir sua própria conta" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { ativo: false },
    });

    revalidatePath("/users");
    return { success: true, message: "Usuário desativado com sucesso!" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Erro ao desativar usuário. Tente novamente." };
  }
}

/**
 * Reset user password
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<UserActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { error: "Acesso não autorizado" };
  }

  if (newPassword.length < 6) {
    return { error: "Senha deve ter pelo menos 6 caracteres" };
  }

  try {
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true, message: "Senha redefinida com sucesso!" };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Erro ao redefinir senha. Tente novamente." };
  }
}
