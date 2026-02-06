/**
 * Chat Interface Component - Streaming Edition
 *
 * Client component for real-time chat with AI streaming.
 * Updated for AI SDK v6 / @ai-sdk/react v3
 *
 * @see .github/agents/Master.agent.md - Section 2.4 (Micro-interactions)
 */

"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, isToolUIPart, getToolName, type UIMessage, type ToolUIPart, type DynamicToolUIPart } from "ai";
import ReactMarkdown from "react-markdown";
import {
  PaperPlaneTilt,
  Robot,
  User,
  Spinner,
  ArrowDown,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ===========================================
// TYPES
// ===========================================

interface ChatInterfaceProps {
  sessionId?: string;
  initialMessages: Array<{
    id: string;
    sessionId: string;
    senderType: string;
    senderId: string | null;
    content: string;
    createdAt: Date;
    sender?: { id: string; nome: string; role: string } | null;
  }>;
  sessionStatus: string;
  userName: string;
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function ChatInterface({
  sessionId,
  initialMessages,
  sessionStatus,
  userName,
}: ChatInterfaceProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastScrollTop = useRef(0);
  const [input, setInput] = useState("");

  // Map initial messages to AI SDK v6 UIMessage format
  const initialChatMessages: UIMessage[] = useMemo(() => initialMessages.map((m) => ({
    id: m.id,
    role: (m.senderType === "USER" ? "user" : "assistant") as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
    createdAt: new Date(m.createdAt),
  })), [initialMessages]);

  // Create transport with custom API and session body
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    body: { sessionId },
  }), [sessionId]);

  // AI SDK v6 useChat Hook
  const {
    messages,
    sendMessage,
    status,
    error,
  } = useChat({
    transport,
    messages: initialChatMessages,
    onFinish: () => {
      // Refresh to update server-side context or history if needed
      router.refresh();
      // Scroll to bottom
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    },
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  // Derive loading state from status
  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput(""); // Clear input immediately

    // Reset height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      await sendMessage({ text: userMessage });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // ===========================================
  // SMART SCROLL LOGIC
  // ===========================================

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

  // Detect user scroll
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

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!isUserScrolling && scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isUserScrolling]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle textarea auto-resize
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.closest("form");
        if (form) form.requestSubmit();
      }
    }
  };

  // Check if session is under human intervention
  const isHumanIntervention = sessionStatus === "HUMAN_INTERVENTION";

  return (
    <>
      {/* Messages Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 lg:min-h-[calc(100vh-280px)] lg:max-h-[calc(100vh-280px)]"
      >
        <div className="max-w-lg mx-auto space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <WelcomeMessage userName={userName} />
          )}

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            messages.length === 0 ||
            messages[messages.length - 1]?.role === "user" ||
            (messages[messages.length - 1]?.role === "assistant" && getMessageText(messages[messages.length - 1]) === "")
          ) && (
            <TypingIndicator />
          )}

          {/* Error display */}
          {error && (
            <div className="text-center text-red-500 text-sm py-2">
              Erro: {error.message}
            </div>
          )}

          {/* Intervention notice */}
          {isHumanIntervention && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="flex-1 h-px bg-amber-200 dark:bg-amber-800/50" />
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium px-2">
                Atendimento com especialista
              </span>
              <div className="flex-1 h-px bg-amber-200 dark:bg-amber-800/50" />
            </div>
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          variant="secondary"
          className={cn(
            "absolute bottom-24 left-1/2 -translate-x-1/2",
            "w-10 h-10 rounded-full shadow-lg",
            "animate-in fade-in slide-in-from-bottom-2 duration-200"
          )}
        >
          <ArrowDown className="w-5 h-5" />
        </Button>
      )}

      {/* Input Area */}
      <div className="flex-none px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 safe-area-bottom lg:px-6">
        <form
          onSubmit={handleSubmit}
          className="max-w-lg lg:max-w-none mx-auto flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={
                isHumanIntervention
                  ? "Aguardando especialista..."
                  : "Digite sua mensagem..."
              }
              rows={1}
              disabled={isLoading || isHumanIntervention}
              className={cn(
                "w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 rounded-2xl resize-none",
                "text-sm placeholder:text-muted-foreground dark:text-slate-200 dark:placeholder:text-slate-500",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900",
                "transition-all duration-150",
                "min-h-[44px] max-h-[120px]",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            />
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || isHumanIntervention}
            className={cn(
              "w-11 h-11 rounded-full flex-shrink-0",
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
      </div>
    </>
  );
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

function getToolInvocations(message: UIMessage) {
  return message.parts.filter(isToolUIPart);
}

// ===========================================
// WELCOME MESSAGE COMPONENT
// ===========================================

function WelcomeMessage({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
        <Robot className="w-8 h-8 text-primary" weight="duotone" />
      </div>
      <h2 className="font-semibold text-lg mb-2 dark:text-slate-50">Olá, {firstName}! 👋</h2>
      <p className="text-muted-foreground dark:text-slate-400 text-sm max-w-xs mx-auto">
        Sou a assistente virtual da Pulse. Posso ajudar com férias, holerites,
        ponto e benefícios.
      </p>
    </div>
  );
}

// ===========================================
// TYPING INDICATOR COMPONENT
// ===========================================

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-in fade-in duration-200">
      <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Robot className="w-4 h-4 text-primary" weight="duotone" />
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)]">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

