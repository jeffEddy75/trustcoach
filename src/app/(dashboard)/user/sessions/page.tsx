import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/features/common/EmptyState";
import { FileText, Star, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes séances | TrustCoach",
  description: "Retrouvez vos résumés de séances de coaching",
};

export default async function UserSessionsPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    return null;
  }

  const sessions = await prisma.session.findMany({
    where: {
      booking: {
        userId: user.id,
      },
    },
    include: {
      booking: {
        include: {
          coach: {
            include: { user: true },
          },
        },
      },
      markedMoments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">Mes séances</h1>
        <p className="text-muted-foreground mt-1">
          Retrouvez les résumés IA de vos séances de coaching.
        </p>
      </div>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <EmptyState
          title="Aucune séance"
          description="Vos résumés de séances apparaîtront ici après vos premières séances de coaching."
          action={{
            label: "Trouver un coach",
            href: "/coaches",
          }}
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((sessionItem) => (
            <Card key={sessionItem.id} className="card-premium">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-semibold">
                      Séance avec {sessionItem.booking.coach.user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        sessionItem.booking.scheduledAt
                      ).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      sessionItem.status === "COMPLETED"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {sessionItem.status === "COMPLETED"
                      ? "Résumé disponible"
                      : sessionItem.status === "SUMMARIZING"
                        ? "En cours..."
                        : "En attente"}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  {sessionItem.audioDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round(sessionItem.audioDuration / 60)} min
                    </div>
                  )}
                  {sessionItem.markedMoments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent" />
                      {sessionItem.markedMoments.length} moment
                      {sessionItem.markedMoments.length > 1 ? "s" : ""} marqué
                      {sessionItem.markedMoments.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Résumé preview */}
                {sessionItem.summaryFinal && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <p className="text-sm line-clamp-3 font-accent italic">
                      {sessionItem.summaryFinal.slice(0, 200)}...
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button asChild>
                    <Link href={`/user/sessions/${sessionItem.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Voir le résumé
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
