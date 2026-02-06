/**
 * Admin Chat Interface — ChatGPT-style Layout
 *
 * Features:
 * - Sidebar with conversation history (grouped by date)
 * - New conversation button
 * - Session switching with message loading
 * - Message persistence to DB
 * - Responsive (sidebar collapses on mobile)
 * - Welcome screen with suggestions
 *
 * @see lib/ai/admin-system-prompt.ts
 */

"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import {
  PaperPlaneTilt,
  Robot,
  User,
  Spinner,
  ArrowDown,
  Plus,
  Trash,
  ChatText,
  List,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  createAdminChatSession,
  getAdminChatMessages,
  deleteAdminChatSession,
} from "@/lib/actions/admin-chat";

// ===========================================
// TYPES
// ===========================================

interface SessionItem {
  id: string;
  titulo: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface AdminChatLayoutProps {
  adminName: string;
  initialSessions: SessionItem[];
}

// ===========================================
// MAIN LAYOUT
// ===========================================

export function AdminChatLayout({
  adminName,
  initialSessions,
}: AdminChatLayoutProps) {
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Create new session
  const handleNewChat = useCallback(async () => {
    const newId = await createAdminChatSession();
    if (newId) {
      const newSession: SessionItem = {
        id: newId,
        titulo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newId);
      setInitialMessages([]);
      setSidebarOpen(false);
    }
  }, []);

  // Load session messages
  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      if (sessionId === activeSessionId) {
        setSidebarOpen(false);
        return;
      }
      setLoadingSession(true);
      setActiveSessionId(sessionId);
      setSidebarOpen(false);

      try {
        const msgs = await getAdminChatMessages(sessionId);
        const uiMsgs: UIMessage[] = msgs.map((m) => ({
          id: m.id,
          role: (m.senderType === "USER" ? "user" : "assistant") as
            | "user"
            | "assistant",
          parts: [{ type: "text" as const, text: m.content }],
          createdAt: new Date(m.createdAt),
        }));
        setInitialMessages(uiMsgs);
      } catch {
        setInitialMessages([]);
      } finally {
        setLoadingSession(false);
      }
    },
    [activeSessionId]
  );

  // Delete session
  const handleDeleteSession = useCallback(
    async (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const result = await deleteAdminChatSession(sessionId);
      if (result.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          setInitialMessages([]);
        }
      }
    },
    [activeSessionId]
  );

  // Update session title when first message is sent
  const handleFirstMessage = useCallback(
    (sessionId: string, title: string) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                titulo: title.slice(0, 60) + (title.length > 60 ? "..." : ""),
                messageCount: s.messageCount + 1,
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );
    },
    []
  );

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const last7 = new Date(today.getTime() - 7 * 86400000);
    const last30 = new Date(today.getTime() - 30 * 86400000);

    const groups: { label: string; items: SessionItem[] }[] = [
      { label: "Hoje", items: [] },
      { label: "Ontem", items: [] },
      { label: "Últimos 7 dias", items: [] },
      { label: "Últimos 30 dias", items: [] },
      { label: "Mais antigas", items: [] },
    ];

    for (const s of sessions) {
      const d = new Date(s.updatedAt);
      if (d >= today) groups[0].items.push(s);
      else if (d >= yesterday) groups[1].items.push(s);
      else if (d >= last7) groups[2].items.push(s);
      else if (d >= last30) groups[3].items.push(s);
      else groups[4].items.push(s);
    }

    return groups.filter((g) => g.items.length > 0);
  }, [sessions]);

  const firstName = adminName?.split(" ")[0] || "Admin";

  return (
    <div className="flex h-full">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-40 md:z-auto",
          "w-72 h-full flex flex-col",
          "bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-white/10",
          "transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-200/50 dark:border-white/10">
          <Button
            onClick={handleNewChat}
            className={cn(
              "w-full justify-start gap-2",
              "bg-violet-600 hover:bg-violet-700 text-white",
              "h-10 rounded-lg text-sm font-medium"
            )}
          >
            <Plus className="w-4 h-4" weight="bold" />
            Nova Conversa
          </Button>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <ChatText className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground dark:text-slate-500">
                  Nenhuma conversa ainda
                </p>
              </div>
            ) : (
              groupedSessions.map((group) => (
                <div key={group.label} className="mb-3">
                  <p className="text-[10px] font-medium text-muted-foreground dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                    {group.label}
                  </p>
                  {group.items.map((s) => (
                    <div
                      key={s.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectSession(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectSession(s.id);
                        }
                      }}
                      className={cn(
                        "w-full group flex items-center gap-2 px-3 py-2 rounded-lg text-left cursor-pointer",
                        "text-sm transition-colors duration-150",
                        activeSessionId === s.id
                          ? "bg-slate-100 dark:bg-slate-800 text-foreground dark:text-slate-200"
                          : "text-muted-foreground dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-foreground dark:hover:text-slate-200"
                      )}
                    >
                      <ChatText className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">
                        {s.titulo || "Nova conversa"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className={cn(
                          "flex-shrink-0 p-1 rounded",
                          "opacity-0 group-hover:opacity-100",
                          "text-muted-foreground hover:text-red-500 dark:hover:text-red-400",
                          "transition-opacity duration-150"
                        )}
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Robot className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium dark:text-slate-300 truncate">
                Pulse Gestão
              </p>
              <p className="text-[10px] text-muted-foreground dark:text-slate-500">
                Especialista de RH
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex md:hidden items-center gap-2 px-3 py-2 border-b border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-900">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setSidebarOpen(true)}
          >
            <List className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <Robot className="w-4 h-4 text-violet-600 dark:text-violet-400" weight="duotone" />
            <span className="text-sm font-medium dark:text-slate-200">
              Pulse Gestão
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={handleNewChat}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat content */}
        {loadingSession ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeSessionId ? (
          <ChatView
            key={activeSessionId}
            sessionId={activeSessionId}
            adminName={adminName}
            initialMessages={initialMessages}
            onFirstMessage={handleFirstMessage}
          />
        ) : (
          <WelcomeScreen
            firstName={firstName}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            recentSessions={sessions.slice(0, 3)}
          />
        )}
      </div>
    </div>
  );
}

// ===========================================
// CHAT VIEW (active conversation)
// ===========================================

function ChatView({
  sessionId,
  adminName,
  initialMessages,
  onFirstMessage,
}: {
  sessionId: string;
  adminName: string;
  initialMessages: UIMessage[];
  onFirstMessage: (sessionId: string, title: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastScrollTop = useRef(0);
  const [input, setInput] = useState("");
  const hasSentFirstRef = useRef(initialMessages.length > 0);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/admin",
        body: { sessionId },
      }),
    [sessionId]
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages,
    onError: (err) => {
      console.error("Admin chat error:", err);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    if (!hasSentFirstRef.current) {
      hasSentFirstRef.current = true;
      onFirstMessage(sessionId, userMessage);
    }

    try {
      await sendMessage({ text: userMessage });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Scroll logic
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsUserScrolling(false);
      setShowScrollButton(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (scrollTop < lastScrollTop.current && !isAtBottom) {
      setIsUserScrolling(true);
      setShowScrollButton(true);
    }
    if (isAtBottom) {
      setIsUserScrolling(false);
      setShowScrollButton(false);
    }
    lastScrollTop.current = scrollTop;
  }, []);

  useEffect(() => {
    if (!isUserScrolling && scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isUserScrolling]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.closest("form");
        if (form) form.requestSubmit();
      }
    }
  };

  function getMessageText(msg: UIMessage): string {
    return msg.parts.filter(isTextUIPart).map((p) => p.text).join("");
  }

  return (
    <>
      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 relative"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground dark:text-slate-500">
              <Robot className="w-10 h-10 mx-auto mb-3 text-violet-400" weight="duotone" />
              <p className="text-sm">Inicie a conversa abaixo</p>
            </div>
          )}

          {messages.map((message) => {
            const isUserMsg = message.role === "user";
            const isAssistant = message.role === "assistant";
            const content = getMessageText(message);
            if (!content) return null;

            return (
              <div key={message.id} className="flex gap-4">
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    isUserMsg && "bg-slate-200 dark:bg-slate-700",
                    isAssistant && "bg-violet-100 dark:bg-violet-900/40"
                  )}
                >
                  {isUserMsg && (
                    <User className="w-4 h-4 text-slate-600 dark:text-slate-300" weight="bold" />
                  )}
                  {isAssistant && (
                    <Robot className="w-4 h-4 text-violet-600 dark:text-violet-400" weight="duotone" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-1 text-muted-foreground dark:text-slate-400">
                    {isUserMsg ? adminName.split(" ")[0] : "Pulse Gestão"}
                  </p>
                  <div
                    className={cn(
                      "text-sm",
                      isUserMsg
                        ? "text-foreground dark:text-slate-200"
                        : [
                            "prose prose-sm max-w-none dark:prose-invert",
                            "prose-p:my-1.5 prose-p:leading-relaxed",
                            "prose-strong:font-semibold prose-strong:text-foreground dark:prose-strong:text-slate-100",
                            "prose-ul:my-2 prose-ul:pl-4",
                            "prose-ol:my-2 prose-ol:pl-4",
                            "prose-li:my-0.5",
                            "prose-table:my-3 prose-table:text-xs",
                            "prose-th:px-3 prose-th:py-1.5 prose-th:bg-slate-100 dark:prose-th:bg-slate-700 prose-th:font-medium prose-th:text-left",
                            "prose-td:px-3 prose-td:py-1.5 prose-td:border-t prose-td:border-slate-200 dark:prose-td:border-slate-700",
                            "prose-em:italic prose-em:text-muted-foreground dark:prose-em:text-slate-400",
                            "prose-code:text-xs prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
                          ]
                    )}
                  >
                    {isAssistant ? (
                      <ReactMarkdown
                        components={{
                          table: ({ children }) => (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse rounded-lg overflow-hidden my-2 border border-slate-200 dark:border-slate-700">
                                {children}
                              </table>
                            </div>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold tabular-nums">
                              {children}
                            </strong>
                          ),
                          p: ({ children }) => (
                            <p className="my-1.5 leading-relaxed">{children}</p>
                          ),
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    ) : (
                      <span className="whitespace-pre-wrap break-words">
                        {content}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading */}
          {isLoading &&
            (messages.length === 0 ||
              messages[messages.length - 1]?.role === "user" ||
              (messages[messages.length - 1]?.role === "assistant" &&
                getMessageText(messages[messages.length - 1]) === "")) && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                  <Robot className="w-4 h-4 text-violet-600 dark:text-violet-400" weight="duotone" />
                </div>
                <div className="pt-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

          {/* Error */}
          {error && (
            <div className="text-center text-red-500 text-sm py-2">
              Erro: {error.message}
            </div>
          )}
        </div>
      </div>

      {/* Scroll button */}
      {showScrollButton && (
        <div className="relative">
          <Button
            onClick={scrollToBottom}
            size="icon"
            variant="secondary"
            className="absolute -top-14 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full shadow-md"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="flex-none px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-white/10">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre RH, CLT, ou como usar o sistema..."
              rows={1}
              disabled={isLoading}
              className={cn(
                "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl resize-none",
                "text-sm placeholder:text-muted-foreground dark:text-slate-200 dark:placeholder:text-slate-500",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white dark:focus:bg-slate-900",
                "transition-all duration-150",
                "min-h-[44px] max-h-[120px]",
                "border border-slate-200 dark:border-white/10",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-11 h-11 rounded-full flex-shrink-0",
              "bg-violet-600 hover:bg-violet-700",
              "transition-all duration-150",
              input.trim() && !isLoading ? "scale-100" : "scale-95 opacity-70"
            )}
          >
            {isLoading ? (
              <Spinner className="w-5 h-5 animate-spin" />
            ) : (
              <PaperPlaneTilt className="w-5 h-5" weight="fill" />
            )}
          </Button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground dark:text-slate-600 mt-2 max-w-2xl mx-auto">
          Pulse Gestão pode cometer erros. Verifique dados importantes com a legislação oficial.
        </p>
      </div>
    </>
  );
}

// ===========================================
// WELCOME SCREEN (no active session)
// ===========================================

function WelcomeScreen({
  firstName,
  onNewChat,
  onSelectSession,
  recentSessions,
}: {
  firstName: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  recentSessions: SessionItem[];
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <Robot
            className="w-8 h-8 text-violet-600 dark:text-violet-400"
            weight="duotone"
          />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight dark:text-slate-50 mb-2">
          Olá, {firstName}!
        </h1>
        <p className="text-muted-foreground dark:text-slate-400 text-sm mb-8">
          Sou a Pulse Gestão, sua especialista de RH. Posso ajudar com dúvidas
          de CLT, DP, gestão de equipe e também te orientar no uso do sistema.
        </p>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {[
            { emoji: "📋", label: "Como aprovar férias de um colaborador?" },
            { emoji: "💰", label: "Como calcular rescisão contratual?" },
            { emoji: "👥", label: "Como criar um novo usuário no sistema?" },
            { emoji: "📊", label: "Resumo do quadro de colaboradores" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={onNewChat}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl text-left",
                "border border-slate-200 dark:border-white/10",
                "bg-white dark:bg-slate-900",
                "hover:bg-slate-50 dark:hover:bg-slate-800",
                "transition-colors duration-150 group"
              )}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="text-sm text-muted-foreground dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-slate-200 transition-colors">
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="text-left">
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-500 uppercase tracking-wider mb-2">
              Conversas recentes
            </p>
            <div className="space-y-1">
              {recentSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left",
                    "text-sm text-muted-foreground dark:text-slate-400",
                    "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-slate-200",
                    "transition-colors duration-150"
                  )}
                >
                  <ChatText className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">
                    {s.titulo || "Nova conversa"}
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground dark:text-slate-500">
                    {new Date(s.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New chat CTA */}
        <Button
          onClick={onNewChat}
          className="mt-6 bg-violet-600 hover:bg-violet-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" weight="bold" />
          Nova Conversa
        </Button>
      </div>
    </div>
  );
}
