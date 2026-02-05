/**
 * Página de Férias - SuperApp
 *
 * Interface de gestão completa de férias do colaborador.
 * Features: Balance header com progresso, timeline de períodos, histórico.
 *
 * @see ROADMAP.md - Fase 6
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Umbrella,
  CalendarCheck,
  Clock,
  CaretRight,
  ChatCircleDots,
  CalendarBlank,
  CheckCircle,
  XCircle,
  HourglassSimple,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function formatDateBR(date: Date | string | null | undefined) {
  if (!date) return "Não definida";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateFull(date: Date | string | null | undefined) {
  if (!date) return "Não definida";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getDaysRemaining(endDate: Date | string | null | undefined) {
  if (!endDate) return 999;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// ===========================================
// STATUS CONFIG
// ===========================================

const statusConfig = {
  gozada: {
    label: "Gozada",
    color: "text-emerald-700 bg-emerald-100",
    icon: CheckCircle,
  },
  aprovada: {
    label: "Aprovada",
    color: "text-blue-700 bg-blue-100",
    icon: CheckCircle,
  },
  pendente: {
    label: "Pendente",
    color: "text-amber-700 bg-amber-100",
    icon: HourglassSimple,
  },
  rejeitada: {
    label: "Rejeitada",
    color: "text-rose-700 bg-rose-100",
    icon: XCircle,
  },
  cancelada: {
    label: "Cancelada",
    color: "text-slate-700 bg-slate-100",
    icon: XCircle,
  },
};

// ===========================================
// MAIN COMPONENT
// ===========================================

export default async function FeriasPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch real vacation periods from database
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      vacationPeriods: {
        orderBy: { inicioAquisitivo: "desc" },
      },
    },
  });

  const vacationPeriods = user?.vacationPeriods || [];
  const latestPeriod = vacationPeriods[0];

  if (!latestPeriod) {
    return (
      <div className="p-4 lg:p-6 text-center">
        <p className="text-muted-foreground">Nenhum período de férias encontrado.</p>
      </div>
    );
  }

  // Map database fields to UI expectations
  const diasDisponiveis = latestPeriod.diasSaldo;
  const diasGozadosTotal = vacationPeriods.reduce((acc, p) => acc + p.diasGozados, 0);
  const totalDiasDireito = latestPeriod.diasDireito || 30;

  // For the progress circle, we show the current/latest period
  const diasProgramados = latestPeriod.ultFeriasStatus === "APROVADA" ? latestPeriod.ultFeriasDias : 0;
  const diasGozadosPeriodoAtu = latestPeriod.diasGozados;

  const percentGozado = (diasGozadosPeriodoAtu / totalDiasDireito) * 100;
  const percentProgramado = (diasProgramados / totalDiasDireito) * 100;
  const percentDisponivel = (diasDisponiveis / totalDiasDireito) * 100;

  // Days until next deadline
  const diasAteVencimento = getDaysRemaining(latestPeriod.dataLimite);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground dark:text-slate-50">
          Minhas Férias
        </h1>
        <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
          Gerencie seus dias de descanso
        </p>
      </div>

      {/* Balance Header - Circular Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-100 dark:text-slate-800"
              />
              {/* Gozadas (already taken) */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${percentGozado * 2.64} 264`}
                strokeLinecap="round"
                className="text-slate-400"
              />
              {/* Programadas (scheduled) */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${percentProgramado * 2.64} 264`}
                strokeDashoffset={`-${percentGozado * 2.64}`}
                strokeLinecap="round"
                className="text-blue-500"
              />
              {/* Disponíveis (available) */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${percentDisponivel * 2.64} 264`}
                strokeDashoffset={`-${(percentGozado + percentProgramado) * 2.64}`}
                strokeLinecap="round"
                className="text-emerald-500"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono tabular-nums text-foreground dark:text-slate-50">
                {diasDisponiveis}
              </span>
              <span className="text-xs text-muted-foreground dark:text-slate-400">disponíveis</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground dark:text-slate-400">Disponíveis</span>
              </div>
              <span className="font-mono tabular-nums font-medium dark:text-slate-200">{diasDisponiveis} dias</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground dark:text-slate-400">Programadas</span>
              </div>
              <span className="font-mono tabular-nums font-medium dark:text-slate-200">{diasProgramados} dias</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-sm text-muted-foreground dark:text-slate-400">Gozadas</span>
              </div>
              <span className="font-mono tabular-nums font-medium dark:text-slate-200">{diasGozadosPeriodoAtu} dias</span>
            </div>
          </div>
        </div>

        {/* Vencimento Alert */}
        {diasAteVencimento <= 90 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {diasAteVencimento > 0
                  ? `Vencimento em ${diasAteVencimento} dias`
                  : "Período vencido!"}
              </span>
            </div>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Agende suas férias antes de {formatDateBR(latestPeriod.dataLimite)}
            </p>
          </div>
        )}
      </div>

      {/* Timeline de Períodos */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Períodos
        </h2>

        {/* Período Aquisitivo */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
              <CalendarBlank className="w-5 h-5 text-primary" weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground dark:text-slate-50">Período Aquisitivo</h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  Em andamento
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground dark:text-slate-400">
                {formatDateFull(latestPeriod.inicioAquisitivo)} → {formatDateFull(latestPeriod.fimAquisitivo)}
              </p>
              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((365 - getDaysRemaining(latestPeriod.fimAquisitivo)) / 365) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground dark:text-slate-400">
                  {getDaysRemaining(latestPeriod.fimAquisitivo)} dias restantes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Período Concessivo */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Umbrella className="w-5 h-5 text-slate-500 dark:text-slate-400" weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground dark:text-slate-50">Período Concessivo</h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Próximo
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground dark:text-slate-400">
                {formatDateFull(new Date(latestPeriod.fimAquisitivo.getTime() + 86400000))} → {formatDateFull(latestPeriod.dataLimite)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground dark:text-slate-500">
                Você poderá tirar férias a partir de {formatDateBR(new Date(latestPeriod.fimAquisitivo.getTime() + 86400000))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Histórico
          </h2>
          <span className="text-xs text-muted-foreground">
            Últimos {vacationPeriods.length} registros
          </span>
        </div>

        <div className="space-y-3">
          {vacationPeriods.filter(p => p.ultFeriasInicio).map((p) => {
            const statusStr = (p.ultFeriasStatus || "PENDENTE").toLowerCase() as keyof typeof statusConfig;
            const status = statusConfig[statusStr] || statusConfig.pendente;
            const StatusIcon = status.icon;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", status.color)}>
                      <StatusIcon className="w-4 h-4" weight="bold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums font-medium dark:text-slate-50">
                          {p.ultFeriasDias || p.diasGozados} dias
                        </span>
                        <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", status.color)}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground dark:text-slate-400">
                        {formatDateBR(p.ultFeriasInicio)} → {formatDateBR(p.ultFeriasFim)}
                      </p>
                    </div>
                  </div>
                  <CaretRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Flutuante */}
      <div className="fixed bottom-20 lg:bottom-8 right-4 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-5xl lg:px-6">
        <Link
          href="/chat?context=ferias"
          className={cn(
            "flex items-center gap-3 px-5 py-3.5 rounded-full",
            "bg-primary text-primary-foreground shadow-lg",
            "hover:bg-primary/90 transition-all",
            "lg:max-w-fit lg:mx-auto"
          )}
        >
          <ChatCircleDots className="w-5 h-5" weight="fill" />
          <span className="font-medium">Solicitar Férias</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Spacer for floating CTA */}
      <div className="h-20" />
    </div>
  );
}
