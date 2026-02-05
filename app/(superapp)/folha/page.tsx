/**
 * Folha de Pagamento Page - Payslips & Payroll
 *
 * Employee payroll information with list of payslips and details.
 * Displays salary history with breakdown of earnings and deductions.
 */

import Link from "next/link";
import {
  Money,
  Receipt,
  TrendUp,
  TrendDown,
  CalendarBlank,
  CaretRight,
  Download,
  ChartLineUp,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Card } from "@/components/ui/card";

// Define a type that matches what the UI expects but comes from Prisma
type ExtractedPayslip = {
  id: string;
  competencia: string;
  dataPagamento: Date;
  salarioLiquido: number;
  totalProventos: number;
  totalDescontos: number;
  proventos: { codigo: string; descricaoAbreviada: string; valor: number }[];
  descontos: { codigo: string; descricaoAbreviada: string; valor: number }[];
};

export default async function FolhaPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch real payslips from Prisma
  const dbPayslips = await prisma.payslip.findMany({
    where: { userId: session.id },
    orderBy: { competenciaISO: "desc" },
    include: {
      items: true
    }
  });

  const formattedPayslips: ExtractedPayslip[] = dbPayslips.map(p => ({
    id: p.id,
    competencia: p.competencia,
    dataPagamento: p.dataPagamento,
    salarioLiquido: Number(p.salarioLiquido),
    totalProventos: Number(p.totalProventos),
    totalDescontos: Number(p.totalDescontos),
    proventos: p.items
      .filter(i => i.tipo === "PROVENTO")
      .map(i => ({ codigo: i.codigo, descricaoAbreviada: i.descricao, valor: Number(i.valor) })),
    descontos: p.items
      .filter(i => i.tipo === "DESCONTO")
      .map(i => ({ codigo: i.codigo, descricaoAbreviada: i.descricao, valor: Number(i.valor) })),
  }));

  const ultimoHolerite = formattedPayslips[0];

  // Resumo Anual (2025)
  const payslips2025 = formattedPayslips.filter(p => p.competencia.includes("2025"));
  const resumoAnual = payslips2025.length > 0 ? {
    ano: "2025",
    mesesProcessados: payslips2025.length,
    totalBruto: payslips2025.reduce((acc, p) => acc + p.totalProventos, 0),
    totalLiquido: payslips2025.reduce((acc, p) => acc + p.salarioLiquido, 0),
    totalDescontos: payslips2025.reduce((acc, p) => acc + p.totalDescontos, 0),
    mediaLiquida: payslips2025.reduce((acc, p) => acc + p.salarioLiquido, 0) / payslips2025.length,
  } : null;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Folha de Pagamento
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Seus holerites e histórico salarial
        </p>
      </div>

      {/* Summary Card */}
      {ultimoHolerite && (
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200/50 dark:border-amber-800/50 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-200/50 dark:bg-amber-800/50 flex items-center justify-center shadow-sm">
              <Money className="w-6 h-6 text-amber-700 dark:text-amber-400" weight="duotone" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900/70 dark:text-amber-400/80 uppercase tracking-wider">Último Salário Líquido</p>
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-200 mt-0.5">
                <MoneyDisplay value={ultimoHolerite.salarioLiquido} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-amber-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <TrendUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" weight="bold" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-900/60 dark:text-amber-400/60 uppercase">Proventos</p>
                <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  <MoneyDisplay value={ultimoHolerite.totalProventos} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                <TrendDown className="w-4 h-4 text-rose-600 dark:text-rose-400" weight="bold" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-900/60 dark:text-amber-400/60 uppercase">Descontos</p>
                <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  <MoneyDisplay value={ultimoHolerite.totalDescontos} />
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-200/50">
            <div className="flex items-center gap-2 text-sm text-amber-800/70 dark:text-amber-400/70">
              <CalendarBlank className="w-4 h-4" />
              <span className="font-medium">Competência: {ultimoHolerite.competencia}</span>
            </div>
            <button className="flex items-center gap-2 text-xs font-medium bg-amber-100/50 hover:bg-amber-200/50 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </button>
          </div>
        </Card>
      )}

      {/* Annual Summary */}
      {resumoAnual && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <ChartLineUp className="w-5 h-5 text-slate-600 dark:text-slate-400" weight="duotone" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Resumo {resumoAnual.ano}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {resumoAnual.mesesProcessados} meses processados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total Bruto</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                <MoneyDisplay value={resumoAnual.totalBruto} />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total Líquido</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                <MoneyDisplay value={resumoAnual.totalLiquido} />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Média Líquida</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                <MoneyDisplay value={resumoAnual.mediaLiquida} />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total Descontos</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                <MoneyDisplay value={resumoAnual.totalDescontos} />
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payslips List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Histórico de Holerites
        </h2>
        <div className="space-y-4">
          {formattedPayslips.map((holerite) => (
            <Card key={holerite.id} className="hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md p-5 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                    <Receipt className="w-6 h-6 text-slate-500 dark:text-slate-400" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {holerite.competencia}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" weight="fill" />
                      Pago em{" "}
                      {new Date(holerite.dataPagamento).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                      <MoneyDisplay value={holerite.salarioLiquido} />
                    </p>
                    <div className="flex items-center justify-end gap-3 text-xs font-medium">
                      <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                        +<MoneyDisplay value={holerite.totalProventos} className="inline" />
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">
                        -<MoneyDisplay value={holerite.totalDescontos} className="inline" />
                      </span>
                    </div>
                  </div>
                  <CaretRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Detail Preview */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Proventos
                  </p>
                  <div className="space-y-2">
                    {holerite.proventos.slice(0, 3).map((item) => (
                      <div key={item.codigo} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate mr-2">
                          {item.descricaoAbreviada}
                        </span>
                        <span className="text-emerald-600">
                          <MoneyDisplay value={item.valor} className="inline" />
                        </span>
                      </div>
                    ))}
                    {holerite.proventos.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{holerite.proventos.length - 3} itens
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Descontos
                  </p>
                  <div className="space-y-1">
                    {holerite.descontos.slice(0, 3).map((item) => (
                      <div key={item.codigo} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate mr-2">
                          {item.descricaoAbreviada}
                        </span>
                        <span className="text-rose-600">
                          <MoneyDisplay value={item.valor} className="inline" />
                        </span>
                      </div>
                    ))}
                    {holerite.descontos.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{holerite.descontos.length - 3} itens
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA to Chat */}
      <Card className="border-dashed">
        <Link href="/chat?context=folha" className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <span>Dúvidas sobre seu holerite?</span>
          <span className="text-primary font-medium">Pergunte à IA →</span>
        </Link>
      </Card>
    </div>
  );
}
