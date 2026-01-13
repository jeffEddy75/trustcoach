"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-3",
  lg: "h-12 w-12 border-4",
};

/**
 * Spinner de chargement avec message optionnel
 * @example
 * <LoadingSpinner message="Chargement des coachs..." />
 */
export function LoadingSpinner({
  size = "md",
  message,
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
      role="status"
      aria-label={message || "Chargement"}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
      <span className="sr-only">{message || "Chargement en cours..."}</span>
    </div>
  );
}
