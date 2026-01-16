/**
 * Ponto Page - Time Tracking & Clock Events
 *
 * Employee time tracking with clock events, daily records,
 * and overtime balance (banco de horas).
 */

import Link from "next/link";
import {
  Clock,
  CalendarBlank,
  ArrowCircleUp,
  ArrowCircleDown,
  Timer,
  TrendUp,
  TrendDown,
  CheckCircle,
  XCircle,
  Warning,
  Coffee,
} from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth";
import { getClockEvents } from "@/lib/services/senior-mock";

// Format minutes to hours string
function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  const sign = minutes >= 0 ? "+" : "-";
  return `${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// Card component with layered shadows
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { icon: React.ElementType; color: string; label: string }
  > = {
    normal: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30", label: "Normal" },
    falta: { icon: XCircle, color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30", label: "Falta" },
    atestado: { icon: Warning, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30", label: "Atestado" },
    ferias: { icon: Coffee, color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30", label: "Férias" },
    folga: { icon: Coffee, color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30", label: "Folga" },
    feriado: { icon: Coffee, color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30", label: "Feriado" },
    incompleto: { icon: Warning, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30", label: "Incompleto" },
  };

  const config = statusConfig[status] || statusConfig.normal;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" weight="fill" />
      <span>{config.label}</span>
    </div>
  );
}

export default async function PontoPage() {
  const session = await getSession();
  const clockData = await getClockEvents("emp-001");

  const bancoHoras = clockData?.bancoHoras || 0;
  const resumoMes = clockData?.resumoMes;
  const registros = clockData?.registros || [];

  // Get today's record
  const hoje = new Date().toISOString().split("T")[0];
  const registroHoje = registros.find((r) => r.data === hoje);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground dark:text-slate-50">
          Ponto Eletrônico
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-slate-400">
          Registro de frequência e banco de horas
        </p>
      </div>

      {/* Banco de Horas Card */}
      <Card className={`${bancoHoras >= 0 ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/50" : "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-900/10 border-rose-200/50 dark:border-rose-800/50"}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bancoHoras >= 0 ? "bg-emerald-200/50 dark:bg-emerald-800/50" : "bg-rose-200/50 dark:bg-rose-800/50"}`}>
            <Timer className={`w-5 h-5 ${bancoHoras >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`} weight="duotone" />
          </div>
          <div>
            <p className={`text-sm ${bancoHoras >= 0 ? "text-emerald-700/80 dark:text-emerald-400/80" : "text-rose-700/80 dark:text-rose-400/80"}`}>
              Banco de Horas
            </p>
            <p className={`text-2xl font-semibold font-mono tabular-nums ${bancoHoras >= 0 ? "text-emerald-900 dark:text-emerald-200" : "text-rose-900 dark:text-rose-200"}`}>
              {formatMinutesToHours(bancoHoras)}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 text-xs ${bancoHoras >= 0 ? "text-emerald-700/70" : "text-rose-700/70"}`}>
          {bancoHoras >= 0 ? (
            <TrendUp className="w-4 h-4" />
          ) : (
            <TrendDown className="w-4 h-4" />
          )}
          <span>
            {bancoHoras >= 0
              ? "Você tem horas para compensar ou vender"
              : "Você precisa compensar horas devidas"}
          </span>
        </div>
      </Card>

      {/* Today's Record */}
      {registroHoje && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" weight="duotone" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Hoje</p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
            <StatusBadge status={registroHoje.status} />
          </div>

          {/* Clock Events */}
          <div className="flex items-center gap-4 flex-wrap">
            {registroHoje.eventos.map((evento, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {evento.tipo === "entrada" ? (
                  <ArrowCircleUp className="w-5 h-5 text-emerald-600" weight="duotone" />
                ) : (
                  <ArrowCircleDown className="w-5 h-5 text-rose-600" weight="duotone" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">
                    {evento.tipo === "entrada" ? "Entrada" : "Saída"}
                  </p>
                  <p className="text-sm font-semibold font-mono tabular-nums text-foreground">
                    {evento.horario}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Horas Trabalhadas</p>
              <p className="text-sm font-semibold font-mono tabular-nums text-foreground dark:text-slate-50">
                {registroHoje._display.trabalhadas}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground dark:text-slate-400">Saldo do Dia</p>
              <p className={`text-sm font-semibold font-mono tabular-nums ${registroHoje.saldo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {registroHoje._display.saldo}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Monthly Summary */}
      {resumoMes && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <CalendarBlank className="w-5 h-5 text-slate-600 dark:text-slate-400" weight="duotone" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground dark:text-slate-50">
                Resumo {resumoMes.competencia}
              </p>
              <p className="text-xs text-muted-foreground">
                {resumoMes.diasTrabalhados} de {resumoMes.diasUteis} dias úteis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Horas Trabalhadas</p>
              <p className="text-sm font-semibold font-mono tabular-nums text-foreground dark:text-slate-50">
                {Math.floor(resumoMes.horasTrabalhadas / 60)}h
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Horas Extras</p>
              <p className="text-sm font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                +{Math.floor(resumoMes.horasExtras / 60)}h
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Faltas</p>
              <p className="text-sm font-semibold font-mono tabular-nums text-foreground dark:text-slate-50">
                {resumoMes.faltas}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Atrasos</p>
              <p className="text-sm font-semibold font-mono tabular-nums text-foreground dark:text-slate-50">
                {resumoMes.atrasos}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Records List */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Últimos Registros
        </h2>
        <div className="space-y-2">
          {registros.slice(0, 7).map((registro) => (
            <Card key={registro.id} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[48px]">
                    <p className="text-lg font-semibold font-mono tabular-nums text-foreground dark:text-slate-50">
                      {new Date(registro.data).getDate()}
                    </p>
                    <p className="text-[10px] uppercase text-muted-foreground dark:text-slate-400">
                      {new Date(registro.data).toLocaleDateString("pt-BR", {
                        weekday: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {registro.eventos.map((evento, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono tabular-nums text-muted-foreground dark:text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded"
                      >
                        {evento.horario}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-semibold font-mono tabular-nums ${registro.saldo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {registro._display.saldo}
                    </p>
                  </div>
                  <StatusBadge status={registro.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA to Chat */}
      <Card className="border-dashed">
        <Link
          href="/chat?context=ponto"
          className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <span>Precisa ajustar algum registro?</span>
          <span className="text-primary font-medium">Fale com a IA →</span>
        </Link>
      </Card>
    </div>
  );
}
