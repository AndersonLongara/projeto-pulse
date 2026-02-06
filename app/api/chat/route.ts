/**
 * Chat API Route - Pulse AI
 *
 * Handles streaming AI responses with RAG (context injection).
 * Uses OpenRouter directly for maximum compatibility.
 *
 * Features:
 * - OpenRouter + Gemini integration (direct HTTP)
 * - Real-time streaming with SSE
 * - Context injection with employee data
 * - Human intervention detection
 * - Escape protocol for out-of-scope queries
 *
 * @see .github/agents/Master.agent.md - Section 3 (Zero Trust)
 */

import { z } from "zod";
import { streamText, stepCountIs, convertToModelMessages, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  buildSystemPrompt,
  buildContextInjection,
  shouldTriggerEscape,
} from "@/lib/ai/system-prompt";
import { getRealAIContextData } from "@/lib/services/ai-context";

// ===========================================
// CONFIGURATION
// ===========================================

const openai = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const PULSE_AI_MODEL = "google/gemini-2.5-flash-lite"; // Confirmed OpenRouter ID for Gemini 2.5 Flash Lite

// ===========================================
// ESCAPE RESPONSE
// ===========================================

const ESCAPE_RESPONSE = `Olha, esse assunto é mais complexo e merece uma atenção especial. Vou te passar agora para um dos nossos especialistas humanos para você não ficar com dúvida, beleza? 🙏

_Um especialista vai te atender em breve._`;

