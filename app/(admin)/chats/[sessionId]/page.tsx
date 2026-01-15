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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200/50">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/chats"
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">
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
                        <span className="text-[10px] font-mono text-muted-foreground bg-slate-100 px-2 py-1 rounded">
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
        <aside className="w-72 border-l border-slate-200/50 bg-white p-4 hidden lg:block">
          <Card className="border-[0.5px] border-slate-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Informações do Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-medium">{chatSession.user.nome}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cargo</p>
                <p>{chatSession.user.cargo || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Departamento</p>
                <p>{chatSession.user.departamento || "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Mensagens</p>
                <p className="font-mono tabular-nums">
                  {chatSession.messages.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
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
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    HUMAN_INTERVENTION: {
      label: "Intervenção Humana",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    WAITING_HUMAN: {
      label: "Aguardando Humano",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
  }[status] || {
    label: status,
    className: "bg-slate-50 text-slate-700 border-slate-200",
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
    <div className="flex items-start gap-3 py-2 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors">
      {/* Icon */}
      <div
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser && "bg-slate-100",
          isAI && "bg-emerald-100",
          isAdmin && "bg-amber-100"
        )}
      >
        {isUser && <User className="w-3.5 h-3.5 text-slate-600" weight="bold" />}
        {isAI && <Robot className="w-3.5 h-3.5 text-emerald-600" weight="duotone" />}
        {isAdmin && <UserCircle className="w-3.5 h-3.5 text-amber-600" weight="duotone" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium",
              isUser && "text-slate-700",
              isAI && "text-emerald-700",
              isAdmin && "text-amber-700"
            )}
          >
            {isUser && "Colaborador"}
            {isAI && "Pulse IA"}
            {isAdmin && (message.sender?.nome || "Admin")}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap break-words mt-0.5">
          {message.content}
        </p>
      </div>
    </div>
  );
}
