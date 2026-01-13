import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Calendar, Clock, Star, FileText, Loader2 } from "lucide-react";
import { SessionRecorder } from "@/components/features/session/SessionRecorder";
import { SummaryView } from "@/components/features/session/SummaryView";
import type { Metadata } from "next";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: { booking: { include: { coach: { include: { user: true } } } } },
  });

  if (!session) {
    return { title: "Session non trouvée | TrustCoach" };
  }

  return {
    title: `Séance avec ${session.booking.coach.user.name} | TrustCoach`,
    description: "Enregistrement et résumé de votre séance de coaching",
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  IDLE: { label: "Prêt à enregistrer", color: "bg-gray-100 text-gray-800" },
  RECORDING: { label: "Enregistrement", color: "bg-red-100 text-red-800" },
  UPLOADING: { label: "Upload en cours", color: "bg-blue-100 text-blue-800" },
  TRANSCRIBING: { label: "Transcription", color: "bg-purple-100 text-purple-800" },
  SUMMARIZING: { label: "Génération du résumé", color: "bg-purple-100 text-purple-800" },
  COMPLETED: { label: "Terminé", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Erreur", color: "bg-red-100 text-red-800" },
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  const authSession = await auth();
  if (!authSession?.user) {
    redirect("/login");
  }

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          coach: { include: { user: true } },
          user: true,
        },
      },
      consents: true,
      markedMoments: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!session) {
    notFound();
  }

  // Vérifier les droits
  const isOwner = session.booking.userId === authSession.user.id;
  const isCoach = session.booking.coach.userId === authSession.user.id;

  if (!isOwner && !isCoach) {
    redirect("/user/bookings");
  }

  const booking = session.booking;
  const coach = booking.coach;
  const defaultStatus = { label: "Prêt", color: "bg-gray-100 text-gray-800" };
  const statusInfo = statusLabels[session.status] ?? defaultStatus;

  // Vérifier si les consentements ont été donnés
  const hasConsents = session.consents.length >= 3;

  // Formater la date
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={coach.avatarUrl || coach.user.image || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(coach.user.name || coach.user.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Séance avec {coach.user.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">
                {dateFormatter.format(booking.scheduledAt)}
              </span>
            </div>
          </div>
        </div>
        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
      </div>

      {/* Contenu principal */}
      {session.status === "COMPLETED" && session.summaryRaw ? (
        // Afficher le résumé
        <SummaryView
          session={session}
          isCoach={isCoach}
          markedMoments={session.markedMoments}
        />
      ) : session.status === "IDLE" || session.status === "RECORDING" ? (
        // Enregistrement
        <SessionRecorder
          sessionId={session.id}
          bookingId={booking.id}
          coachName={coach.user.name || "Coach"}
          hasConsents={hasConsents}
        />
      ) : (
        // En cours de traitement
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  Traitement en cours
                </h2>
                <p className="text-muted-foreground mt-1">
                  {session.status === "UPLOADING" && "Upload de l'audio..."}
                  {session.status === "TRANSCRIBING" && "Transcription en cours..."}
                  {session.status === "SUMMARIZING" && "Génération du résumé IA..."}
                  {session.status === "FAILED" && session.statusMessage}
                </p>
              </div>
              {session.status !== "FAILED" && (
                <p className="text-sm text-muted-foreground">
                  Cela peut prendre quelques minutes. Vous recevrez une notification
                  lorsque le résumé sera prêt.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Infos supplémentaires */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Détails de la séance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durée prévue</span>
              <span>{booking.duration} minutes</span>
            </div>
            {session.audioDuration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durée enregistrée</span>
                <span>
                  {Math.floor(session.audioDuration / 60)} min{" "}
                  {session.audioDuration % 60} sec
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span>{booking.mode === "REMOTE" ? "Visio" : "Présentiel"}</span>
            </div>
          </CardContent>
        </Card>

        {session.markedMoments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4" />
                Moments marqués ({session.markedMoments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {session.markedMoments.map((moment, i) => (
                  <div
                    key={moment.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Badge variant="outline" className="font-mono">
                      {Math.floor(moment.timestamp / 60)}:
                      {(moment.timestamp % 60).toString().padStart(2, "0")}
                    </Badge>
                    <span className="text-muted-foreground">
                      {moment.note || `Moment ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
