/**
 * Admin Dashboard Page
 *
 * Main dashboard with metrics overview.
 *
 * @see .github/agents/Master.agent.md - Section 2.3 (Admin UI)
 */

import Link from "next/link";
import {
  ChatCircleDots,
  Users,
  Robot,
  UserCircle,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/actions/auth";
import { getActiveSessions } from "@/lib/actions/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Get metrics
  const [sessions, totalUsers, totalMessages] = await Promise.all([
    getActiveSessions(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.chatMessage.count(),
  ]);

  const activeIA = sessions.filter((s) => s.status === "ACTIVE_IA").length;
  const humanIntervention = sessions.filter(
    (s) => s.status === "HUMAN_INTERVENTION"
  ).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground dark:text-slate-50">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Bem-vindo, {session.nome}
              </p>
            </div>
            <Link href="/chats">
              <Button variant="outline" size="sm">
                <ChatCircleDots className="w-4 h-4 mr-2" />
                Torre de Controle
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <ChatCircleDots
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    weight="duotone"
                  />
                </div>
                <div>
                  <p className="text-2xl font-semibold font-mono tabular-nums dark:text-slate-50">
                    {sessions.length}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    Conversas Ativas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Robot
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    weight="duotone"
                  />
                </div>
                <div>
                  <p className="text-2xl font-semibold font-mono tabular-nums dark:text-slate-50">
                    {activeIA}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    Atendimento IA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <UserCircle
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    weight="duotone"
                  />
                </div>
                <div>
                  <p className="text-2xl font-semibold font-mono tabular-nums dark:text-slate-50">
                    {humanIntervention}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    Intervenção Humana
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" weight="duotone" />
                </div>
                <div>
                  <p className="text-2xl font-semibold font-mono tabular-nums dark:text-slate-50">
                    {totalUsers}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Colaboradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Conversations */}
          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium dark:text-slate-50">
                Conversas Recentes
              </CardTitle>
              <Link href="/chats">
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todas
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma conversa ativa
                </p>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((chatSession) => (
                    <Link
                      key={chatSession.id}
                      href={`/chats/${chatSession.id}`}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {chatSession.user.nome
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate dark:text-slate-200">
                          {chatSession.user.nome}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-slate-400 truncate">
                          {chatSession.titulo || "Nova conversa"}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground dark:text-slate-400">
                        {new Date(chatSession.updatedAt).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="border-[0.5px] border-slate-200/50 dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium dark:text-slate-50">
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-sm text-muted-foreground dark:text-slate-400">
                  Total de Mensagens
                </span>
                <span className="font-mono tabular-nums text-sm dark:text-slate-300">
                  {totalMessages}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-sm text-muted-foreground dark:text-slate-400">
                  Colaboradores Cadastrados
                </span>
                <span className="font-mono tabular-nums text-sm dark:text-slate-300">
                  {totalUsers}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-sm text-muted-foreground dark:text-slate-400">
                  Status do Sistema
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  Operacional
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground dark:text-slate-400">Versão</span>
                <span className="font-mono text-sm dark:text-slate-300">v0.1.0-alpha</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
