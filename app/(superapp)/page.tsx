/**
 * SuperApp Home Page
 *
 * Main entry point for the employee-facing SuperApp.
 * Dashboard with quick access cards and real-time employee data.
 */

import Link from "next/link";
import {
  Umbrella,
  Money,
  Clock,
  Heart,
  ChatCircleDots,
  CaretRight,
  CalendarCheck,
  ArrowRight,
  GraduationCap,
  Star,
  Warning,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getPayslips,
  getClockEvents,
  getBenefits,
  getUpcomingEvents,
} from "@/lib/services/senior-mock";
import type { UpcomingEvent, EventType } from "@/lib/services/senior-mock";
import { MoneyDisplay } from "@/components/ui/money-display";

// Card container with standardized styles
function DashboardCard({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const baseClasses =
    "bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10 transition-all";
  const interactiveClasses = href
    ? "hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),_0_6px_12px_rgba(0,0,0,0.04)] hover:border-slate-200 dark:hover:border-white/20"
    : "";

  if (href) {
    return (
      <Link href={href} className={`block ${baseClasses} ${interactiveClasses} ${className}`}>
        {children}
      </Link>
    );
  }

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
}

// Quick action button
function QuickAction({
  icon: Icon,
  label,
  href,
  color = "primary",
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  color?: "primary" | "emerald" | "amber" | "rose";
}) {
  const colorClasses = {
    primary: "bg-primary/10 dark:bg-primary/20 text-primary",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  };

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-w-[72px]"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" weight="duotone" />
      </div>
      <span className="text-xs font-medium text-muted-foreground dark:text-slate-400 text-center">
        {label}
      </span>
    </Link>
  );
}

export default async function SuperAppHomePage() {
  // Fetch user session and data
  const session = await getSession();
  const userName = session?.nome?.split(" ")[0] || "Colaborador";

  // Fetch user with real data from Prisma
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      vacationPeriods: {
        orderBy: { inicioAquisitivo: "desc" },
        take: 1,
      },
      _count: {
        select: { vacationPeriods: true }
      }
    }
  });

  const latestVacation = user?.vacationPeriods[0];

  // Fetch remaining data from mocks for now (passing real userId)
  const userId = session.id;
  const [payslips, clock, benefits, upcomingEvents] = await Promise.all([
    getPayslips(userId),
    getClockEvents(userId),
    getBenefits(userId),
    getUpcomingEvents(userId),
  ]);

  const ultimoHolerite = payslips?.holerites?.[0];
  const activeBenefits = benefits?.beneficios?.filter((b) => b.ativo) || [];

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Como posso ajudar você hoje?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        <QuickAction icon={ChatCircleDots} label="Chat IA" href="/chat" color="primary" />
        <QuickAction icon={Umbrella} label="Férias" href="/ferias" color="emerald" />
        <QuickAction icon={Money} label="Holerites" href="/folha" color="amber" />
        <QuickAction icon={Clock} label="Ponto" href="/ponto" color="rose" />
      </div>

      {/* AI Assistant Card */}
      <DashboardCard href="/chat" className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <ChatCircleDots className="w-6 h-6 text-primary" weight="duotone" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground">Assistente Pulse</h3>
            <p className="text-sm text-muted-foreground truncate">
              Tire dúvidas sobre férias, folha, ponto e benefícios
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary shrink-0" weight="bold" />
        </div>
      </DashboardCard>

      {/* Grid of cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Vacation Balance */}
        <DashboardCard href="/ferias">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Umbrella className="w-5 h-5 text-emerald-700" weight="duotone" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo de Férias</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-foreground">
                  {latestVacation?.diasSaldo || 0} dias
                </p>
              </div>
            </div>
            <CaretRight className="w-5 h-5 text-muted-foreground" />
          </div>
          {latestVacation && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>
                  Vence em{" "}
                  {latestVacation.dataLimite?.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }) || "Não definida"}
                </span>
              </div>
            </div>
          )}
        </DashboardCard>

        {/* Last Payslip */}
        <DashboardCard href="/folha">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Money className="w-5 h-5 text-amber-700" weight="duotone" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Salário</p>
                <p className="text-xl font-semibold text-foreground">
                  {ultimoHolerite
                    ? <MoneyDisplay value={ultimoHolerite.salarioLiquido} />
                    : "—"}
                </p>
              </div>
            </div>
            <CaretRight className="w-5 h-5 text-muted-foreground" />
          </div>
          {ultimoHolerite && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-muted-foreground">
                Competência: {ultimoHolerite.competencia}
              </p>
            </div>
          )}
        </DashboardCard>

        {/* Clock Status */}
        <DashboardCard href="/ponto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-rose-700" weight="duotone" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Banco de Horas</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-foreground">
                  {clock?._meta?.bancoHorasLabel?.short || "0h"}
                </p>
              </div>
            </div>
            <CaretRight className="w-5 h-5 text-muted-foreground" />
          </div>
          {clock && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-muted-foreground">
                {clock._meta.statusHoje.short}
              </p>
            </div>
          )}
        </DashboardCard>

        {/* Benefits */}
        <DashboardCard href="/beneficios">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-violet-700" weight="duotone" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Benefícios Ativos</p>
                <p className="text-xl font-semibold font-mono tabular-nums text-foreground">
                  {activeBenefits.length}
                </p>
              </div>
            </div>
            <CaretRight className="w-5 h-5 text-muted-foreground" />
          </div>
          {activeBenefits.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-muted-foreground truncate">
                {activeBenefits
                  .slice(0, 3)
                  .map((b) => b.nome)
                  .join(", ")}
              </p>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Upcoming Events */}
      <div className="mt-2">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Próximos Eventos
        </h2>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <DashboardCard>
            <div className="flex items-center gap-4 text-center justify-center py-4">
              <CalendarCheck className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-muted-foreground">
                Nenhum evento agendado
              </p>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}

