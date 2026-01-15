/**
 * Intervention Controls Component
 *
 * Buttons for taking over and releasing chat sessions.
 *
 * @see .github/agents/Master.agent.md - Section 2.3 (Admin UI)
 */

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { HandPalm, ArrowsClockwise, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { takeOverSession, releaseSession } from "@/lib/actions/chat";

interface InterventionControlsProps {
  sessionId: string;
  status: string;
  isAssignedToMe: boolean;
}

export function InterventionControls({
  sessionId,
  status,
  isAssignedToMe,
}: InterventionControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleTakeOver = () => {
    startTransition(async () => {
      const result = await takeOverSession(sessionId);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleRelease = () => {
    startTransition(async () => {
      const result = await releaseSession(sessionId);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const isIntervening = status === "HUMAN_INTERVENTION";

  return (
    <div className="flex items-center gap-2">
      {!isIntervening && (
        <Button
          onClick={handleTakeOver}
          disabled={isPending}
          variant="default"
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isPending ? (
            <Spinner className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <HandPalm className="w-4 h-4 mr-2" weight="bold" />
          )}
          Assumir Conversa
        </Button>
      )}

      {isIntervening && isAssignedToMe && (
        <Button
          onClick={handleRelease}
          disabled={isPending}
          variant="outline"
          size="sm"
        >
          {isPending ? (
            <Spinner className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ArrowsClockwise className="w-4 h-4 mr-2" />
          )}
          Devolver para IA
        </Button>
      )}

      {isIntervening && !isAssignedToMe && (
        <span className="text-xs text-amber-600 font-medium">
          Em atendimento por outro admin
        </span>
      )}
    </div>
  );
}
