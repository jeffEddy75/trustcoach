"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpcomingSessionCard } from "./UpcomingSessionCard";
import { QuickStats } from "./QuickStats";
import { PreBriefModal } from "./PreBriefModal";
import { CalendarDays, Star, Loader2 } from "lucide-react";
import type { DashboardPeriod } from "@/actions/coach-dashboard.actions";

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  "48h": "48 heures",
  "week": "Cette semaine",
  "2weeks": "2 semaines",
  "month": "Ce mois",
};

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
  currentPeriod: DashboardPeriod;
}

// Helper pour formater une date en label de jour
function formatDayLabel(date: Date, today: Date, tomorrow: Date): string {
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  if (bookingDate.getTime() === today.getTime()) {
    return "Aujourd'hui";
  }
  if (bookingDate.getTime() === tomorrow.getTime()) {
    return "Demain";
  }

  // Format: "Lundi 15 janvier"
  return bookingDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Grouper les bookings par jour
function groupBookingsByDay(
  bookings: UpcomingBooking[],
  today: Date,
  tomorrow: Date
): Map<string, UpcomingBooking[]> {
  const groups = new Map<string, UpcomingBooking[]>();

  bookings.forEach((booking) => {
    const label = formatDayLabel(new Date(booking.scheduledAt), today, tomorrow);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(booking);
  });

  return groups;
}

export function CoachDashboard({
  coach,
  upcomingBookings,
  monthRevenue,
  monthSessions,
  currentPeriod,
}: CoachDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [preBriefBookingId, setPreBriefBookingId] = useState<string | null>(
    null
  );
  const [preBriefOpen, setPreBriefOpen] = useState(false);

  const handlePreBriefClick = (bookingId: string) => {
    setPreBriefBookingId(bookingId);
    setPreBriefOpen(true);
  };

  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", newPeriod);
      router.push(`/coach?${params.toString()}`);
    });
  };

  // Dates de référence
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Grouper les bookings par jour
  const groupedBookings = groupBookingsByDay(upcomingBookings, today, tomorrow);

  // Texte de la période pour l'affichage
  const periodText = PERIOD_LABELS[currentPeriod].toLowerCase();

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
              ? `Aucune séance prévue ${currentPeriod === "48h" ? "dans les prochaines 48h" : periodText}`
              : `Vous avez ${upcomingBookings.length} séance${
                  upcomingBookings.length > 1 ? "s" : ""
                } prévue${upcomingBookings.length > 1 ? "s" : ""} ${currentPeriod === "48h" ? "dans les prochaines 48h" : periodText}`}
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Prochaines séances
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <Select
              value={currentPeriod}
              onValueChange={(value) => handlePeriodChange(value as DashboardPeriod)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="48h">48 heures</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="2weeks">2 semaines</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune séance programmée {currentPeriod === "48h" ? "dans les prochaines 48h" : periodText}</p>
              <p className="text-sm mt-1">
                Vos prochains rendez-vous apparaîtront ici
              </p>
            </div>
          ) : (
            <>
              {Array.from(groupedBookings.entries()).map(([dayLabel, bookings]) => (
                <div key={dayLabel}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {dayLabel}
                  </h3>
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <UpcomingSessionCard
                        key={booking.id}
                        booking={booking}
                        onPreBriefClick={handlePreBriefClick}
                      />
                    ))}
                  </div>
                </div>
              ))}
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