// Helper component for event cards
function EventCard({ event }: { event: UpcomingEvent }) {
  const getEventIcon = (tipo: EventType) => {
    switch (tipo) {
      case "ferias":
        return Umbrella;
      case "avaliacao":
        return Star;
      case "treinamento":
        return GraduationCap;
      case "aniversario_empresa":
        return CalendarCheck;
      case "prazo_documentos":
        return FileText;
      case "reuniao":
        return ChatCircleDots;
      default:
        return CalendarCheck;
    }
  };

  const getEventColor = (tipo: EventType) => {
    switch (tipo) {
      case "ferias":
        return "emerald";
      case "avaliacao":
        return "violet";
      case "treinamento":
        return "blue";
      case "aniversario_empresa":
        return "amber";
      case "prazo_documentos":
        return "rose";
      case "reuniao":
        return "slate";
      default:
        return "slate";
    }
  };

  const getPriorityBadge = (prioridade: "baixa" | "media" | "alta") => {
    const styles = {
      baixa: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
      media: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      alta: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
    };

    const labels = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[prioridade]}`}>
        {labels[prioridade]}
      </span>
    );
  };

  const formatDateBR = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntil = (isoDate: string) => {
    const today = new Date();
    const eventDate = new Date(isoDate);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return formatDateBR(isoDate);
  };

  const Icon = getEventIcon(event.tipo);
  const color = getEventColor(event.tipo);

  const colorClasses = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400",
  };

  const content = (
    <>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" weight="duotone" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm text-foreground dark:text-slate-50 truncate">
              {event.titulo}
            </h3>
            {getPriorityBadge(event.prioridade)}
          </div>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mb-2">
            {event.descricao}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <CalendarCheck className="w-3.5 h-3.5 text-muted-foreground dark:text-slate-500" />
            <span className="text-muted-foreground dark:text-slate-400 font-medium">
              {getDaysUntil(event.data)}
            </span>
          </div>
        </div>
      </div>
      {event.acao && (
        <CaretRight className="w-5 h-5 text-muted-foreground shrink-0" />
      )}
    </>
  );

  if (event.acao) {
    return (
      <Link
        href={event.acao.href}
        className="block bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),_0_6px_12px_rgba(0,0,0,0.04)] hover:border-slate-200 dark:hover:border-white/20 transition-all"
      >
        <div className="flex items-start gap-3">
          {content}
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
      <div className="flex items-start gap-3">
        {content}
      </div>
    </div>
  );
}
