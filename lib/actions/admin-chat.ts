/**
 * Admin Chat Actions
 *
 * Server Actions for admin chat session management.
 * Handles creating sessions, listing history, loading messages,
 * and deleting sessions.
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// ===========================================
// TYPES
// ===========================================

export type AdminChatSession = {
  id: string;
  titulo: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    messages: number;
  };
};

export type AdminChatMessage = {
  id: string;
  sessionId: string;
  senderType: string;
  content: string;
  createdAt: Date;
};

// ===========================================
// SESSION ACTIONS
// ===========================================

/**
 * Create a new admin chat session
 */
export async function createAdminChatSession(): Promise<string | null> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return null;

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: session.id,
      tipo: "ADMIN_CHAT",
      status: "ACTIVE_IA",
      titulo: null,
    },
  });

  revalidatePath("/admin-chat");
  return chatSession.id;
}

/**
 * List all admin chat sessions for the current admin
 */
export async function getAdminChatSessions(): Promise<AdminChatSession[]> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return [];

  const sessions = await prisma.chatSession.findMany({
    where: {
      userId: session.id,
      tipo: "ADMIN_CHAT",
    },
    select: {
      id: true,
      titulo: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return sessions;
}

/**
 * Get messages for a specific admin chat session
 */
export async function getAdminChatMessages(sessionId: string): Promise<AdminChatMessage[]> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return [];

  // Verify session belongs to this admin
  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { userId: true, tipo: true },
  });

  if (!chatSession || chatSession.userId !== session.id || chatSession.tipo !== "ADMIN_CHAT") {
    return [];
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    select: {
      id: true,
      sessionId: true,
      senderType: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

/**
 * Delete an admin chat session and all its messages
 */
export async function deleteAdminChatSession(sessionId: string): Promise<{ success: boolean }> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return { success: false };

  // Verify ownership
  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { userId: true, tipo: true },
  });

  if (!chatSession || chatSession.userId !== session.id || chatSession.tipo !== "ADMIN_CHAT") {
    return { success: false };
  }

  await prisma.chatSession.delete({ where: { id: sessionId } });

  revalidatePath("/admin-chat");
  return { success: true };
}

/**
 * Update session title (auto-generated from first message)
 */
export async function updateAdminChatTitle(
  sessionId: string,
  title: string
): Promise<void> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return;

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      titulo: title.slice(0, 60) + (title.length > 60 ? "..." : ""),
      updatedAt: new Date(),
    },
  });
}
