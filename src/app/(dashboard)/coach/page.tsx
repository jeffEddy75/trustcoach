import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace coach | TrustCoach",
  description: "Gérez votre activité de coaching",
};

export default async function CoachDashboardPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    return null;
  }

  // Vérifier que l'utilisateur est bien coach
  const coach = await prisma.coach.findUnique({
    where: { userId: user.id },
    include: { user: true },
  });

  if (!coach) {
    redirect("/user");
  }

  // Stats
  const [upcomingBookings, totalClients, monthlyRevenue] = await Promise.all([
    prisma.booking.count({
      where: {
        coachId: coach.id,
        status: "CONFIRMED",
        scheduledAt: { gte: new Date() },
      },
    }),
    prisma.booking.groupBy({
      by: ["userId"],
      where: { coachId: coach.id },
    }),
    prisma.booking.aggregate({
      where: {
        coachId: coach.id,
        status: "COMPLETED",
        scheduledAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { price: true },
    }),
  ]);

  // Prochaines séances
  const nextBookings = await prisma.booking.findMany({
    where: {
      coachId: coach.id,
      status: "CONFIRMED",
      scheduledAt: { gte: new Date() },
    },
    include: { user: true },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Bonjour, {coach.user.name?.split(" ")[0] || "Coach"} !
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre activité.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {coach.verified ? (
            <Badge className="bg-green-100 text-green-800">
              <Star className="mr-1 h-3 w-3" />
              Vérifié
            </Badge>
          ) : (
            <Badge variant="outline">En attente de vérification</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA du mois
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(monthlyRevenue._sum.price || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Note moyenne
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coach.averageRating?.toFixed(1) || "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines séances */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Prochaines séances</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/coach/calendar">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {nextBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              Aucune séance programmée
            </p>
          ) : (
            <div className="space-y-4">
              {nextBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{booking.user.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
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
                      <span>• {booking.duration} min</span>
                    </div>
                  </div>
                  <Badge variant={booking.mode === "REMOTE" ? "secondary" : "outline"}>
                    {booking.mode === "REMOTE" ? "Visio" : "Présentiel"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/coach/calendar" className="block p-6">
            <h3 className="font-heading font-semibold mb-2">
              Gérer mes disponibilités
            </h3>
            <p className="text-sm text-muted-foreground">
              Définissez vos créneaux disponibles pour les réservations.
            </p>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/coach/profile" className="block p-6">
            <h3 className="font-heading font-semibold mb-2">
              Compléter mon profil
            </h3>
            <p className="text-sm text-muted-foreground">
              Un profil complet attire plus de clients.
            </p>
          </Link>
        </Card>
      </div>
    </div>
  );
}
