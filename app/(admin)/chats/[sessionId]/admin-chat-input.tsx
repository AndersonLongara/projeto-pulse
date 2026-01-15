/**
 * Admin Chat Input Component
 *
 * Input for sending messages during human intervention.
 *
 * @see .github/agents/Master.agent.md - Section 2.3 (Admin UI)
 */

"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PaperPlaneTilt, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";

interface AdminChatInputProps {
  sessionId: string;
}

export function AdminChatInput({ sessionId }: AdminChatInputProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = inputValue.trim();
    if (!content || isPending) return;

    setInputValue("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("sessionId", sessionId);

    startTransition(async () => {
      await sendMessage(formData);
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
    <div className="border-t border-slate-200/50 bg-white p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto flex items-end gap-3"
      >
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Responder como especialista..."
            rows={1}
            className={cn(
              "w-full px-4 py-3 bg-slate-50 rounded-lg resize-none",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white",
              "border border-slate-200/50",
              "transition-all duration-150",
              "min-h-[44px] max-h-[120px]"
            )}
            disabled={isPending}
          />
        </div>

        <Button
          type="submit"
          disabled={!inputValue.trim() || isPending}
          className="bg-amber-500 hover:bg-amber-600 text-white h-11"
        >
          {isPending ? (
            <Spinner className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <PaperPlaneTilt className="w-4 h-4 mr-2" weight="fill" />
              Enviar
            </>
          )}
        </Button>
      </form>

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Você está respondendo como especialista. As respostas da IA estão pausadas.
      </p>
    </div>
  );
}
