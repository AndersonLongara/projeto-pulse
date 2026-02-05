
import prisma from "@/lib/prisma";

/**
 * AI Context Service
 * 
 * Fetches real employee data from the database to be used as context for the AI.
 */

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

// Map to context structure expected by buildContextInjection
return {
    userName: user.nome,
    vacation: latestPeriod ? {
        saldoDias: latestPeriod.diasSaldo,
        diasGozados: latestPeriod.diasGozados,
        proximoVencimento: latestPeriod.dataLimite ? formatDateBR(latestPeriod.dataLimite) : "Não definida",
        periodoAquisitivoInicio: formatDateBR(latestPeriod.inicioAquisitivo),
        periodoAquisitivoFim: formatDateBR(latestPeriod.fimAquisitivo),
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
    timeTracking: {
        bancoHoras: user.timeRecords.reduce((acc, r) => acc + r.saldoDia, 0),
        saldo: r.saldoDia
    }))
},
    benefits: user.benefits.map(b => ({
        nome: b.nome,
        tipo: b.tipo,
        operadora: b.operadora,
        valor: Number(b.valor),
        coparticipacao: b.coparticipacao
    }))
};
}

function formatDateBR(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}
