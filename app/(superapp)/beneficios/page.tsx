/**
 * Benefícios Page - Employee Benefits
 *
 * Employee benefits information with active plans,
 * values, and dependent information.
 */

import Link from "next/link";
import {
  Heart,
  FirstAid,
  Tooth,
  ShieldCheck,
  Barbell,
  Baby,
  GraduationCap,
  CurrencyDollar,
  Bus,
  ForkKnife,
  CaretRight,
  CheckCircle,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth";
import { getBenefits } from "@/lib/services/senior-mock";
import type { BenefitType } from "@/lib/services/senior-mock";
import { MoneyDisplay } from "@/components/ui/money-display";

// Format currency in BRL
function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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

// Benefit icon and color mapper
function getBenefitConfig(tipo: BenefitType) {
  const config: Record<BenefitType, { icon: React.ElementType; color: string; bgColor: string }> = {
    plano_saude: { icon: FirstAid, color: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-100 dark:bg-rose-900/30" },
    plano_odonto: { icon: Tooth, color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-100 dark:bg-sky-900/30" },
    seguro_vida: { icon: ShieldCheck, color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-100 dark:bg-violet-900/30" },
    gympass: { icon: Barbell, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
    auxilio_creche: { icon: Baby, color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
    auxilio_educacao: { icon: GraduationCap, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
    ppr: { icon: CurrencyDollar, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
    vt: { icon: Bus, color: "text-slate-600 dark:text-slate-400", bgColor: "bg-slate-100 dark:bg-slate-800" },
    vr: { icon: ForkKnife, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
    va: { icon: ForkKnife, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  };
  return config[tipo] || { icon: Heart, color: "text-slate-600 dark:text-slate-400", bgColor: "bg-slate-100 dark:bg-slate-800" };
}

export default async function BeneficiosPage() {
  const session = await getSession();
  const benefitsData = await getBenefits("emp-001");

  const activeBenefits = benefitsData?.beneficios?.filter((b) => b.ativo) || [];
  const inactiveBenefits = benefitsData?.beneficios?.filter((b) => !b.ativo) || [];
  const totalMensal = benefitsData?.totalMensal || 0;

  // Calculate total employee discount
  const totalDesconto = activeBenefits.reduce((acc, b) => acc + b.valorDesconto, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground dark:text-slate-50">
          Benefícios
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-slate-400">
          Seus planos e vantagens ativas
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/10 border-violet-200/50 dark:border-violet-800/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-violet-200/50 dark:bg-violet-800/50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-violet-700 dark:text-violet-400" weight="duotone" />
          </div>
          <div>
            <p className="text-sm text-violet-700/80 dark:text-violet-400/80">Total em Benefícios</p>
            <p className="text-2xl font-semibold text-violet-900 dark:text-violet-200">
              <MoneyDisplay value={totalMensal} />
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-violet-200/50">
          <div>
            <p className="text-xs text-violet-700/70">Empresa paga</p>
            <p className="text-sm font-semibold text-violet-900">
              <MoneyDisplay value={totalMensal - totalDesconto} />
            </p>
          </div>
          <div>
            <p className="text-xs text-violet-700/70">Você paga</p>
            <p className="text-sm font-semibold text-violet-900">
              <MoneyDisplay value={totalDesconto} />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-violet-200/50 text-xs text-violet-700/70">
          <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
          <span>{activeBenefits.length} benefícios ativos</span>
        </div>
      </Card>

      {/* Active Benefits */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Benefícios Ativos
        </h2>
        <div className="space-y-3">
          {activeBenefits.map((benefit) => {
            const config = getBenefitConfig(benefit.tipo);
            const Icon = config.icon;

            return (
              <Card key={benefit.id} className="hover:border-slate-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {benefit.nome}
                      </p>
                      {benefit.operadora && (
                        <p className="text-xs text-muted-foreground">
                          {benefit.operadora}
                          {benefit.plano && ` • ${benefit.plano}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <CaretRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>

                {/* Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-sm font-semibold text-foreground">
                      <MoneyDisplay value={benefit.valor} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Desconto</p>
                    <p className="text-sm font-semibold text-rose-600">
                      <MoneyDisplay value={benefit.valorDesconto} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dependentes</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold font-mono tabular-nums text-foreground">
                        {benefit.dependentes}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coparticipation Warning */}
                {benefit.coparticipacao && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md w-fit">
                    <span>⚠️</span>
                    <span>Este plano possui coparticipação</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Inactive Benefits */}
      {inactiveBenefits.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Benefícios Disponíveis
          </h2>
          <div className="space-y-2">
            {inactiveBenefits.map((benefit) => {
              const config = getBenefitConfig(benefit.tipo);
              const Icon = config.icon;

              return (
                <Card key={benefit.id} className="opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 text-slate-400" weight="duotone" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {benefit.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Não aderido
                        </p>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-primary hover:underline">
                      Aderir
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA to Chat */}
      <Card className="border-dashed">
        <Link
          href="/chat?context=beneficios"
          className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <span>Dúvidas sobre seus benefícios?</span>
          <span className="text-primary font-medium">Pergunte à IA →</span>
        </Link>
      </Card>
    </div>
  );
}
