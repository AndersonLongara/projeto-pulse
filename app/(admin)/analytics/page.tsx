/**
 * Admin Analytics Dashboard
 *
 * Dashboard de gestão com métricas de atendimentos IA.
 * Features: Gráfico de volume de chats, nuvem de temas, conversas críticas.
 *
 * @see ROADMAP.md - Fase 6
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChartLine,
  ChatCircleDots,
  Robot,
  UserCircle,
  WarningCircle,
  TrendUp,
  TrendDown,
  CaretRight,
  Clock,
  Tag,
} from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

// ===========================================
// TYPES
// ===========================================

interface ChatMetrics {
  totalChats: number;
  chatsIA: number;
  chatsHuman: number;
  avgResponseTime: number;
  resolutionRate: number;
  criticalConversations: Array<{
    id: string;
    userName: string;
    createdAt: Date;
    messageCount: number;
    status: string;
  }>;
  topThemes: Array<{
    theme: string;
    count: number;
    percentage: number;
  }>;
  volumeByDay: Array<{
    date: string;
    total: number;
    ia: number;
    human: number;
  }>;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ===========================================
// DATA FETCHING
// ===========================================

async function getAnalyticsData(): Promise<ChatMetrics> {
  // Get all chat sessions with messages
  const sessions = await prisma.chatSession.findMany({
    include: {
      user: {
        select: { nome: true },
      },
      messages: {
        select: { senderType: true, content: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate metrics
  const totalChats = sessions.length;
  const chatsIA = sessions.filter((s) => s.status === "ACTIVE_IA" || s.status === "RESOLVED_IA").length;
  const chatsHuman = sessions.filter((s) => s.status === "HUMAN_INTERVENTION" || s.status === "RESOLVED_HUMAN").length;
  
  // Conversations that required human intervention
  const criticalConversations = sessions
    .filter((s) => s.status === "HUMAN_INTERVENTION" || s.status === "WAITING_HUMAN")
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      userName: s.user.nome,
      createdAt: s.createdAt,
      messageCount: s.messages.length,
      status: s.status,
    }));

  // Theme analysis (simple keyword detection)
  const themeKeywords = {
    "Férias": ["férias", "ferias", "descanso", "folga", "vencimento"],
    "Pagamento": ["salário", "salario", "holerite", "pagamento", "contracheque"],
    "Ponto": ["ponto", "horário", "horario", "banco de horas", "atraso"],
    "Benefícios": ["benefício", "beneficio", "vr", "vt", "plano", "saúde"],
  };

  const themeCounts: Record<string, number> = {
    "Férias": 0,
    "Pagamento": 0,
    "Ponto": 0,
    "Benefícios": 0,
  };

  sessions.forEach((session) => {
    const allContent = session.messages.map((m) => m.content.toLowerCase()).join(" ");
    
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some((kw) => allContent.includes(kw))) {
        themeCounts[theme]++;
      }
    });
  });

  const totalThemeHits = Object.values(themeCounts).reduce((a, b) => a + b, 0) || 1;
  const topThemes = Object.entries(themeCounts)
    .map(([theme, count]) => ({
      theme,
      count,
      percentage: Math.round((count / totalThemeHits) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Volume by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const volumeByDay = last7Days.map((dateStr) => {
    const daySessions = sessions.filter((s) => 
      s.createdAt.toISOString().split("T")[0] === dateStr
    );
    
    return {
      date: dateStr,
      total: daySessions.length,
      ia: daySessions.filter((s) => s.status === "ACTIVE_IA" || s.status === "RESOLVED_IA").length,
      human: daySessions.filter((s) => s.status === "HUMAN_INTERVENTION" || s.status === "RESOLVED_HUMAN").length,
    };
  });

  return {
    totalChats,
    chatsIA,
    chatsHuman,
    avgResponseTime: 2.3, // Mock: 2.3 seconds average
    resolutionRate: totalChats > 0 ? Math.round((chatsIA / totalChats) * 100) : 0,
    criticalConversations,
    topThemes,
    volumeByDay,
  };
}

// ===========================================
// COMPONENTS
// ===========================================

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  iconColor = "text-primary bg-primary/10",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; isPositive: boolean };
  iconColor?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-white/10 p-4">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconColor)}>
          <Icon className="w-5 h-5" weight="duotone" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
          )}>
            {trend.isPositive ? (
              <TrendUp className="w-3 h-3" weight="bold" />
            ) : (
              <TrendDown className="w-3 h-3" weight="bold" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold font-mono tabular-nums dark:text-slate-50">{value}</p>
        <p className="text-sm text-muted-foreground dark:text-slate-400">{label}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
}

function SimpleBarChart({ data }: { data: ChatMetrics["volumeByDay"] }) {
  const maxValue = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((day, idx) => {
        const date = new Date(day.date);
        const dayLabel = date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
        const heightPercent = (day.total / maxValue) * 100;
        const iaPercent = day.total > 0 ? (day.ia / day.total) * heightPercent : 0;
        const humanPercent = heightPercent - iaPercent;

        return (
          <div key={idx} className="flex flex-col items-center flex-1">
            <div className="w-full flex flex-col justify-end h-24">
              {/* Human portion */}
              <div
                className="w-full bg-amber-400 rounded-t-sm transition-all"
                style={{ height: `${humanPercent}%` }}
              />
              {/* IA portion */}
              <div
                className="w-full bg-primary rounded-b-sm transition-all"
                style={{ height: `${iaPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-2 capitalize">
              {dayLabel}
            </span>
            <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
              {day.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ThemeCloud({ themes }: { themes: ChatMetrics["topThemes"] }) {
  const colorClasses = [
    "bg-primary text-primary-foreground",
    "bg-emerald-500 text-white",
    "bg-amber-500 text-white",
    "bg-violet-500 text-white",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((theme, idx) => (
        <div
          key={theme.theme}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            colorClasses[idx % colorClasses.length]
          )}
          style={{
            fontSize: `${Math.max(12, 14 + (theme.percentage / 10))}px`,
          }}
        >
          <Tag className="w-4 h-4" weight="bold" />
          {theme.theme}
          <span className="opacity-70 font-mono tabular-nums">({theme.count})</span>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "USER") {
    redirect("/");
  }

  const metrics = await getAnalyticsData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Métricas de atendimentos e performance da IA
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={ChatCircleDots}
          label="Total de Chats"
          value={metrics.totalChats}
          subValue="Últimos 30 dias"
          trend={{ value: 12, isPositive: true }}
          iconColor="text-primary bg-primary/10"
        />
        <MetricCard
          icon={Robot}
          label="Resolvidos por IA"
          value={metrics.chatsIA}
          subValue={`${metrics.resolutionRate}% do total`}
          trend={{ value: 5, isPositive: true }}
          iconColor="text-emerald-700 bg-emerald-100"
        />
        <MetricCard
          icon={UserCircle}
          label="Intervenção Humana"
          value={metrics.chatsHuman}
          subValue={`${100 - metrics.resolutionRate}% do total`}
          trend={{ value: 3, isPositive: false }}
          iconColor="text-amber-700 bg-amber-100"
        />
        <MetricCard
          icon={Clock}
          label="Tempo Médio"
          value={`${metrics.avgResponseTime}s`}
          subValue="Por resposta"
          iconColor="text-violet-700 bg-violet-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Volume Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-foreground dark:text-slate-50">Volume de Chats</h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">Últimos 7 dias</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-muted-foreground dark:text-slate-400">IA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-muted-foreground dark:text-slate-400">Humano</span>
              </div>
            </div>
          </div>
          <SimpleBarChart data={metrics.volumeByDay} />
        </div>

        {/* Theme Cloud */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-white/10 p-4">
          <div className="mb-4">
            <h3 className="font-medium text-foreground dark:text-slate-50">Temas Mais Consultados</h3>
            <p className="text-sm text-muted-foreground dark:text-slate-400">Análise de palavras-chave</p>
          </div>
          <ThemeCloud themes={metrics.topThemes} />
          
          {/* Theme breakdown */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
            {metrics.topThemes.map((theme) => (
              <div key={theme.theme} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-slate-400">{theme.theme}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${theme.percentage}%` }}
                    />
                  </div>
                  <span className="font-mono tabular-nums text-muted-foreground dark:text-slate-400 w-8">
                    {theme.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Conversations */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-white/10">
        <div className="p-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <WarningCircle className="w-5 h-5 text-amber-500" weight="fill" />
            <h3 className="font-medium text-foreground dark:text-slate-50">Conversas Críticas</h3>
          </div>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            Atendimentos que necessitaram intervenção humana
          </p>
        </div>

        {metrics.criticalConversations.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {metrics.criticalConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/admin/chats/${conv.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-amber-700 dark:text-amber-400" weight="duotone" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-slate-50">{conv.userName}</p>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      {formatDateTime(conv.createdAt)} • {conv.messageCount} mensagens
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    conv.status === "HUMAN_INTERVENTION"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}>
                    {conv.status === "HUMAN_INTERVENTION" ? "Em atendimento" : "Aguardando"}
                  </span>
                  <CaretRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Robot className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-muted-foreground dark:text-slate-400">
              Nenhuma conversa crítica no momento
            </p>
            <p className="text-sm text-muted-foreground dark:text-slate-500">
              A IA está resolvendo todos os atendimentos 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
