import prisma from "@/lib/prisma";
import {
  ClipboardText,
} from "@phosphor-icons/react/dist/ssr";
import { RequestRow } from "./request-actions";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await prisma.vacationRequest.findMany({
    include: {
      user: {
        select: {
          nome: true,
          matricula: true,
          cargo: true,
          departamento: true,
          email: true,
        },
      },
      aprovadoPor: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: [
      { status: "asc" }, // PENDENTE primeiro
      { createdAt: "desc" },
    ],
  });

  // Stats
  const pendentes = requests.filter((r) => r.status === "PENDENTE").length;
  const aprovados = requests.filter((r) => r.status === "APROVADO").length;
  const rejeitados = requests.filter((r) => r.status === "REJEITADO").length;

  // Serialize dates for client component
  const serialized = requests.map((req) => ({
    ...req,
    dataInicio: req.dataInicio.toISOString(),
    dataFim: req.dataFim.toISOString(),
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
    respondidoEm: req.respondidoEm?.toISOString() || null,
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-slate-50">
          Solicitações
        </h1>
        <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
          Gerencie pedidos de férias e outras solicitações. Clique em uma linha
          para ver mais detalhes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Pendentes"
          value={pendentes}
          className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
          textColor="text-amber-700 dark:text-amber-400"
        />
        <StatCard
          label="Aprovados"
          value={aprovados}
          className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
          textColor="text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Rejeitados"
          value={rejeitados}
          className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10"
          textColor="text-rose-700 dark:text-rose-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-white/10 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-muted-foreground font-medium border-b border-slate-200/50 dark:border-white/10">
            <tr>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">
                Colaborador
              </th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">
                Dias
              </th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {serialized.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-muted-foreground"
                >
                  <ClipboardText className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Nenhuma solicitação encontrada.</p>
                </td>
              </tr>
            )}
            {serialized.map((req) => (
              <RequestRow key={req.id} req={req} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===========================================
// STAT CARD
// ===========================================

function StatCard({
  label,
  value,
  className,
  textColor,
}: {
  label: string;
  value: number;
  className: string;
  textColor: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
    >
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-semibold font-mono tabular-nums mt-1 ${textColor}`}>
        {value}
      </p>
    </div>
  );
}
