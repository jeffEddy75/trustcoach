"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HealthBadge } from "./HealthBadge";
import { getInitials } from "@/lib/utils";
import { MessageSquare, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { CoachClient } from "@/actions/coach-clients.actions";

interface ClientCardProps {
  client: CoachClient;
}

function formatRelativeDate(date: Date | null): string {
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 14) return "il y a 1 semaine";
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} semaines`;
  if (diffDays < 60) return "il y a 1 mois";
  return `il y a ${Math.floor(diffDays / 30)} mois`;
}

function formatFutureDate(date: Date | null): string {
  if (!date) return "";

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "demain";
  if (diffDays < 7) return `dans ${diffDays} jours`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function ClientCard({ client }: ClientCardProps) {
  const showWarning =
    client.healthStatus === "review" && !client.nextSessionDate;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Avatar + Infos */}
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.image || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(client.name || client.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                  {client.name || client.email}
                </span>
                <HealthBadge status={client.healthStatus} />
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {client.totalSessions} séance
                {client.totalSessions > 1 ? "s" : ""}
                {client.lastSessionDate && (
                  <>
                    {" "}
                    • Dernière : {formatRelativeDate(client.lastSessionDate)}
                  </>
                )}
              </p>

              {/* Alertes et infos supplémentaires */}
              <div className="flex flex-wrap gap-2 mt-2">
                {showWarning && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <AlertTriangle className="h-3 w-3" />
                    Pas de séance prévue
                  </div>
                )}
                {client.nextSessionDate && (
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    <Calendar className="h-3 w-3" />
                    Prochaine : {formatFutureDate(client.nextSessionDate)}
                  </div>
                )}
                {client.hasUnreadMessages && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <MessageSquare className="h-3 w-3" />
                    Message non lu
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/coach/messages?client=${client.id}`}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
