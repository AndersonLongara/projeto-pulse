import { requireAdmin } from "@/lib/actions/auth";
import { getUserDetails } from "@/lib/actions/users";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    Suitcase,
    CurrencyDollar,
    ChartLine,
    User,
    IdentificationCard,
    Briefcase,
    Warning
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await requireAdmin();
    const { id } = await params;
    const user = await getUserDetails(id);

    if (!user) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-white/10 px-6 py-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Link href="/users">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            Detalhes do Colaborador
                        </h1>
                        <p className="text-sm text-slate-500">Perfil completo de gestão de RH</p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto space-y-8">

                {/* Profile Hero Section */}
                <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-32 h-32 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-lg shadow-indigo-200 dark:shadow-none">
                            {user.nome.charAt(0)}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{user.nome}</h2>
                                    <StatusBadge status={user.situacao} />
                                </div>
                                <p className="text-lg text-slate-400 font-medium mt-1">{user.cargo || "Cargo não definido"} • {user.departamento || "Sem Departamento"}</p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <IdentificationCard className="w-5 h-5" weight="duotone" />
                                    <span className="text-sm font-semibold">Mat: {user.matricula}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar className="w-5 h-5" weight="duotone" />
                                    <span className="text-sm font-semibold">Admissão: {user.dataAdmissao?.toLocaleDateString('pt-BR') || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <User className="w-5 h-5" weight="duotone" />
                                    <span className="text-sm font-semibold">Acesso: {user.role}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button className="bg-slate-100 hover:bg-slate-200 text-slate-900 border-0 rounded-xl">Editar Dados</Button>
                        </div>
                    </div>
                </section>

                {/* Content Tabs/Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Vacation Periods */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Suitcase className="w-6 h-6 text-indigo-600" weight="duotone" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Períodos Aquisitivos</h3>
                        </div>

                        <div className="space-y-4">
                            {user.vacationPeriods.length === 0 ? (
                                <Card className="border-dashed border-2 border-slate-200 bg-transparent text-center py-12">
                                    <p className="text-slate-400">Nenhum período de férias registrado.</p>
                                </Card>
                            ) : (
                                user.vacationPeriods.map((period, idx) => (
                                    <Card key={period.id} className="border-slate-100 dark:border-white/5 overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className={`h-1.5 w-full ${idx === 0 ? "bg-indigo-600" : "bg-slate-200"}`} />
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                {/* Period Dates */}
                                                <div className="md:col-span-1 space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Referência</p>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        {period.inicioAquisitivo.toLocaleDateString('pt-BR')} <br />
                                                        <span className="text-slate-400 font-medium">até</span> <br />
                                                        {period.fimAquisitivo.toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 md:col-span-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Saldo de Dias</p>
                                                        <p className="text-2xl font-extrabold text-indigo-600 font-mono">{period.diasSaldo}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dias Gozados</p>
                                                        <p className="text-2xl font-extrabold text-slate-400 font-mono">{period.diasGozados}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Faltas</p>
                                                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{period.faltas}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Afastamentos</p>
                                                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{period.afastamentos}</p>
                                                    </div>
                                                </div>

                                                {/* Action/Risk */}
                                                <div className="flex flex-col justify-center items-end border-l border-slate-100 pl-6 dark:border-white/5">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Data Limite</p>
                                                    <p className={`text-sm font-bold ${isPeriodAtRisk(period.dataLimite) ? "text-orange-500" : "text-green-500"}`}>
                                                        {period.dataLimite?.toLocaleDateString('pt-BR') || "Não definida"}
                                                    </p>
                                                    {isPeriodAtRisk(period.dataLimite) && (
                                                        <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-600 border-orange-200 animate-pulse">ALERTA Risco</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Financial & Metadata */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Last Vacation Financial Snapshot */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CurrencyDollar className="w-6 h-6 text-emerald-500" weight="duotone" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Relatório Financeiro</h3>
                            </div>
                            <Card className="border-slate-100 dark:border-white/5 shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-xs text-slate-400 font-medium">Dados da última férias gozada</p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-white/5">
                                            <span className="text-sm text-slate-500">Proventos Totais</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {user.vacationPeriods[0]?.ultFeriasProventos ? `R$ ${user.vacationPeriods[0].ultFeriasProventos}` : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-white/5 text-rose-500">
                                            <span className="text-sm">Descontos</span>
                                            <span className="text-sm font-bold">
                                                {user.vacationPeriods[0]?.ultFeriasDescontos ? `- R$ ${user.vacationPeriods[0].ultFeriasDescontos}` : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-4">
                                            <span className="font-bold text-slate-900 dark:text-white">Líquido Recebido</span>
                                            <span className="text-xl font-extrabold text-emerald-600">
                                                {user.vacationPeriods[0]?.ultFeriasLiquido ? `R$ ${user.vacationPeriods[0].ultFeriasLiquido}` : "—"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-slate-50 px-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <ChartLine className="w-4 h-4" />
                                            <span>Pagamento em: {user.vacationPeriods[0]?.ultFeriasDataPagto?.toLocaleDateString('pt-BR') || "Data não disponível"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* System/Alerts */}
                        <Card className="border-slate-100 dark:border-white/5 shadow-sm bg-slate-900 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Warning className="w-6 h-6 text-amber-400" weight="duotone" />
                                    <h4 className="font-bold">Observações de RH</h4>
                                </div>
                                <ul className="space-y-4 text-sm text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                                        <span>O colaborador teve {user.vacationPeriods[0]?.afastamentos || 0} afastamentos este ano.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                                        <span>Direito a folga CCT: {user.vacationPeriods[0]?.direitoFolgaCct || "Sim"}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </main>
        </div>
    );
}

function StatusBadge({ status }: { status: string | null }) {
    const configs: Record<string, { label: string; class: string }> = {
        "Férias": { label: "🏖️ Em Férias", class: "bg-indigo-50 text-indigo-700 border-indigo-200" },
        "Trabalhando": { label: "🟢 Ativo", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    };

    const config = configs[status || "Trabalhando"] || { label: status || "Ativo", class: "bg-slate-50 text-slate-700 border-slate-200" };

    return (
        <Badge variant="outline" className={`px-3 py-1 font-bold ${config.class}`}>
            {config.label}
        </Badge>
    );
}

function isPeriodAtRisk(limitDate: Date | null): boolean {
    if (!limitDate) return false;
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);
    return limitDate < threeMonthsFromNow;
}
