"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const approveSchema = z.object({
  requestId: z.string().cuid(),
  observacoes: z.string().optional(),
});

const rejectSchema = z.object({
  requestId: z.string().cuid(),
  motivoRecusa: z.string().min(10, "A justificativa deve ter pelo menos 10 caracteres."),
});

// ===========================================
// APPROVE REQUEST
// ===========================================

export async function approveVacationRequest(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return { error: "Não autorizado." };
  }

  const parsed = approveSchema.safeParse({
    requestId: formData.get("requestId"),
    observacoes: formData.get("observacoes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados inválidos." };
  }

  const { requestId, observacoes } = parsed.data;

  const request = await prisma.vacationRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) return { error: "Solicitação não encontrada." };
  if (request.status !== "PENDENTE") return { error: "Solicitação já foi processada." };

  await prisma.vacationRequest.update({
    where: { id: requestId },
    data: {
      status: "APROVADO",
      aprovadoPorId: session.id,
      respondidoEm: new Date(),
      observacoes: observacoes || request.observacoes,
    },
  });

  revalidatePath("/requests");
  return { success: true };
}

// ===========================================
// REJECT REQUEST
// ===========================================

export async function rejectVacationRequest(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return { error: "Não autorizado." };
  }

  const parsed = rejectSchema.safeParse({
    requestId: formData.get("requestId"),
    motivoRecusa: formData.get("motivoRecusa"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados inválidos." };
  }

  const { requestId, motivoRecusa } = parsed.data;

  const request = await prisma.vacationRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) return { error: "Solicitação não encontrada." };
  if (request.status !== "PENDENTE") return { error: "Solicitação já foi processada." };

  await prisma.vacationRequest.update({
    where: { id: requestId },
    data: {
      status: "REJEITADO",
      motivoRecusa,
      aprovadoPorId: session.id,
      respondidoEm: new Date(),
    },
  });

  revalidatePath("/requests");
  return { success: true };
}
