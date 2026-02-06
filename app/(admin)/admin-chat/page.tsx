/**
 * Admin Chat Page
 *
 * ChatGPT-style interface with session sidebar, conversation persistence,
 * and the Pulse Gestão AI (HR specialist + system guide).
 *
 * @see lib/ai/admin-system-prompt.ts
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdminChatSessions } from "@/lib/actions/admin-chat";
import { AdminChatLayout } from "./admin-chat-interface";

export default async function AdminChatPage() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const sessions = await getAdminChatSessions();

  return (
    <div className="h-[calc(100vh)] md:h-screen bg-slate-50 dark:bg-slate-950">
      <AdminChatLayout
        adminName={session.nome}
        initialSessions={sessions.map((s) => ({
          id: s.id,
          titulo: s.titulo,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
          messageCount: s._count.messages,
        }))}
      />
    </div>
  );
}
