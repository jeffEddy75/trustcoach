import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/features/common/EmptyState";
import { Calendar, MapPin, Video, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes réservations | TrustCoach",
  description: "Consultez vos réservations de coaching",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente de paiement", variant: "outline" },
  PAYMENT_FAILED: { label: "Échec paiement", variant: "destructive" },
  CONFIRMED: { label: "Confirmée", variant: "default" },
  IN_PROGRESS: { label: "En cours", variant: "secondary" },
  COMPLETED: { label: "Terminée", variant: "secondary" },
  CANCELLED: { label: "Annulée", variant: "destructive" },
  NO_SHOW: { label: "Absent", variant: "destructive" },
  REFUNDED: { label: "Remboursée", variant: "outline" },
  PARTIALLY_REFUNDED: { label: "Partiellement remboursée", variant: "outline" },
};

export default async function UserBookingsPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    return null;
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      coach: {
        include: { user: true },
      },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const upcomingBookings = bookings.filter(
    (b) =>
      new Date(b.scheduledAt) >= new Date() &&
      b.status !== "CANCELLED" &&
      b.status !== "COMPLETED"
  );
  const pastBookings = bookings.filter(
    (b) =>
      new Date(b.scheduledAt) < new Date() ||
      b.status === "COMPLETED" ||
      b.status === "CANCELLED"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Mes réservations</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos séances de coaching.
          </p>
        </div>
        <Button asChild>
          <Link href="/coaches">
            Réserver une séance
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* À venir */}
      <section>
        <h2 className="font-heading text-lg font-semibold mb-4">À venir</h2>
        {upcomingBookings.length === 0 ? (
          <EmptyState
            title="Aucune séance à venir"
            description="Réservez une séance avec un coach pour commencer."
            action={{
              label: "Trouver un coach",
              href: "/coaches",
            }}
          />
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="card-premium">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.coach.user.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.scheduledAt).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {booking.mode === "REMOTE" ? (
                          <>
                            <Video className="h-4 w-4" />
                            Visioconférence
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4" />
                            {booking.location || "Présentiel"}
                          </>
                        )}
                        <span>• {booking.duration} min</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={statusLabels[booking.status]?.variant}>
                        {statusLabels[booking.status]?.label}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/user/bookings/${booking.id}`}>
                          Détails
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Passées */}
      {pastBookings.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-semibold mb-4">
            Historique
          </h2>
          <div className="space-y-3">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="opacity-80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.coach.user.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.scheduledAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>
                    <Badge variant={statusLabels[booking.status]?.variant}>
                      {statusLabels[booking.status]?.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
