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
} from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth";
import { getPayslips } from "@/lib/services/senior-mock";
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

export default async function FolhaPage() {
  const session = await getSession();
  const payslips = await getPayslips("emp-001");

  const ultimoHolerite = payslips?.holerites?.[0];
  const resumoAnual = payslips?.resumoAnual;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground dark:text-slate-50">
          Folha de Pagamento
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-slate-400">
          Seus holerites e histórico salarial
        </p>
      </div>

      {/* Summary Card */}
      {ultimoHolerite && (
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200/50 dark:border-amber-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-200/50 dark:bg-amber-800/50 flex items-center justify-center">
              <Money className="w-5 h-5 text-amber-700 dark:text-amber-400" weight="duotone" />
            </div>
            <div>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">Último Salário Líquido</p>
              <p className="text-2xl font-semibold text-amber-900 dark:text-amber-200">
                <MoneyDisplay value={ultimoHolerite.salarioLiquido} />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-amber-200/50">
            <div className="flex items-center gap-2">
              <TrendUp className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs text-amber-700/70">Proventos</p>
                <p className="text-sm font-semibold text-amber-900">
                  <MoneyDisplay value={ultimoHolerite.totalProventos} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendDown className="w-4 h-4 text-rose-600" />
              <div>
                <p className="text-xs text-amber-700/70">Descontos</p>
                <p className="text-sm font-semibold text-amber-900">
                  <MoneyDisplay value={ultimoHolerite.totalDescontos} />
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-200/50">
            <div className="flex items-center gap-1.5 text-xs text-amber-700/70">
              <CalendarBlank className="w-3.5 h-3.5" />
              <span>Competência: {ultimoHolerite.competencia}</span>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>
          </div>
        </Card>
      )}

      {/* Annual Summary */}
      {resumoAnual && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <ChartLineUp className="w-5 h-5 text-slate-600 dark:text-slate-400" weight="duotone" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Resumo {resumoAnual.ano}</p>
              <p className="text-xs text-muted-foreground">
                {resumoAnual.mesesProcessados} meses processados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Bruto</p>
              <p className="text-sm font-semibold text-foreground">
                <MoneyDisplay value={resumoAnual.totalBruto} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Líquido</p>
              <p className="text-sm font-semibold text-foreground">
                <MoneyDisplay value={resumoAnual.totalLiquido} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Média Líquida</p>
              <p className="text-sm font-semibold text-foreground">
                <MoneyDisplay value={resumoAnual.mediaLiquida} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Descontos</p>
              <p className="text-sm font-semibold text-foreground">
                <MoneyDisplay value={resumoAnual.totalDescontos} />
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payslips List */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Histórico de Holerites
        </h2>
        <div className="space-y-3">
          {payslips?.holerites?.map((holerite) => (
            <Card key={holerite.id} className="hover:border-slate-200 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-slate-600 dark:text-slate-400" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {holerite.competencia}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pago em{" "}
                      {new Date(holerite.dataPagamento).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      <MoneyDisplay value={holerite.salarioLiquido} />
                    </p>
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <span className="text-emerald-600">
                        +<MoneyDisplay value={holerite.totalProventos} className="inline" />
                      </span>
                      <span className="text-rose-600">
                        -<MoneyDisplay value={holerite.totalDescontos} className="inline" />
                      </span>
                    </div>
                  </div>
                  <CaretRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              {/* Expandable Detail (Preview) */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Proventos
                  </p>
                  <div className="space-y-1">
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
