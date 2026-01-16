/**
 * Admin Chats List Page
 *
 * Control tower for monitoring active conversations.
 * Precision & Density UI with dense lists and font-mono logs.
 *
 * @see .github/agents/Master.agent.md - Section 2.3 (Admin UI)
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChatCircleDots,
  Robot,
  UserCircle,
  MagnifyingGlass,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/actions/auth";
import { getActiveSessions } from "@/lib/actions/chat";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default async function AdminChatsPage() {
  const session = await requireAdmin();
  const sessions = await getActiveSessions();

  // Count by status
  const activeIA = sessions.filter((s) => s.status === "ACTIVE_IA").length;
  const humanIntervention = sessions.filter((s) => s.status === "HUMAN_INTERVENTION").length;
  const waiting = sessions.filter((s) => s.status === "WAITING_HUMAN").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground dark:text-slate-50">
                Torre de Controle
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitoramento de conversas em tempo real
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {sessions.length} ativas
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Robot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" weight="duotone" />
                </div>
                <div>
                  <p className="text-2xl font-semibold font-mono tabular-nums">
                    {activeIA}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Com IA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" weight="duotone" />
                </div>
                <div>
                  <p className="text-2xl font-semibold font-mono tabular-nums">
                    {humanIntervention}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Intervenção
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <ChatCircleDots className="w-5 h-5 text-blue-600 dark:text-blue-400" weight="duotone" />
                </div>
                <div>
                  <p className="text-2xl font-semibold font-mono tabular-nums">
                    {waiting}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aguardando
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-slate-500" />
          <Input
            placeholder="Buscar por colaborador..."
            className="pl-10 h-10 border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900"
          />
        </div>

        {/* Sessions List */}
        <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium dark:text-slate-50">
              Conversas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {sessions.length === 0 ? (
                <div className="p-8 text-center">
                  <ChatCircleDots className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma conversa ativa no momento
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {sessions.map((chatSession) => (
                    <Link
                      key={chatSession.id}
                      href={`/chats/${chatSession.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {chatSession.user.nome
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-sm truncate dark:text-slate-200">
                            {chatSession.user.nome}
                          </p>
                          <StatusBadge status={chatSession.status} />
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-slate-400 truncate">
                          {chatSession.titulo || "Nova conversa"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-muted-foreground dark:text-slate-400">
                            {chatSession.user.departamento}
                          </span>
                          <span className="text-muted-foreground dark:text-slate-500">•</span>
                          <span className="text-[10px] font-mono text-muted-foreground dark:text-slate-400 tabular-nums">
                            {chatSession._count?.messages || 0} msgs
                          </span>
                        </div>
                      </div>

                      {/* Last message preview */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
                          {new Date(chatSession.updatedAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <CaretRight className="w-4 h-4 text-muted-foreground mt-1 ml-auto" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    ACTIVE_IA: {
      label: "IA",
      className: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    },
    HUMAN_INTERVENTION: {
      label: "Humano",
      className: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
    },
    WAITING_HUMAN: {
      label: "Aguardando",
      className: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    },
  }[status] || {
    label: status,
    className: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
