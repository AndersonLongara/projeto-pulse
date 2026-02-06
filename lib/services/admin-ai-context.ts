/**
 * Admin AI Context Service
 *
 * Fetches company-wide employee data from the database to provide
 * aggregate context for the admin chat AI.
 */

import prisma from "@/lib/prisma";

function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function getAdminAIContextData() {
  // Fetch all active users with their vacation periods and time records
  const users = await prisma.user.findMany({
    where: { ativo: true, role: "USER" },
    include: {
      vacationPeriods: {
        orderBy: { inicioAquisitivo: "desc" },
        take: 1,
      },
      timeRecords: {
        orderBy: { data: "desc" },
        take: 5,
      },
    },
  });

  // Fetch pending vacation requests
  const pendingRequests = await prisma.vacationRequest.findMany({
    where: { status: "PENDENTE" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { nome: true } },
    },
  });

  // Situação breakdown
  const situacaoBreakdown: Record<string, number> = {};
  const departamentoBreakdown: Record<string, number> = {};

  for (const user of users) {
    const sit = user.situacao || "Trabalhando";
    situacaoBreakdown[sit] = (situacaoBreakdown[sit] || 0) + 1;

    const dept = user.departamento || "Sem Departamento";
    departamentoBreakdown[dept] = (departamentoBreakdown[dept] || 0) + 1;
  }

  // Férias próximas do vencimento (within 90 days)
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const feriasVencendo = users
    .filter((u) => {
      const period = u.vacationPeriods[0];
      return period?.dataLimite && period.dataLimite <= in90Days && period.diasSaldo > 0;
    })
    .map((u) => ({
      nome: u.nome,
      departamento: u.departamento || "N/A",
      vencimento: formatDateBR(u.vacationPeriods[0].dataLimite!),
      saldoDias: u.vacationPeriods[0].diasSaldo,
    }));

  // Solicitações pendentes
  const solicitacoesPendentes = pendingRequests.map((r) => ({
    id: r.id,
    colaborador: r.user.nome,
    periodo: `${formatDateBR(r.dataInicio)} a ${formatDateBR(r.dataFim)}`,
    dias: r.diasGozados,
  }));

  // Colaboradores summary
  const colaboradores = users.map((u) => {
    const period = u.vacationPeriods[0];
    const totalBH = u.timeRecords.reduce((acc, r) => acc + r.saldoDia, 0);

    return {
      nome: u.nome,
      cargo: u.cargo || "N/A",
      departamento: u.departamento || "N/A",
      situacao: u.situacao || "Trabalhando",
      saldoFerias: period?.diasSaldo ?? 0,
      bancoHoras: `${totalBH >= 0 ? "+" : ""}${totalBH}h`,
    };
  });

  return {
    totalColaboradores: users.length,
    situacaoBreakdown,
    departamentoBreakdown,
    feriasVencendo,
    solicitacoesPendentes,
    colaboradores,
  };
}