// ===========================================
// POST HANDLER
// ===========================================

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const userSession = await getSession();
    if (!userSession) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, sessionId } = await request.json();

    // 2. Validate Session
    if (sessionId) {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { status: true, userId: true },
      });

      if (!chatSession || chatSession.userId !== userSession.id) {
        return new Response("Session not found or forbidden", { status: 403 });
      }

      if (chatSession.status === "HUMAN_INTERVENTION") {
        return new Response(JSON.stringify({ error: "Sessão em atendimento humano" }), { status: 200 });
      }
    }

    // 3. Save User Message
    const lastUserMessage = messages[messages.length - 1];
    
    // Extract text content from message (AI SDK v6 uses parts array)
    const getMessageContent = (msg: { content?: string; parts?: Array<{ type: string; text?: string }> }): string => {
      if (msg.content) return msg.content;
      if (msg.parts) {
        return msg.parts
          .filter((p: { type: string; text?: string }) => p.type === 'text' && p.text)
          .map((p: { text?: string }) => p.text)
          .join('');
      }
      return '';
    };
    
    const lastUserContent = getMessageContent(lastUserMessage);
    console.log(`[Chat] Processing message for session ${sessionId}. User message: ${lastUserContent?.slice(0, 50)}...`);

    if (sessionId && lastUserMessage?.role === "user" && lastUserContent) {
      try {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            senderType: "USER",
            senderId: userSession.id,
            content: lastUserContent,
          },
        });
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { updatedAt: new Date() },
        });
        console.log("[Chat] User message saved to DB");
      } catch (dbError) {
        console.error("[Chat] Failed to save user message:", dbError);
      }
    } else {
      console.warn("[Chat] Skipping user message save. SessionId:", sessionId, "LastRole:", lastUserMessage?.role);
    }

    // 4. Escape Protocol Check
    if (lastUserContent && shouldTriggerEscape(lastUserContent)) {
      if (sessionId) {
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { status: "WAITING_HUMAN" },
        });
      }
      return new Response(ESCAPE_RESPONSE, { headers: { "Content-Type": "text/plain" } });
    }

    // 5. Build Context (RAG)
    const realVacationData = await getRealAIContextData(userSession.id);

    // Fallback for missing data
    const mergedData = {
      userName: userSession.nome,
      ...realVacationData
    };

    const employeeContextSnippet = buildContextInjection(mergedData);
    const systemPrompt = buildSystemPrompt() + employeeContextSnippet;

    // 6. Streaming with Tools
    // Convert UI messages to model messages format (AI SDK v6)
    const uiMessages = messages.filter((m: UIMessage) => m.role !== 'system') as UIMessage[];
    const modelMessages = await convertToModelMessages(uiMessages);
    
    const result = streamText({
      model: openai.chat(PULSE_AI_MODEL),
      system: systemPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(5), // Allow multi-step tool calls
      tools: {
        checkVacationEligibility: {
          description: "Verifica se o colaborador tem saldo e se o período desejado é válido.",
          inputSchema: z.object({
            startDate: z.string().describe("Data de início das férias (YYYY-MM-DD)"),
            days: z.number().describe("Quantidade de dias de férias"),
            sellDays: z.number().optional().describe("Dias de abono pecuniário (vender férias)"),
          }),
          execute: async ({ startDate, days, sellDays }: { startDate: string; days: number; sellDays?: number }) => {
            console.log(`[Tool] Checking eligibility for ${userSession.nome}: ${startDate}, ${days} days`);

            // Fetch latest vacation period
            const user = await prisma.user.findUnique({
              where: { id: userSession.id },
              include: {
                vacationPeriods: { orderBy: { inicioAquisitivo: "desc" }, take: 1 }
              }
            });

            const period = user?.vacationPeriods[0];
            if (!period) return { valid: false, reason: "Período aquisitivo não encontrado." };

            const balance = period.diasSaldo; // In a real app, subtract scheduled but not taken
            // Hard rule: Notice 30 days
            const start = new Date(startDate);
            const today = new Date();
            const diffTime = start.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 30) {
              return {
                valid: false,
                reason: `O pedido deve ser feito com pelo menos 30 dias de antecedência. A data mais próxima seria ${new Date(today.setDate(today.getDate() + 30)).toLocaleDateString('pt-BR')}.`
              };
            }

            // Balance Check
            const totalRequested = days + (sellDays || 0);
            if (totalRequested > balance) {
              return {
                valid: false,
                reason: `Saldo insuficiente. Você tem ${balance} dias, mas pediu ${totalRequested}.`
              };
            }

            // Rule: Min 5 days
            if (days < 5) {
              return { valid: false, reason: "O período mínimo de férias é de 5 dias." };
            }

            return {
              valid: true,
              balance,
              message: `✅ Período válido! Saldo atual: ${balance} dias. Você pediu ${days} dias de férias` + (sellDays ? ` e ${sellDays} de abono.` : ".") + " Posso confirmar o agendamento?"
            };
          },
        },

        createVacationRequest: {
          description: "Cria efetivamente a solicitação de férias no sistema após confirmação.",
          inputSchema: z.object({
            startDate: z.string().describe("Data de início confirmada (YYYY-MM-DD)"),
            days: z.number().describe("Quantidade de dias de férias"),
            sellDays: z.number().optional().describe("Dias de abono pecuniário"),
          }),
          execute: async ({ startDate, days, sellDays }: { startDate: string; days: number; sellDays?: number }) => {
            console.log(`[Tool] Creating request for ${userSession.nome}`);

            // Create in DB
            const request = await prisma.vacationRequest.create({
              data: {
                userId: userSession.id,
                dataInicio: new Date(startDate),
                dataFim: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + days - 1)),
                diasGozados: days,
                diasAbono: sellDays || 0,
                status: "PENDENTE",
                origem: "CHAT_IA",
              }
            });

            return {
              success: true,
              protocol: request.id,
              message: `Solicitação criada com sucesso! Protocolo #${request.id.slice(-6)}. O RH irá analisar.`
            };
          }
        }
      },
      onFinish: async ({ text }) => {
        // Save AI response (final text)
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
            console.log("[Chat] AI response saved to DB");
          } catch (dbError) {
            console.error("[Chat] Failed to save AI response:", dbError);
          }
        }
      },
    });

    // Return the UI Message Stream Response (AI SDK v6 format)
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("[Chat Error]", error);
    return new Response(JSON.stringify({ error: "Erro interno no chat" }), { status: 500 });
  }
}
