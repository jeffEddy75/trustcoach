"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpcomingSessionCard } from "./UpcomingSessionCard";
import { QuickStats } from "./QuickStats";
import { PreBriefModal } from "./PreBriefModal";
import { CalendarDays, Star } from "lucide-react";

interface UpcomingBooking {
  id: string;
  scheduledAt: Date;
  duration: number;
  mode: "REMOTE" | "IN_PERSON";
  price: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  session: {
    id: string;
    status: string;
    markedMoments: {
      id: string;
      timestamp: number;
      note: string | null;
    }[];
  } | null;
  sessionNumber: number;
  hasUnreadMessages: boolean;
  lastMomentNote: string | null;
}

interface CoachDashboardProps {
  coach: {
    id: string;
    name: string;
    verified: boolean;
  };
  upcomingBookings: UpcomingBooking[];
  monthRevenue: number;
  monthSessions: number;
}

export function CoachDashboard({
  coach,
  upcomingBookings,
  monthRevenue,
  monthSessions,
}: CoachDashboardProps) {
  const [preBriefBookingId, setPreBriefBookingId] = useState<string | null>(
    null
  );
  const [preBriefOpen, setPreBriefOpen] = useState(false);

  const handlePreBriefClick = (bookingId: string) => {
    setPreBriefBookingId(bookingId);
    setPreBriefOpen(true);
  };

  // Grouper les séances par jour
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const todayBookings = upcomingBookings.filter((b) => {
    const date = new Date(b.scheduledAt);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  });

  const tomorrowBookings = upcomingBookings.filter((b) => {
    const date = new Date(b.scheduledAt);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === tomorrow.getTime();
  });

  const laterBookings = upcomingBookings.filter((b) => {
    const date = new Date(b.scheduledAt);
    date.setHours(0, 0, 0, 0);
    return date.getTime() >= dayAfterTomorrow.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Bonjour {coach.name} !
          </h1>
          <p className="text-muted-foreground mt-1">
            {upcomingBookings.length === 0
              ? "Aucune séance prévue dans les prochaines 48h"
              : `Vous avez ${upcomingBookings.length} séance${
                  upcomingBookings.length > 1 ? "s" : ""
                } prévue${upcomingBookings.length > 1 ? "s" : ""} dans les prochaines 48h`}
          </p>
        </div>
        {coach.verified && (
          <Badge className="bg-green-100 text-green-800">
            <Star className="mr-1 h-3 w-3" />
            Vérifié
          </Badge>
        )}
      </div>

      {/* Séances à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Prochaines séances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune séance programmée dans les prochaines 48h</p>
              <p className="text-sm mt-1">
                Vos prochains rendez-vous apparaîtront ici
              </p>
            </div>
          ) : (
            <>
              {/* Aujourd'hui */}
              {todayBookings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Aujourd'hui
                  </h3>
                  <div className="space-y-3">
                    {todayBookings.map((booking) => (
                      <UpcomingSessionCard
                        key={booking.id}
                        booking={booking}
                        onPreBriefClick={handlePreBriefClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Demain */}
              {tomorrowBookings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Demain
                  </h3>
                  <div className="space-y-3">
                    {tomorrowBookings.map((booking) => (
                      <UpcomingSessionCard
                        key={booking.id}
                        booking={booking}
                        onPreBriefClick={handlePreBriefClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Plus tard */}
              {laterBookings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Dans 2 jours
                  </h3>
                  <div className="space-y-3">
                    {laterBookings.map((booking) => (
                      <UpcomingSessionCard
                        key={booking.id}
                        booking={booking}
                        onPreBriefClick={handlePreBriefClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats du mois */}
      <QuickStats monthRevenue={monthRevenue} monthSessions={monthSessions} />

      {/* Pre-brief Modal */}
      <PreBriefModal
        bookingId={preBriefBookingId}
        open={preBriefOpen}
        onOpenChange={setPreBriefOpen}
      />
    </div>
  );
}
