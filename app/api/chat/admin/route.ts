/**
 * Admin Chat API Route - Pulse Gestão
 *
 * Handles streaming AI responses for admin users with company-wide context.
 * Provides HR expertise, system guidance, and employee data analysis.
 * Persists messages to the database for conversation history.
 */

import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildAdminSystemPrompt, buildAdminContextInjection } from "@/lib/ai/admin-system-prompt";
import { getAdminAIContextData } from "@/lib/services/admin-ai-context";
import { updateAdminChatTitle } from "@/lib/actions/admin-chat";

// ===========================================
// CONFIGURATION
// ===========================================

const openai = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const PULSE_AI_MODEL = "google/gemini-2.5-flash-lite";

// ===========================================
// POST HANDLER
// ===========================================

export async function POST(request: Request) {
  try {
    // 1. Authenticate - must be admin
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return new Response("Unauthorized - Admin access required", { status: 401 });
    }

    const { messages, sessionId } = await request.json();

    // 2. Save user message to DB
    const lastUserMessage = messages[messages.length - 1];
    const getMessageContent = (msg: { content?: string; parts?: Array<{ type: string; text?: string }> }): string => {
      if (msg.content) return msg.content;
      if (msg.parts) {
        return msg.parts
          .filter((p: { type: string; text?: string }) => p.type === "text" && p.text)
          .map((p: { text?: string }) => p.text)
          .join("");
      }
      return "";
    };

    const lastUserContent = getMessageContent(lastUserMessage);

    if (sessionId && lastUserMessage?.role === "user" && lastUserContent) {
      try {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            senderType: "USER",
            senderId: session.id,
            content: lastUserContent,
          },
        });

        // Auto-title from first message
        const msgCount = await prisma.chatMessage.count({ where: { sessionId } });
        if (msgCount === 1) {
          await updateAdminChatTitle(sessionId, lastUserContent);
        }

        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { updatedAt: new Date() },
        });
      } catch (dbError) {
        console.error("[Admin Chat] Failed to save user message:", dbError);
      }
    }

    // 3. Build Context with company-wide data
    const contextData = await getAdminAIContextData();
    const adminContext = buildAdminContextInjection({
      adminName: session.nome,
      ...contextData,
    });

    const systemPrompt = buildAdminSystemPrompt() + adminContext;

    // 4. Stream with AI
    const uiMessages = messages.filter((m: UIMessage) => m.role !== "system") as UIMessage[];
    const modelMessages = await convertToModelMessages(uiMessages);

    const result = streamText({
      model: openai.chat(PULSE_AI_MODEL),
      system: systemPrompt,
      messages: modelMessages,
      onFinish: async ({ text }) => {
        // Save AI response to DB
        if (sessionId && text) {
          try {
            await prisma.chatMessage.create({
              data: {
                sessionId,
                senderType: "AI",
                senderId: null,
                content: text,
              },
            });
          } catch (dbError) {
            console.error("[Admin Chat] Failed to save AI response:", dbError);
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Admin Chat Error]", error);
    return new Response(JSON.stringify({ error: "Erro interno no chat admin" }), { status: 500 });
  }
}
