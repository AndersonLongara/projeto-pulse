/**
 * Chat Interface Component - Streaming Edition
 *
 * Client component for real-time chat with AI streaming.
 * Features: manual streaming, react-markdown, smart scroll, typing indicator.
 *
 * @see .github/agents/Master.agent.md - Section 2.4 (Micro-interactions)
 */

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  PaperPlaneTilt,
  Robot,
  User,
  Spinner,
  ArrowDown,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ===========================================
// TYPES
// ===========================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  isStreaming?: boolean;
}

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

  // State for messages and input
  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessages.map((m) => ({
      id: m.id,
      role: m.senderType === "USER" ? "user" as const : "assistant" as const,
      content: m.content,
      createdAt: m.createdAt,
    }))
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    // User is scrolling up
    if (scrollTop < lastScrollTop.current && !isAtBottom) {
      setIsUserScrolling(true);
      setShowScrollButton(true);
    }

    // User scrolled back to bottom
    if (isAtBottom) {
      setIsUserScrolling(false);
      setShowScrollButton(false);
    }

    lastScrollTop.current = scrollTop;
  }, []);

  // Auto-scroll when new messages arrive (unless user is scrolling)
  useEffect(() => {
    if (!isUserScrolling && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isUserScrolling]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ===========================================
  // SUBMIT HANDLER WITH STREAMING
  // ===========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = input.trim();
    if (!content || isLoading) return;

    // Clear input and reset height
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Add user message optimistically
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call streaming API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Check for human intervention
        if (error.status === "HUMAN_INTERVENTION") {
          setIsLoading(false);
          return;
        }
        
        throw new Error(error.error || "Erro ao enviar mensagem");
      }

      // Check if response is plain text (escape response)
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/plain")) {
        const text = await response.text();
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: text,
            createdAt: new Date(),
          },
        ]);
        setIsLoading(false);
        router.refresh();
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      // Add empty assistant message to show streaming
      setMessages((prev) => [...prev, assistantMessage]);

      // Read stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage = {
          ...assistantMessage,
          content: assistantMessage.content + chunk,
        };

        // Update message with new content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? assistantMessage : m
          )
        );
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, isStreaming: false, createdAt: new Date() }
            : m
        )
      );

      // Refresh to sync with server
      router.refresh();
    } catch (error) {
      console.error("Chat error:", error);
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle textarea auto-resize
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle Enter key (submit without shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
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
              isStreaming={message.isStreaming}
            />
          ))}

          {/* Typing indicator (shows when loading before assistant response) */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator />
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
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

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

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          "transition-all duration-150",
          isUser && "bg-primary text-primary-foreground rounded-tr-sm",
          isAssistant &&
            "bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] rounded-tl-sm"
        )}
      >
        {/* Content with Markdown rendering */}
        <div
          className={cn(
            "text-sm",
            isUser ? "text-primary-foreground" : "text-foreground dark:text-slate-200",
            // Markdown styles for assistant
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
                // Custom table styling
                table: ({ children }) => (
                  <table className="w-full border-collapse rounded-lg overflow-hidden my-2">
                    {children}
                  </table>
                ),
                // Bold values should use tabular nums for currency
                strong: ({ children }) => (
                  <strong className="font-semibold tabular-nums">
                    {children}
                  </strong>
                ),
                // Paragraphs
                p: ({ children }) => (
                  <p className="my-1 leading-relaxed">{children}</p>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <span className="whitespace-pre-wrap break-words">
              {message.content}
            </span>
          )}
        </div>

        {/* Streaming cursor */}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 rounded-sm" />
        )}

        {/* Timestamp */}
        {!isStreaming && message.createdAt && (
          <p
            className={cn(
              "text-[10px] mt-1.5",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
