import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon espace | TrustCoach",
  description: "Gérez vos réservations et consultez vos séances de coaching",
};

export default async function UserDashboardPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Récupérer les stats
  const [upcomingBookings, completedSessions] = await Promise.all([
    prisma.booking.count({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        scheduledAt: { gte: new Date() },
      },
    }),
    prisma.booking.count({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
    }),
  ]);

  // Prochaine séance
  const nextBooking = await prisma.booking.findFirst({
    where: {
      userId: user.id,
      status: "CONFIRMED",
      scheduledAt: { gte: new Date() },
    },
    include: {
      coach: {
        include: { user: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Bonjour, {user.name?.split(" ")[0] || "vous"} !
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace personnel.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Séances à venir
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Séances terminées
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Heures de coaching
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Prochaine séance */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="font-heading">Prochaine séance</CardTitle>
        </CardHeader>
        <CardContent>
          {nextBooking ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{nextBooking.coach.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(nextBooking.scheduledAt).toLocaleDateString(
                    "fr-FR",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {nextBooking.mode === "REMOTE" ? "Visio" : "Présentiel"}
                  {nextBooking.duration && ` • ${nextBooking.duration} min`}
                </p>
              </div>
              <Button asChild>
                <Link href={`/user/bookings/${nextBooking.id}`}>
                  Voir les détails
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Aucune séance programmée
              </p>
              <Button asChild>
                <Link href="/coaches">
                  Trouver un coach
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/coaches" className="block p-6">
            <h3 className="font-heading font-semibold mb-2">
              Trouver un coach
            </h3>
            <p className="text-sm text-muted-foreground">
              Découvrez nos coachs certifiés et réservez votre première séance.
            </p>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/user/sessions" className="block p-6">
            <h3 className="font-heading font-semibold mb-2">
              Mes résumés de séances
            </h3>
            <p className="text-sm text-muted-foreground">
              Retrouvez les résumés IA de vos séances passées.
            </p>
          </Link>
        </Card>
      </div>
    </div>
  );
}
