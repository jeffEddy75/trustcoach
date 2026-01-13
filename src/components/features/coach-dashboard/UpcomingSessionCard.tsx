"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Clock, MessageSquare, Star, UserPlus } from "lucide-react";
import Link from "next/link";

interface UpcomingSessionCardProps {
  booking: {
    id: string;
    scheduledAt: Date;
    duration: number;
    mode: "REMOTE" | "IN_PERSON";
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    session: {
      id: string;
    } | null;
    sessionNumber: number;
    hasUnreadMessages: boolean;
    lastMomentNote: string | null;
  };
  onPreBriefClick: (bookingId: string) => void;
}

export function UpcomingSessionCard({
  booking,
  onPreBriefClick,
}: UpcomingSessionCardProps) {
  const isNewClient = booking.sessionNumber === 1;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Heure */}
            <div className="flex flex-col items-center justify-center min-w-[50px] text-center">
              <span className="text-lg font-bold text-primary">
                {formatTime(booking.scheduledAt)}
              </span>
              <span className="text-xs text-muted-foreground">
                {booking.duration} min
              </span>
            </div>

            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={booking.user.image || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(booking.user.name || booking.user.email)}
              </AvatarFallback>
            </Avatar>

            {/* Infos client */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                  {booking.user.name || booking.user.email}
                </span>
                {isNewClient && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Nouveau
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Séance #{booking.sessionNumber}
                {booking.mode === "REMOTE" ? " • Visio" : " • Présentiel"}
              </p>

              {/* Indicateurs */}
              <div className="flex flex-wrap gap-2 mt-2">
                {booking.lastMomentNote && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <Star className="h-3 w-3" />
                    <span className="truncate max-w-[180px]">
                      {booking.lastMomentNote}
                    </span>
                  </div>
                )}
                {booking.hasUnreadMessages && (
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
            {!isNewClient && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreBriefClick(booking.id)}
              >
                Pré-brief
              </Button>
            )}
            {booking.session ? (
              <Button size="sm" asChild>
                <Link href={`/user/sessions/${booking.session.id}`}>
                  Démarrer
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="secondary" asChild>
                <Link href={`/coach/clients`}>Voir profil</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
