"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error: string | Error | null;
  retry?: () => void;
  className?: string;
}

/**
 * Message d'erreur avec bouton de retry optionnel
 * @example
 * <ErrorMessage error="Erreur de chargement" retry={() => refetch()} />
 */
export function ErrorMessage({ error, retry, className }: ErrorMessageProps) {
  const errorMessage =
    error instanceof Error ? error.message : error || "Une erreur est survenue";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6 text-center",
        className
      )}
      role="alert"
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="font-heading font-semibold text-foreground">
          Oups, quelque chose s&apos;est mal passé
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">{errorMessage}</p>
      </div>
      {retry && (
        <Button variant="outline" onClick={retry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      )}
    </div>
  );
}
