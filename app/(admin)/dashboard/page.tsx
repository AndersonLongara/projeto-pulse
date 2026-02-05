/**
 * Admin Dashboard Page - HR Command Center
 *
 * Provides overview of workforce using imported vacation data.
 *
 * @see .github/agents/Master.agent.md - Section 2.3 (Admin UI)
 */

import Link from "next/link";
import {
  Users,
  SunHorizon,
  WarningCircle,
  HourglassMedium,
  ArrowRight,
  Briefcase,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Fetch HR Data
  // Fetch HR Data sequentially to avoid pooler multiplexing issues
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      vacationPeriods: {
        orderBy: { inicioAquisitivo: "desc" }, // Most recent first
        take: 1, // Only need the current/latest period for summary
      },
    },
    orderBy: { nome: "asc" },
  });

  const totalPeriods = await prisma.vacationPeriod.count();

  // Calculate Metrics
  const totalEmployees = users.length;
  const onVacation = users.filter((u) => u.situacao === "Férias").length;
  const awayOthers = users.filter((u) => u.situacao !== "Trabalhando" && u.situacao !== "Férias").length;

  // Calculate specific vacation risks (mock logic based on available data)
  // In a real scenario, compare 'dataLimite' with Date.now()
  const now = new Date();
  const expiringSoons = users.filter(u => {
    const period = u.vacationPeriods[0];
    if (!period || !period.dataLimite) return false;
    const daysUntilLimit = Math.ceil((period.dataLimite.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilLimit > 0 && daysUntilLimit < 90; // Less than 3 months
  }).length;

  const totalBalanceDays = users.reduce((acc, u) => {
    return acc + (u.vacationPeriods[0]?.diasSaldo || 0);
  }, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                RH Command Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Visão geral da força de trabalho e gestão de férias
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="hidden md:flex">
                <Link href="/chats">
                  Torre de IA
                </Link>
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200">
                <TrendUp className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-100 shadow-sm dark:bg-slate-900 dark:border-white/10">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Colaboradores</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalEmployees}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    <span className="text-emerald-500 font-medium">100%</span> ativos
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <Users weight="duotone" className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm dark:bg-slate-900 dark:border-white/10">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Em Férias</p>
                  <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{onVacation}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    + {awayOthers} afastados
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <SunHorizon weight="duotone" className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm dark:bg-slate-900 dark:border-white/10">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vencendo 90d</p>
                  <h3 className="text-3xl font-bold text-amber-500 dark:text-amber-400 mt-1">{expiringSoons}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Ação necessária
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <WarningCircle weight="duotone" className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm dark:bg-slate-900 dark:border-white/10">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Acumulado</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalBalanceDays.toFixed(1)}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Dias pendentes
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <HourglassMedium weight="duotone" className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Employee Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Panorama de Colaboradores</h2>
              <Button asChild variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700">
                <Link href="/users">
                  <>Ver Todos <ArrowRight className="ml-1 w-3 h-3" /></>
                </Link>
              </Button>
            </div>

            <Card className="border-slate-100 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-6 py-3">Colaborador</th>
                      <th className="px-6 py-3">Situação</th>
                      <th className="px-6 py-3">Saldo</th>
                      <th className="px-6 py-3">Próx. Vencimento</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {users.slice(0, 8).map((user) => {
                      const latestPeriod = user.vacationPeriods[0];
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                            <Link href={`/users/${user.id}`} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                {user.nome.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{user.nome}</p>
                                <p className="text-xs text-slate-400">Mat: {user.matricula}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={user.situacao} />
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 text-xs">
                            {latestPeriod ? `${latestPeriod.diasSaldo} dias` : '-'}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {latestPeriod && latestPeriod.dataLimite
                              ? latestPeriod.dataLimite.toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                              <Link href={`/users/${user.id}`}>
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Side Widgets */}
          <div className="space-y-6">
            <Card className="border-slate-100 shadow-sm bg-indigo-600 text-white dark:bg-indigo-900 dark:border-white/10">
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Briefcase className="w-32 h-32" />
                </div>
                <h3 className="text-lg font-bold mb-2">Folha de Pagamento</h3>
                <p className="text-indigo-100 text-sm mb-6">
                  Acesse os relatórios financeiros consolidados de férias para a contabilidade.
                </p>
                <Button variant="secondary" className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-0">
                  Ver Relatório Financeiro
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm dark:bg-slate-900 dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Alertas do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mock Alerts */}
                <div className="flex gap-3 items-start p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                  <WarningCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Férias Expirando</p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">5 colaboradores têm férias vencendo em menos de 30 dias.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <Briefcase className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fechamento Mensal</p>
                    <p className="text-xs text-slate-500 mt-1">O cálculo de avos de férias será atualizado em 5 dias.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "Férias") {
    return (
      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
        🏖️ Em Férias
      </Badge>
    );
  }
  if (status === "Trabalhando") {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
        🟢 Ativo
      </Badge>
    );
  }
  if (status?.includes("Licença") || status?.includes("Auxílio")) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
        🩺 {status}
      </Badge>
    );
  }
  return <Badge variant="secondary">{status || "Desconhecido"}</Badge>;
}
