import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/features/common/EmptyState";
import { getInitials } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes clients | TrustCoach",
  description: "Gérez vos clients de coaching",
};

export default async function CoachClientsPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    return null;
  }

  const coach = await prisma.coach.findUnique({
    where: { userId: user.id },
  });

  if (!coach) {
    redirect("/user");
  }

  // Récupérer les clients uniques avec leurs stats
  const bookings = await prisma.booking.findMany({
    where: { coachId: coach.id },
    include: { user: true },
    orderBy: { scheduledAt: "desc" },
  });

  // Grouper par client
  const clientsMap = new Map<
    string,
    {
      user: typeof bookings[0]["user"];
      totalSessions: number;
      lastSession: Date | null;
      nextSession: Date | null;
    }
  >();

  const now = new Date();

  for (const booking of bookings) {
    const existing = clientsMap.get(booking.userId);
    const isCompleted = booking.status === "COMPLETED";
    const isUpcoming =
      booking.status === "CONFIRMED" && new Date(booking.scheduledAt) > now;

    if (existing) {
      if (isCompleted) {
        existing.totalSessions++;
        if (
          !existing.lastSession ||
          new Date(booking.scheduledAt) > existing.lastSession
        ) {
          existing.lastSession = new Date(booking.scheduledAt);
        }
      }
      if (
        isUpcoming &&
        (!existing.nextSession ||
          new Date(booking.scheduledAt) < existing.nextSession)
      ) {
        existing.nextSession = new Date(booking.scheduledAt);
      }
    } else {
      clientsMap.set(booking.userId, {
        user: booking.user,
        totalSessions: isCompleted ? 1 : 0,
        lastSession: isCompleted ? new Date(booking.scheduledAt) : null,
        nextSession: isUpcoming ? new Date(booking.scheduledAt) : null,
      });
    }
  }

  const clients = Array.from(clientsMap.values()).sort((a, b) => {
    // Trier par prochaine séance, puis par dernière séance
    if (a.nextSession && !b.nextSession) return -1;
    if (!a.nextSession && b.nextSession) return 1;
    if (a.nextSession && b.nextSession) {
      return a.nextSession.getTime() - b.nextSession.getTime();
    }
    if (a.lastSession && b.lastSession) {
      return b.lastSession.getTime() - a.lastSession.getTime();
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">Mes clients</h1>
        <p className="text-muted-foreground mt-1">
          {clients.length} client{clients.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Liste des clients */}
      {clients.length === 0 ? (
        <EmptyState
          title="Aucun client"
          description="Vos clients apparaîtront ici après leurs premières réservations."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((client) => (
            <Card key={client.user.id} className="card-premium">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={client.user.image || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(client.user.name || client.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {client.user.name || "Client"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {client.user.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {client.totalSessions} séance
                        {client.totalSessions > 1 ? "s" : ""}
                      </div>
                      {client.lastSession && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Dernière:{" "}
                          {client.lastSession.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  {client.nextSession && (
                    <Badge>
                      Prochaine:{" "}
                      {client.nextSession.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