// ===========================================
// MESSAGE BUBBLE COMPONENT
// ===========================================

function MessageBubble({
  message,
}: {
  message: UIMessage;
}) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  
  const content = getMessageText(message);
  const toolInvocations = getToolInvocations(message);

  // Hide empty messages that only have tools (optional, but keeps chat clean initially)
  if (!content && toolInvocations.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser && "bg-primary",
          isAssistant && "bg-primary/10 dark:bg-primary/20"
        )}
      >
        {isUser && (
          <User className="w-4 h-4 text-primary-foreground" weight="bold" />
        )}
        {isAssistant && (
          <Robot className="w-4 h-4 text-primary" weight="duotone" />
        )}
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col gap-2 max-w-[80%]">

        {/* Tool Invocations (Status Cards) */}
        {toolInvocations.map((toolPart) => {
          // In AI SDK v6, tool parts have properties directly (not nested in toolInvocation)
          const toolName = getToolName(toolPart);
          const toolCallId = toolPart.toolCallId;
          const state = toolPart.state;
          const output = 'output' in toolPart ? toolPart.output : undefined;

          if ((state === 'output-available' || state === 'output-error' || state === 'output-denied') && output) {
            const result = output as Record<string, unknown>;

            if (toolName === 'checkVacationEligibility') {
              return (
                <div key={toolCallId} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm shadow-sm opacity-80">
                  <div className="flex items-center gap-2 mb-1">
                    {result.valid ? <CheckCircle className="text-emerald-500" /> : <WarningCircle className="text-amber-500" />}
                    <span className="font-semibold">{result.valid ? "Verificação Aprovada" : "Atenção"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{(result.message || result.reason) as string}</div>
                </div>
              );
            }

            if (toolName === 'createVacationRequest') {
              return (
                <div key={toolCallId} className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-sm shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">Solicitação Recebida</span>
                  </div>
                  <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    Protocolo: {result.protocol as string}
                  </div>
                </div>
              );
            }
          }

          // Calling/streaming state
          return (
            <div key={toolCallId} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg p-3 text-sm flex items-center gap-2 opacity-60">
              <Spinner className="animate-spin w-4 h-4" />
              <span className="text-xs">Processando {toolName}...</span>
            </div>
          );
        })}

        {/* Main Text Content */}
        {content && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3",
              "transition-all duration-150",
              isUser && "bg-primary text-primary-foreground rounded-tr-sm",
              isAssistant &&
              "bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] rounded-tl-sm"
            )}
          >
            <div
              className={cn(
                "text-sm",
                isUser ? "text-primary-foreground" : "text-foreground dark:text-slate-200",
                isAssistant && [
                  "prose prose-sm max-w-none dark:prose-invert",
                  "prose-p:my-1 prose-p:leading-relaxed",
                  "prose-strong:font-semibold prose-strong:text-foreground dark:prose-strong:text-slate-100",
                  "prose-ul:my-2 prose-ul:pl-4",
                  "prose-li:my-0.5",
                  "prose-table:my-2 prose-table:text-xs",
                  "prose-th:px-2 prose-th:py-1 prose-th:bg-slate-100 dark:prose-th:bg-slate-700 prose-th:font-medium prose-th:text-left",
                  "prose-td:px-2 prose-td:py-1 prose-td:border-t prose-td:border-slate-200 dark:prose-td:border-slate-700",
                  "prose-em:italic prose-em:text-muted-foreground dark:prose-em:text-slate-400",
                ]
              )}
            >
              {isAssistant ? (
                <ReactMarkdown
                  components={{
                    table: ({ children }) => (
                      <table className="w-full border-collapse rounded-lg overflow-hidden my-2">
                        {children}
                      </table>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold tabular-nums">
                        {children}
                      </strong>
                    ),
                    p: ({ children }) => (
                      <p className="my-1 leading-relaxed">{children}</p>
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
        )}
      </div>
    </div>
  );
}
