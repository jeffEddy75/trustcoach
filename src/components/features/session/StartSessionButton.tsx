"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { createSessionAction } from "@/actions/session.actions";

interface StartSessionButtonProps {
  bookingId: string;
  existingSessionId?: string | null;
}

export function StartSessionButton({
  bookingId,
  existingSessionId,
}: StartSessionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    // Si une session existe déjà, rediriger directement
    if (existingSessionId) {
      router.push(`/user/sessions/${existingSessionId}`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await createSessionAction(bookingId);

      if (result.error) {
        console.error("[START_SESSION_ERROR]", result.error);
        return;
      }

      if (result.data) {
        router.push(`/user/sessions/${result.data.id}`);
      }
    } catch (error) {
      console.error("[START_SESSION_ERROR]", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStart}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Démarrage...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          {existingSessionId ? "Reprendre la séance" : "Démarrer la séance"}
        </>
      )}
    </Button>
  );
}
