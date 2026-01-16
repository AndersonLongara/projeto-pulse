/**
 * Admin Chat Detail Page
 *
 * Monitoring view for a specific conversation.
 * Shows full message history and intervention controls.
 *
 * @see .github/agents/Master.agent.md - Section 2.3 (Admin UI)
 */

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Robot,
  User,
  UserCircle,
  Phone,
  HandPalm,
  ArrowsClockwise,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/actions/auth";
import { getSessionById } from "@/lib/actions/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { InterventionControls } from "./intervention-controls";
import { AdminChatInput } from "./admin-chat-input";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function AdminChatDetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  const session = await requireAdmin();
  const chatSession = await getSessionById(sessionId);

  if (!chatSession) {
    notFound();
  }

  const isIntervening = chatSession.status === "HUMAN_INTERVENTION";
  const isAssignedToMe = chatSession.assignedAdminId === session.id;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/chats"
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 dark:text-slate-300" />
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight dark:text-slate-50">
                  {chatSession.user.nome}
                </h1>
                <StatusBadge status={chatSession.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {chatSession.user.cargo} • {chatSession.user.departamento}
              </p>
            </div>

            {/* Intervention Controls */}
            <InterventionControls
              sessionId={sessionId}
              status={chatSession.status}
              isAssignedToMe={isAssignedToMe}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Messages Panel */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-2xl mx-auto space-y-1">
              {/* Session Info */}
              <div className="text-center mb-6">
                <p className="text-xs font-mono text-muted-foreground">
                  Sessão iniciada em{" "}
                  {new Date(chatSession.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {chatSession.titulo || "Sem título"}
                </p>
              </div>

              <Separator className="my-4" />

              {/* Messages */}
              {chatSession.messages.map((message, index) => {
                const prevMessage = chatSession.messages[index - 1];
                const showTimestamp =
                  !prevMessage ||
                  new Date(message.createdAt).getTime() -
                    new Date(prevMessage.createdAt).getTime() >
                    5 * 60 * 1000;

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="text-center my-4">
                        <span className="text-[10px] font-mono text-muted-foreground dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {new Date(message.createdAt).toLocaleString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    )}
                    <AdminMessageRow message={message} />
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Admin Input (only when intervening) */}
          {isIntervening && isAssignedToMe && (
            <AdminChatInput sessionId={sessionId} />
          )}
        </div>

        {/* Sidebar - User Info */}
        <aside className="w-72 border-l border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-900 p-4 hidden lg:block">
          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium dark:text-slate-50">
                Informações do Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Nome</p>
                <p className="font-medium dark:text-slate-200">{chatSession.user.nome}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Cargo</p>
                <p className="dark:text-slate-200">{chatSession.user.cargo || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Departamento</p>
                <p className="dark:text-slate-200">{chatSession.user.departamento || "—"}</p>
              </div>
              <Separator className="dark:bg-white/10" />
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Mensagens</p>
                <p className="font-mono tabular-nums dark:text-slate-200">
                  {chatSession.messages.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-slate-400">Status</p>
                <StatusBadge status={chatSession.status} />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    ACTIVE_IA: {
      label: "Atendimento IA",
      className: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    },
    HUMAN_INTERVENTION: {
      label: "Intervenção Humana",
      className: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
    },
    WAITING_HUMAN: {
      label: "Aguardando Humano",
      className: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    },
  }[status] || {
    label: status,
    className: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

function AdminMessageRow({
  message,
}: {
  message: {
    id: string;
    senderType: string;
    senderId: string | null;
    content: string;
    createdAt: Date;
    sender?: { id: string; nome: string; role: string } | null;
  };
}) {
  const isUser = message.senderType === "USER";
  const isAdmin = message.senderType === "ADMIN";
  const isAI = message.senderType === "AI";

  return (
    <div className="flex items-start gap-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded transition-colors">
      {/* Icon */}
      <div
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser && "bg-slate-100 dark:bg-slate-800",
          isAI && "bg-emerald-100 dark:bg-emerald-900/30",
          isAdmin && "bg-amber-100 dark:bg-amber-900/30"
        )}
      >
        {isUser && <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" weight="bold" />}
        {isAI && <Robot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" weight="duotone" />}
        {isAdmin && <UserCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" weight="duotone" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium",
              isUser && "text-slate-700 dark:text-slate-300",
              isAI && "text-emerald-700 dark:text-emerald-400",
              isAdmin && "text-amber-700 dark:text-amber-400"
            )}
          >
            {isUser && "Colaborador"}
            {isAI && "Pulse IA"}
            {isAdmin && (message.sender?.nome || "Admin")}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground dark:text-slate-500 tabular-nums">
            {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <p className="text-sm text-foreground dark:text-slate-200 whitespace-pre-wrap break-words mt-0.5">
          {message.content}
        </p>
      </div>
    </div>
  );
}
