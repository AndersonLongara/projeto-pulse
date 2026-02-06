"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Warning,
  Robot,
  User,
  CalendarBlank,
  Clock,
  FileText,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  approveVacationRequest,
  rejectVacationRequest,
} from "@/lib/actions/requests";

// ===========================================
// TYPES
// ===========================================

interface VacationRequestFull {
  id: string;
  userId: string;
  dataInicio: string | Date;
  dataFim: string | Date;
  diasGozados: number;
  diasAbono: number;
  status: string;
  origem: string;
  observacoes: string | null;
  motivoRecusa: string | null;
  createdAt: string | Date;
  respondidoEm: string | Date | null;
  user: {
    nome: string;
    matricula: string;
    cargo: string | null;
    departamento: string | null;
    email: string;
  };
  aprovadoPor: {
    nome: string;
  } | null;
}

// ===========================================
// REQUEST ROW COMPONENT (with expandable detail)
// ===========================================

export function RequestRow({ req }: { req: VacationRequestFull }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" weight="duotone" />
            </div>
            <div>
              <div className="font-medium dark:text-slate-200">{req.user.nome}</div>
              <div className="text-xs text-muted-foreground">
                Matrícula: {req.user.matricula}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 dark:text-slate-300 font-mono tabular-nums text-sm">
          {format(new Date(req.dataInicio), "dd/MM/yyyy")} até{" "}
          {format(new Date(req.dataFim), "dd/MM/yyyy")}
        </td>
        <td className="px-6 py-4 font-mono tabular-nums dark:text-slate-300">
          {req.diasGozados} dias
          {req.diasAbono > 0 && (
            <span className="text-xs text-muted-foreground block">
              +{req.diasAbono} abono
            </span>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={req.status} />
            {req.origem === "CHAT_IA" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800">
                <Robot className="w-3 h-3" weight="duotone" />
                IA
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {req.status === "PENDENTE" && (
              <>
                <ApproveButton requestId={req.id} userName={req.user.nome} />
                <RejectButton requestId={req.id} userName={req.user.nome} />
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-slate-400"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <CaretUp className="w-4 h-4" />
              ) : (
                <CaretDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </td>
      </tr>

      {/* Expanded Detail Row */}
      {expanded && (
        <tr className="bg-slate-50/70 dark:bg-slate-800/30">
          <td colSpan={5} className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <DetailItem
                icon={<User className="w-4 h-4" weight="duotone" />}
                label="Cargo"
                value={req.user.cargo || "Não informado"}
              />
              <DetailItem
                icon={<FileText className="w-4 h-4" weight="duotone" />}
                label="Departamento"
                value={req.user.departamento || "Não informado"}
              />
              <DetailItem
                icon={<CalendarBlank className="w-4 h-4" weight="duotone" />}
                label="Solicitado em"
                value={format(new Date(req.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              />
              <DetailItem
                icon={<Robot className="w-4 h-4" weight="duotone" />}
                label="Origem"
                value={req.origem === "CHAT_IA" ? "Chat com IA" : "Manual"}
              />
            </div>

            {/* Observations */}
            {req.observacoes && (
              <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/10">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Observações do colaborador
                </p>
                <p className="text-sm dark:text-slate-300">{req.observacoes}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {req.motivoRecusa && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">
                  Motivo da recusa
                </p>
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  {req.motivoRecusa}
                </p>
              </div>
            )}

            {/* Approval info */}
            {req.aprovadoPor && req.respondidoEm && (
              <div className="mt-3 text-xs text-muted-foreground">
                {req.status === "APROVADO" ? "Aprovado" : "Rejeitado"} por{" "}
                <span className="font-medium">{req.aprovadoPor.nome}</span> em{" "}
                {format(new Date(req.respondidoEm), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </div>
            )}

            {/* Protocolo */}
            <div className="mt-3 text-xs text-muted-foreground font-mono tabular-nums">
              Protocolo: #{req.id.slice(-8).toUpperCase()}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ===========================================
// APPROVE BUTTON (with confirmation dialog)
// ===========================================

function ApproveButton({
  requestId,
  userName,
}: {
  requestId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    const formData = new FormData();
    formData.set("requestId", requestId);

    startTransition(async () => {
      const result = await approveVacationRequest(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setError(null);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"
          onClick={(e) => e.stopPropagation()}
        >
          <CheckCircle className="w-5 h-5" weight="duotone" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" weight="duotone" />
            Aprovar Solicitação
          </DialogTitle>
          <DialogDescription>
            Confirma a aprovação das férias de{" "}
            <span className="font-medium text-foreground">{userName}</span>?
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">
            <Warning className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" weight="bold" />
            )}
            {isPending ? "Aprovando..." : "Confirmar Aprovação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================
// REJECT BUTTON (with justification dialog)
// ===========================================

function RejectButton({
  requestId,
  userName,
}: {
  requestId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState("");

  const handleReject = () => {
    if (motivoRecusa.trim().length < 10) {
      setError("A justificativa deve ter pelo menos 10 caracteres.");
      return;
    }

    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("motivoRecusa", motivoRecusa.trim());

    startTransition(async () => {
      const result = await rejectVacationRequest(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setError(null);
        setMotivoRecusa("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) {
        setError(null);
        setMotivoRecusa("");
      }
    }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200"
          onClick={(e) => e.stopPropagation()}
        >
          <XCircle className="w-5 h-5" weight="duotone" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600" weight="duotone" />
            Recusar Solicitação
          </DialogTitle>
          <DialogDescription>
            Informe o motivo da recusa das férias de{" "}
            <span className="font-medium text-foreground">{userName}</span>.
            O colaborador será notificado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="motivoRecusa" className="text-sm font-medium">
              Justificativa da Recusa <span className="text-rose-500">*</span>
            </Label>
            <textarea
              id="motivoRecusa"
              value={motivoRecusa}
              onChange={(e) => {
                setMotivoRecusa(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex: Período conflita com demanda crítica do projeto X. Sugerimos reagendar para..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {motivoRecusa.length}/500 caracteres (mínimo 10)
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">
            <Warning className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReject}
            disabled={isPending || motivoRecusa.trim().length < 10}
            variant="destructive"
          >
            {isPending ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" weight="bold" />
            )}
            {isPending ? "Recusando..." : "Confirmar Recusa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================
// HELPERS
// ===========================================

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium dark:text-slate-300">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDENTE:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    APROVADO:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    REJEITADO:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
    CANCELADO:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };

  const labels: Record<string, string> = {
    PENDENTE: "Pendente",
    APROVADO: "Aprovado",
    REJEITADO: "Rejeitado",
    CANCELADO: "Cancelado",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status === "PENDENTE" && <Clock className="w-3.5 h-3.5 mr-1" />}
      {status === "APROVADO" && (
        <CheckCircle className="w-3.5 h-3.5 mr-1" weight="duotone" />
      )}
      {status === "REJEITADO" && (
        <XCircle className="w-3.5 h-3.5 mr-1" weight="duotone" />
      )}
      {labels[status] || status}
    </span>
  );
}
