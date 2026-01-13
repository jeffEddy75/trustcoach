import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/features/common/EmptyState";
import { AvailabilityManager } from "@/components/features/booking/AvailabilityManager";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon calendrier | TrustCoach",
  description: "Gérez vos disponibilités et vos séances",
};

export default async function CoachCalendarPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    return null;
  }

  const coach = await prisma.coach.findUnique({
    where: { userId: user.id },
    include: {
      availabilities: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!coach) {
    redirect("/user");
  }

  // Récupérer les prochaines séances
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      coachId: coach.id,
      status: { in: ["CONFIRMED", "PENDING"] },
      scheduledAt: { gte: new Date() },
    },
    include: { user: true },
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">Mon calendrier</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos disponibilités et consultez vos séances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disponibilités récurrentes */}
        <AvailabilityManager initialAvailabilities={coach.availabilities} />

        {/* Prochaines séances */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prochaines séances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <EmptyState
                title="Aucune séance à venir"
                description="Vos prochaines réservations apparaîtront ici."
              />
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{booking.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.scheduledAt).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          booking.status === "CONFIRMED"
                            ? "default"
                            : "outline"
                        }
                      >
                        {booking.status === "CONFIRMED"
                          ? "Confirmée"
                          : "En attente"}
                      </Badge>
                      <Badge variant="secondary">
                        {booking.mode === "REMOTE" ? "Visio" : "Présentiel"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
