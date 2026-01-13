"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { getOrCreateConversationAction } from "@/actions/messaging.actions";

interface ContactCoachButtonProps {
  coachId: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function ContactCoachButton({
  coachId,
  variant = "outline",
  className,
}: ContactCoachButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleContact = async () => {
    setIsLoading(true);

    const result = await getOrCreateConversationAction(coachId);

    if (result.error) {
      // Si l'utilisateur n'est pas connecté, rediriger vers login
      if (result.error === "Non authentifié") {
        router.push(`/login?callbackUrl=/coaches/${coachId}`);
        return;
      }
      console.error(result.error);
      setIsLoading(false);
      return;
    }

    if (result.data) {
      router.push(`/user/messages/${result.data.id}`);
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant={variant}
      onClick={handleContact}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="mr-2 h-4 w-4" />
      )}
      Contacter
    </Button>
  );
}
