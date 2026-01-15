/**
 * Chat Interface Component
 *
 * Client component for real-time chat interaction.
 * Features: typing indicators, optimistic updates, smooth scrolling.
 *
 * @see .github/agents/Master.agent.md - Section 2.4 (Micro-interactions)
 */

"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PaperPlaneTilt, Robot, User, UserCircle, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessage, type ChatMessage } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  sessionId?: string;
  initialMessages: ChatMessage[];
  sessionStatus: string;
  userName: string;
}

export function ChatInterface({
  sessionId,
  initialMessages,
  sessionStatus,
  userName,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update messages when initialMessages change (from server)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = inputValue.trim();
    if (!content || isPending) return;

    // Optimistic update - add user message immediately
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: sessionId || "",
      senderType: "USER",
      senderId: null,
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputValue("");
    setIsTyping(true);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const formData = new FormData();
    formData.append("content", content);
    if (sessionId) {
      formData.append("sessionId", sessionId);
    }

    startTransition(async () => {
      const result = await sendMessage(formData);

      if (!result.success) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        setIsTyping(false);
        return;
      }

      // Refresh to get server state
      setIsTyping(false);
      router.refresh();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <>
      {/* Messages Area */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 px-4 py-4"
      >
        <div className="max-w-lg mx-auto space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Robot className="w-8 h-8 text-primary" weight="duotone" />
              </div>
              <h2 className="font-semibold text-lg mb-2">Olá, {userName.split(" ")[0]}! 👋</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Sou a assistente virtual da Pulse. Posso ajudar com férias, holerites, ponto e benefícios.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Robot className="w-4 h-4 text-primary" weight="duotone" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Intervention notice */}
          {sessionStatus === "HUMAN_INTERVENTION" && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="flex-1 h-px bg-amber-200" />
              <span className="text-xs text-amber-600 font-medium px-2">
                Atendimento com especialista
              </span>
              <div className="flex-1 h-px bg-amber-200" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-none px-4 py-3 bg-white border-t border-slate-100 safe-area-bottom">
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              className={cn(
                "w-full px-4 py-3 pr-12 bg-slate-50 rounded-2xl resize-none",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white",
                "transition-all duration-150",
                "min-h-[44px] max-h-[120px]"
              )}
              disabled={isPending}
            />
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isPending}
            className={cn(
              "w-11 h-11 rounded-full flex-shrink-0",
              "transition-all duration-150",
              inputValue.trim() ? "scale-100" : "scale-95 opacity-70"
            )}
          >
            {isPending ? (
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
// MESSAGE BUBBLE COMPONENT
// ===========================================

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.senderType === "USER";
  const isAdmin = message.senderType === "ADMIN";
  const isAI = message.senderType === "AI";

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
          isAI && "bg-primary/10",
          isAdmin && "bg-amber-100"
        )}
      >
        {isUser && <User className="w-4 h-4 text-primary-foreground" weight="bold" />}
        {isAI && <Robot className="w-4 h-4 text-primary" weight="duotone" />}
        {isAdmin && <UserCircle className="w-4 h-4 text-amber-600" weight="duotone" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          "transition-all duration-150",
          isUser && "bg-primary text-primary-foreground rounded-tr-sm",
          isAI && "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] rounded-tl-sm",
          isAdmin && "bg-amber-50 border border-amber-200 rounded-tl-sm"
        )}
      >
        {/* Admin label */}
        {isAdmin && message.sender && (
          <p className="text-xs font-medium text-amber-700 mb-1">
            {message.sender.nome}
          </p>
        )}

        {/* Content with markdown-like formatting */}
        <div
          className={cn(
            "text-sm whitespace-pre-wrap break-words",
            "[&_strong]:font-semibold",
            isUser ? "text-primary-foreground" : "text-foreground"
          )}
        >
          {formatMessage(message.content)}
        </div>

        {/* Timestamp */}
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
      </div>
    </div>
  );
}

/**
 * Simple markdown-like formatting
 */
function formatMessage(content: string) {
  // Split by double newline for paragraphs
  return content.split("\n").map((line, i) => {
    // Bold text
    const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return (
      <span
        key={i}
        dangerouslySetInnerHTML={{ __html: formatted }}
        className="block"
      />
    );
  });
}
