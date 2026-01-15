/**
 * Chat Actions
 *
 * Server Actions for chat operations.
 * Handles sending messages, creating sessions, and admin interventions.
 *
 * @see .github/agents/Master.agent.md - Section 3 (Zero Trust)
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const sendMessageSchema = z.object({
  sessionId: z.string().optional(),
  content: z.string().min(1).max(2000),
});

// ===========================================
// TYPES
// ===========================================

export type ChatSession = {
  id: string;
  titulo: string | null;
  status: string;
  assignedAdminId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    nome: string;
    cargo: string | null;
    departamento: string | null;
  };
  messages: ChatMessage[];
  _count?: {
    messages: number;
  };
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  senderType: string;
  senderId: string | null;
  content: string;
  createdAt: Date;
  sender?: {
    id: string;
    nome: string;
    role: string;
  } | null;
};

// ===========================================
// USER ACTIONS
// ===========================================

/**
 * Get or create chat session for current user
 */
export async function getOrCreateSession(): Promise<ChatSession | null> {
  const session = await getSession();
  if (!session) return null;

  // Find existing active session
  let chatSession = await prisma.chatSession.findFirst({
    where: {
      userId: session.id,
      status: { in: ["ACTIVE_IA", "HUMAN_INTERVENTION", "WAITING_HUMAN"] },
    },
    include: {
      user: {
        select: { id: true, nome: true, cargo: true, departamento: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, nome: true, role: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Create new session if none exists
  if (!chatSession) {
    chatSession = await prisma.chatSession.create({
      data: {
        userId: session.id,
        status: "ACTIVE_IA",
      },
      include: {
        user: {
          select: { id: true, nome: true, cargo: true, departamento: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, nome: true, role: true },
            },
          },
        },
      },
    });
  }

  return chatSession as ChatSession;
}

/**
 * Send a message in a chat session
 */
export async function sendMessage(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado" };

  const validated = sendMessageSchema.safeParse({
    sessionId: formData.get("sessionId"),
    content: formData.get("content"),
  });

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { sessionId, content } = validated.data;

  try {
    // Get or create session
    let targetSessionId = sessionId;

    if (!targetSessionId) {
      const chatSession = await getOrCreateSession();
      if (!chatSession) return { success: false, error: "Erro ao criar sessão" };
      targetSessionId = chatSession.id;
    }

    // Verify session belongs to user (unless admin)
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: targetSessionId },
    });

    if (!chatSession) {
      return { success: false, error: "Sessão não encontrada" };
    }

    // Non-admin users can only send to their own sessions
    if (!isAdmin(session.role) && chatSession.userId !== session.id) {
      return { success: false, error: "Acesso negado" };
    }

    // Determine sender type based on role and session status
    const senderType = isAdmin(session.role) ? "ADMIN" : "USER";

    // Create the message
    await prisma.chatMessage.create({
      data: {
        sessionId: targetSessionId,
        senderType,
        senderId: session.id,
        content,
      },
    });

    // Update session title if first message
    const messageCount = await prisma.chatMessage.count({
      where: { sessionId: targetSessionId },
    });

    if (messageCount === 1) {
      await prisma.chatSession.update({
        where: { id: targetSessionId },
        data: { titulo: content.slice(0, 50) + (content.length > 50 ? "..." : "") },
      });
    }

    // If session is in ACTIVE_IA and user sent message, generate AI response
    if (chatSession.status === "ACTIVE_IA" && senderType === "USER") {
      // Simulate AI response (will be replaced with real AI later)
      await generateAIResponse(targetSessionId, content);
    }

    revalidatePath("/chat");
    revalidatePath("/chats");

    return { success: true };
  } catch (error) {
    console.error("Send message error:", error);
    return { success: false, error: "Erro ao enviar mensagem" };
  }
}

/**
 * Generate AI response (mock for now)
 */
