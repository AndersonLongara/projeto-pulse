/**
 * SuperApp Chat Page
 *
 * Mobile-first chat interface with warm, approachable design.
 * AI streaming powered by Vercel AI SDK + OpenRouter (Gemini).
 *
 * @see .github/agents/Master.agent.md - Section 2.3 (Warmth & Approachability)
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrCreateSession } from "@/lib/actions/chat";
import { ChatInterface } from "./chat-interface-streaming";

export default async function ChatPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const chatSession = await getOrCreateSession();

  return (
    <div className="flex flex-col h-[100dvh] lg:h-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 lg:bg-none">
      {/* Header - Hidden on desktop (already in layout) */}
      <header className="lg:hidden flex-none px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-white/10 safe-area-top">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">
                {session.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-sm text-foreground">
                Pulse IA
              </h1>
              <p className="text-xs text-muted-foreground">
                Assistente de RH
              </p>
            </div>
          </div>

          {/* Status indicator */}
          {chatSession?.status === "HUMAN_INTERVENTION" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium text-amber-700">
                Especialista
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface
        sessionId={chatSession?.id}
        initialMessages={chatSession?.messages || []}
        sessionStatus={chatSession?.status || "ACTIVE_IA"}
        userName={session.nome}
      />
    </div>
  );
}
