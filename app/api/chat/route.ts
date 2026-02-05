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
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  buildSystemPrompt,
  buildContextInjection,
  shouldTriggerEscape,
} from "@/lib/ai/system-prompt";
import {
  getVacationData,
  getPayslips,
  getClockEvents,
  getBenefits,
} from "@/lib/services/senior-mock";
import { getRealAIContextData } from "@/lib/services/ai-context";

// ===========================================
// CONFIGURATION
// ===========================================

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const PULSE_AI_MODEL = "google/gemini-2.5-flash-lite";

// ===========================================
// VALIDATION SCHEMA
// ===========================================

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  sessionId: z.string().optional(),
});

// ===========================================
// ESCAPE RESPONSE
// ===========================================

const ESCAPE_RESPONSE = `Olha, esse assunto é mais complexo e merece uma atenção especial. Vou te passar agora para um dos nossos especialistas humanos para você não ficar com dúvida, beleza? 🙏

_Um especialista vai te atender em breve._`;

// ===========================================
// HELPER: Format date to Brazilian format
// ===========================================

function formatDateBR(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ===========================================
// HELPER: Fetch employee context for RAG
// ===========================================

async function fetchEmployeeContext(userId: string, userName: string) {
  // Fetch all data in parallel for performance
  const [vacationData, payslipData, clockData, benefitsData] = await Promise.all([
    getVacationData(userId),
    getPayslips(userId),
    getClockEvents(userId),
    getBenefits(userId),
  ]);

  // Build context object
  const contextData: Parameters<typeof buildContextInjection>[0] = {
    userName,
  };

  if (vacationData) {
    contextData.vacation = {
      saldoDias: vacationData.saldoDias,
      diasGozados: vacationData.diasGozados,
      proximoVencimento: formatDateBR(vacationData.proximoVencimento),
      periodoAquisitivoInicio: formatDateBR(vacationData.periodoAquisitivo.inicio),
      periodoAquisitivoFim: formatDateBR(vacationData.periodoAquisitivo.fim),
    };
  }

  if (payslipData && payslipData.holerites.length > 0) {
    const ultimoHolerite = payslipData.holerites[0];
    contextData.payroll = {
      ultimaCompetencia: ultimoHolerite.competencia,
      salarioBruto: ultimoHolerite.salarioBruto,
      salarioLiquido: ultimoHolerite.salarioLiquido,
      totalDescontos: ultimoHolerite.totalDescontos,
      dataPagamento: formatDateBR(ultimoHolerite.dataPagamento),
      descontos: ultimoHolerite.descontos.map((d) => ({
        descricao: d.descricao,
        referencia: d.referencia,
        valor: d.valor,
      })),
    };
  }

  if (clockData) {
    contextData.clock = {
      bancoHoras: clockData._meta.bancoHorasLabel.short,
      statusHoje: clockData._meta.statusHoje.long,
      diasTrabalhados: clockData.resumoMes.diasTrabalhados,
      diasUteis: clockData.resumoMes.diasUteis,
    };
  }

  if (benefitsData) {
    contextData.benefits = benefitsData.beneficios
      .filter((b) => b.ativo)
      .map((b) => ({
        nome: b.nome,
        valor: b.valor,
        status: b._display.status,
      }));
  }

  return buildContextInjection(contextData);
}

// ===========================================
// POST HANDLER
// ===========================================

export async function POST(request: Request) {
  try {
    // 1. Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key não configurada" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Authenticate user
    const userSession = await getSession();
    if (!userSession) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const validated = chatRequestSchema.safeParse(body);

    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos", details: validated.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, sessionId } = validated.data;

    // 4. Check if session exists and its status
    if (sessionId) {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { status: true, userId: true },
      });

      if (!chatSession) {
        return new Response(
          JSON.stringify({ error: "Sessão não encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Verify ownership
      if (chatSession.userId !== userSession.id) {
        return new Response(
          JSON.stringify({ error: "Acesso negado" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // If session is under human intervention, don't process AI
      if (chatSession.status === "HUMAN_INTERVENTION") {
        return new Response(
          JSON.stringify({
            error: "Sessão em atendimento humano",
            status: "HUMAN_INTERVENTION",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 5. Get last user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();

    if (sessionId && lastUserMessage) {
      // Save user message to database
      await prisma.chatMessage.create({
        data: {
          sessionId,
          senderType: "USER",
          senderId: userSession.id,
          content: lastUserMessage.content,
        },
      });

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    }

    // 6. Check for escape triggers
    if (lastUserMessage && shouldTriggerEscape(lastUserMessage.content)) {
      // Update session to waiting for human
      if (sessionId) {
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { status: "WAITING_HUMAN" },
        });
      }

      // Return escape response as plain text (non-streaming)
      return new Response(ESCAPE_RESPONSE, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 7. Fetch employee context for RAG (Hybrid: Real Database + Mock Fallback)
    const realVacationData = await getRealAIContextData(userSession.id);

    // Fetch mock data (will be used for payroll/benefits/clock which aren't in DB yet)
    const mockId = "emp-001";
    const [payslipData, clockData, benefitsData] = await Promise.all([
      getPayslips(mockId),
      getClockEvents(mockId),
      getBenefits(mockId),
    ]);

    // Build merged context object
    const mergedData: Parameters<typeof buildContextInjection>[0] = {
      userName: userSession.nome,
    };

    // Use REAL vacation data if available
    if (realVacationData?.vacation) {
      mergedData.vacation = realVacationData.vacation;
    }

    // Still using MOCK for these (not migratred to DB yet)
    if (payslipData && payslipData.holerites.length > 0) {
      const ultimoHolerite = payslipData.holerites[0];
      mergedData.payroll = {
        ultimaCompetencia: ultimoHolerite.competencia,
        salarioBruto: ultimoHolerite.salarioBruto,
        salarioLiquido: ultimoHolerite.salarioLiquido,
        totalDescontos: ultimoHolerite.totalDescontos,
        dataPagamento: formatDateBR(ultimoHolerite.dataPagamento),
        descontos: ultimoHolerite.descontos.map((d) => ({
          descricao: d.descricao,
          referencia: d.referencia,
          valor: d.valor,
        })),
      };
    }

    if (clockData) {
      mergedData.clock = {
        bancoHoras: clockData._meta.bancoHorasLabel.short,
        statusHoje: clockData._meta.statusHoje.long,
        diasTrabalhados: clockData.resumoMes.diasTrabalhados,
        diasUteis: clockData.resumoMes.diasUteis,
      };
    }

    if (benefitsData) {
      mergedData.benefits = benefitsData.beneficios
        .filter((b) => b.ativo)
        .map((b) => ({
          nome: b.nome,
          valor: b.valor,
          status: b._display.status,
        }));
    }

    // 8. Build system prompt with combined context snippet
    const employeeContextSnippet = buildContextInjection(mergedData);
    const systemPrompt = buildSystemPrompt() + employeeContextSnippet;

    // 9. Prepare messages for OpenRouter (OpenAI format)
    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // 10. Call OpenRouter API with streaming
    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Pulse IA - HR Assistant",
      },
      body: JSON.stringify({
        model: PULSE_AI_MODEL,
        messages: openRouterMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("[OpenRouter Error]", errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar IA" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 11. Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openRouterResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") {
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;

                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Ignore parsing errors for incomplete chunks
                }
              }
            }
          }

          // Save AI response to database after streaming completes
          if (sessionId && fullResponse) {
            await prisma.chatMessage.create({
              data: {
                sessionId,
                senderType: "AI",
                senderId: null,
                content: fullResponse,
              },
            });
          }

          controller.close();
        } catch (error) {
          console.error("[Stream Error]", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("[Chat API Error]", error);

    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
