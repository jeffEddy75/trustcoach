"use client";

import { Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/**
 * État vide avec message et action optionnelle
 * @example
 * <EmptyState
 *   title="Aucun coach trouvé"
 *   description="Essayez de modifier vos critères de recherche"
 *   action={{ label: 'Réinitialiser', onClick: resetFilters }}
 * />
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4">
        {icon ? (
          typeof icon === "function" ? (
            (() => {
              const IconComponent = icon as LucideIcon;
              return <IconComponent className="h-8 w-8 text-muted-foreground" />;
            })()
          ) : (
            icon
          )
        ) : (
          <Inbox className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-2">
        <h3 className="font-heading font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <Button variant="outline" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
