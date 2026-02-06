
import prisma from "@/lib/prisma";

/**
 * AI Context Service
 * 
 * Fetches real employee data from the database to be used as context for the AI.
 * Updated to fix build error.
 */

function formatDateBR(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export async function getRealAIContextData(userId: string) {
    // Fetch user with latest vacation period AND latest payslip
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            vacationPeriods: {
                orderBy: { inicioAquisitivo: "desc" },
                take: 1,
            },
            payslips: {
                orderBy: { competenciaISO: "desc" },
                take: 1,
                include: {
                    items: true
                }
            },
            timeRecords: {
                orderBy: { data: "desc" },
                take: 5
            },
            benefits: {
                where: { ativo: true }
            }
        },
    });

    if (!user) return null;

    const latestPeriod = user.vacationPeriods[0];
    const latestPayslip = user.payslips[0];

    // Fetch recent vacation requests (approved, pending, rejected)
    const vacationRequests = await prisma.vacationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        aprovadoPor: { select: { nome: true } },
      },
    });

    // Map to context structure expected by buildContextInjection
    const totalBancoHoras = user.timeRecords.reduce((acc, r) => acc + r.saldoDia, 0);
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const diasUteis = Math.round((endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24) * 5 / 7);
    
    return {
        userName: user.nome,
        situacao: user.situacao || undefined,
        cargo: user.cargo || undefined,
        departamento: user.departamento || undefined,
        vacation: latestPeriod ? {
            saldoDias: latestPeriod.diasSaldo,
            diasGozados: latestPeriod.diasGozados,
            proximoVencimento: latestPeriod.dataLimite ? formatDateBR(latestPeriod.dataLimite) : "Não definida",
            periodoAquisitivoInicio: formatDateBR(latestPeriod.inicioAquisitivo),
            periodoAquisitivoFim: formatDateBR(latestPeriod.fimAquisitivo),
            faltas: latestPeriod.faltas,
        } : undefined,
        payroll: latestPayslip ? {
            ultimaCompetencia: latestPayslip.competencia,
            salarioBruto: Number(latestPayslip.salarioBruto),
            salarioLiquido: Number(latestPayslip.salarioLiquido),
            totalDescontos: Number(latestPayslip.totalDescontos),
            dataPagamento: formatDateBR(latestPayslip.dataPagamento),
            descontos: latestPayslip.items
                .filter(item => item.tipo === "DESCONTO")
                .map(item => ({
                    descricao: item.descricao,
                    referencia: item.referencia || "-",
                    valor: Number(item.valor)
                }))
        } : undefined,
        clock: {
            bancoHoras: `${totalBancoHoras >= 0 ? '+' : ''}${totalBancoHoras} horas`,
            statusHoje: user.timeRecords[0] ? "Registrado" : "Sem registro",
            diasTrabalhados: user.timeRecords.length,
            diasUteis: diasUteis
        },
        benefits: user.benefits.map(b => ({
            nome: b.nome,
            valor: Number(b.valor),
            status: b.ativo ? "Ativo" : "Inativo"
        })),
        vacationRequests: vacationRequests.map(r => ({
            id: r.id,
            status: r.status,
            dataInicio: formatDateBR(r.dataInicio),
            dataFim: formatDateBR(r.dataFim),
            diasGozados: r.diasGozados,
            origem: r.origem,
            motivoRecusa: r.motivoRecusa,
            respondidoEm: r.respondidoEm ? formatDateBR(r.respondidoEm) : null,
            aprovadoPor: r.aprovadoPor?.nome || null,
        }))
    };
}