async function generateAIResponse(sessionId: string, userMessage: string) {
  // Simulate thinking delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock AI responses based on keywords
  let aiResponse = "Olá! Como posso ajudar você hoje? 😊";

  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("férias") || lowerMessage.includes("ferias")) {
    aiResponse =
      "Sobre férias, posso te ajudar com:\n\n" +
      "📅 **Saldo disponível:** Você tem 20 dias de férias disponíveis\n" +
      "📋 **Solicitar férias:** Posso iniciar uma solicitação para você\n" +
      "❓ **Dúvidas:** Responder perguntas sobre o período concessivo\n\n" +
      "O que você gostaria de fazer?";
  } else if (lowerMessage.includes("holerite") || lowerMessage.includes("salário") || lowerMessage.includes("salario")) {
    aiResponse =
      "Sobre seu holerite, posso informar:\n\n" +
      "💰 **Último holerite:** Dezembro/2025\n" +
      "📊 **Salário líquido:** R$ 5.432,10\n" +
      "📥 **Download:** Posso enviar o PDF do seu holerite\n\n" +
      "Qual informação você precisa?";
  } else if (lowerMessage.includes("ponto") || lowerMessage.includes("hora")) {
    aiResponse =
      "Sobre seu ponto eletrônico:\n\n" +
      "⏰ **Banco de horas:** +02:30\n" +
      "📆 **Dias trabalhados (mês):** 15 de 22\n" +
      "✅ **Status hoje:** Em andamento\n\n" +
      "Precisa de mais detalhes?";
  } else if (lowerMessage.includes("benefício") || lowerMessage.includes("beneficio") || lowerMessage.includes("vr") || lowerMessage.includes("vt")) {
    aiResponse =
      "Seus benefícios ativos:\n\n" +
      "🍽️ **Vale Refeição:** R$ 726,00/mês\n" +
      "🚌 **Vale Transporte:** R$ 510,00/mês\n" +
      "🏥 **Plano de Saúde:** Unimed Executivo\n" +
      "🦷 **Plano Odonto:** Odontoprev\n\n" +
      "Posso detalhar algum benefício?";
  } else if (lowerMessage.includes("oi") || lowerMessage.includes("olá") || lowerMessage.includes("ola")) {
    aiResponse =
      "Olá! 👋 Sou a assistente virtual da Pulse.\n\n" +
      "Posso te ajudar com:\n" +
      "• 📅 Férias e folgas\n" +
      "• 💰 Holerites e pagamentos\n" +
      "• ⏰ Ponto eletrônico\n" +
      "• 🎁 Benefícios\n\n" +
      "Como posso ajudar?";
  }

  await prisma.chatMessage.create({
    data: {
      sessionId,
      senderType: "AI",
      senderId: null,
      content: aiResponse,
    },
  });
}

// ===========================================
// ADMIN ACTIONS
// ===========================================

/**
 * Get all active chat sessions (Admin only)
 */
export async function getActiveSessions(): Promise<ChatSession[]> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return [];

  const sessions = await prisma.chatSession.findMany({
    where: {
      status: { in: ["ACTIVE_IA", "HUMAN_INTERVENTION", "WAITING_HUMAN"] },
    },
    include: {
      user: {
        select: { id: true, nome: true, cargo: true, departamento: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: { id: true, nome: true, role: true },
          },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return sessions as ChatSession[];
}

/**
 * Get a specific chat session with all messages (Admin only)
 */
export async function getSessionById(sessionId: string): Promise<ChatSession | null> {
  const session = await getSession();
  if (!session) return null;

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: { id: true, nome: true, cargo: true, departamento: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, nome: true, role: true },
          },
        },
      },
    },
  });

  if (!chatSession) return null;

  // Non-admin users can only see their own sessions
  if (!isAdmin(session.role) && chatSession.userId !== session.id) {
    return null;
  }

  return chatSession as ChatSession;
}

/**
 * Take over a chat session (Admin intervention)
 */
export async function takeOverSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: "Acesso negado" };
  }

  try {
    // Update session status
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "HUMAN_INTERVENTION",
        assignedAdminId: session.id,
      },
    });

    // Add system message about intervention
    await prisma.chatMessage.create({
      data: {
        sessionId,
        senderType: "ADMIN",
        senderId: session.id,
        content: `🔔 **${session.nome}** assumiu o atendimento. Olá! Estou aqui para ajudar diretamente.`,
      },
    });

    // Log the intervention
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "INTERVENTION_START",
        resource: "ChatSession",
        resourceId: sessionId,
      },
    });

    revalidatePath("/chat");
    revalidatePath("/chats");
    revalidatePath(`/chats/${sessionId}`);

    return { success: true };
  } catch (error) {
    console.error("Take over error:", error);
    return { success: false, error: "Erro ao assumir conversa" };
  }
}

/**
 * Release a chat session back to AI
 */
export async function releaseSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: "Acesso negado" };
  }

  try {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "ACTIVE_IA",
        assignedAdminId: null,
      },
    });

    await prisma.chatMessage.create({
      data: {
        sessionId,
        senderType: "AI",
        senderId: null,
        content: "O atendimento foi transferido de volta para mim. Como posso continuar ajudando? 😊",
      },
    });

    revalidatePath("/chat");
    revalidatePath("/chats");

    return { success: true };
  } catch (error) {
    console.error("Release error:", error);
    return { success: false, error: "Erro ao liberar conversa" };
  }
}

/**
 * Close a chat session
 */
export async function closeSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado" };

  try {
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!chatSession) {
      return { success: false, error: "Sessão não encontrada" };
    }

    // Only owner or admin can close
    if (!isAdmin(session.role) && chatSession.userId !== session.id) {
      return { success: false, error: "Acesso negado" };
    }

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status: "CLOSED" },
    });

    revalidatePath("/chat");
    revalidatePath("/chats");

    return { success: true };
  } catch (error) {
    console.error("Close error:", error);
    return { success: false, error: "Erro ao encerrar conversa" };
  }
}
