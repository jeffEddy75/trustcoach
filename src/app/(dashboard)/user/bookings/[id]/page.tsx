import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CancelBookingButton } from "@/components/features/booking/CancelBookingButton";
import { PayBookingButton } from "@/components/features/booking/PayBookingButton";
import { StartSessionButton } from "@/components/features/session/StartSessionButton";
import { getInitials, formatPrice } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { Metadata } from "next";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BookingDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { coach: { include: { user: true } } },
  });

  if (!booking) {
    return { title: "Réservation non trouvée | TrustCoach" };
  }

  return {
    title: `Réservation avec ${booking.coach.user.name} | TrustCoach`,
    description: `Détails de votre séance de coaching`,
  };
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  PENDING: { label: "En attente de paiement", variant: "outline", icon: AlertCircle },
  PAYMENT_FAILED: { label: "Échec paiement", variant: "destructive", icon: XCircle },
  CONFIRMED: { label: "Confirmée", variant: "default", icon: CheckCircle },
  IN_PROGRESS: { label: "En cours", variant: "secondary", icon: Clock },
  COMPLETED: { label: "Terminée", variant: "secondary", icon: CheckCircle },
  CANCELLED: { label: "Annulée", variant: "destructive", icon: XCircle },
  NO_SHOW: { label: "Absent", variant: "destructive", icon: XCircle },
  REFUNDED: { label: "Remboursée", variant: "outline", icon: CreditCard },
  PARTIALLY_REFUNDED: { label: "Partiellement remboursée", variant: "outline", icon: CreditCard },
};

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      coach: { include: { user: true } },
      user: true,
      session: true,
    },
  });

  if (!booking) {
    notFound();
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (booking.userId !== session.user.id) {
    redirect("/user/bookings");
  }

  const defaultStatus = { label: "En attente", variant: "outline" as const, icon: AlertCircle };
  const status = statusConfig[booking.status] || defaultStatus;
  const StatusIcon = status.icon;

  // Calculer si l'annulation est possible (> 24h avant la séance)
  const now = new Date();
  const scheduledDate = new Date(booking.scheduledAt);
  const hoursUntilSession = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel =
    hoursUntilSession > 24 &&
    (booking.status === "PENDING" || booking.status === "CONFIRMED");

  // Peut payer si statut PENDING ou PAYMENT_FAILED
  const canPay = booking.status === "PENDING" || booking.status === "PAYMENT_FAILED";

  // Peut démarrer la séance si confirmée ou IN_PROGRESS
  // En prod, on pourrait ajouter une contrainte de temps (ex: ±30 min)
  const canStartSession =
    booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS";

  // Formater les dates
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/user/bookings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux réservations
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Détails de la réservation</h1>
          <p className="text-muted-foreground mt-1">
            Séance avec {booking.coach.user.name}
          </p>
        </div>
        <Badge variant={status.variant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations de la séance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Coach */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={booking.coach.avatarUrl || booking.coach.user.image || undefined}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(booking.coach.user.name || booking.coach.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-lg">{booking.coach.user.name}</p>
                <p className="text-sm text-muted-foreground">{booking.coach.headline}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/coaches/${booking.coachId}`}>Voir le profil</Link>
              </Button>
            </div>

            {/* Details */}
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium capitalize">
                    {dateFormatter.format(scheduledDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    à {timeFormatter.format(scheduledDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{booking.duration} minutes</p>
                  <p className="text-sm text-muted-foreground">Durée de la séance</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {booking.mode === "REMOTE" ? (
                  <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {booking.mode === "REMOTE" ? "Visioconférence" : "En présentiel"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.mode === "REMOTE"
                      ? booking.meetingUrl
                        ? "Lien disponible"
                        : "Le lien sera envoyé avant la séance"
                      : booking.location || "Adresse à confirmer"}
                  </p>
                </div>
              </div>
            </div>

            {/* Meeting URL if available */}
            {booking.meetingUrl && booking.status === "CONFIRMED" && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Rejoindre la séance</h3>
                  <Button asChild className="w-full">
                    <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" />
                      Ouvrir le lien de visio
                    </a>
                  </Button>
                </div>
              </>
            )}

            {/* Start/Resume session button */}
            {canStartSession && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Enregistrement de la séance</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Démarrez l'enregistrement pour obtenir un résumé IA de votre séance.
                  </p>
                  <StartSessionButton
                    bookingId={booking.id}
                    existingSessionId={booking.session?.id}
                  />
                </div>
              </>
            )}

            {/* Session link - show if session exists */}
            {booking.session && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">
                    {booking.session.summaryFinal
                      ? "Résumé de la séance"
                      : booking.session.status === "COMPLETED"
                        ? "Résumé en attente de validation"
                        : "Séance en cours"}
                  </h3>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/user/sessions/${booking.session.id}`}>
                      {booking.session.summaryFinal
                        ? "Voir le résumé IA"
                        : "Voir la séance"}
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Payment info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-semibold text-lg">
                  {formatPrice(booking.price)} {booking.currency}
                </span>
              </div>

              {booking.paidAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payé le</span>
                  <span>
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(booking.paidAt)}
                  </span>
                </div>
              )}

              {canPay && (
                <PayBookingButton bookingId={booking.id} />
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
              <CardDescription>
                {canCancel
                  ? "Vous pouvez annuler jusqu'à 24h avant la séance"
                  : hoursUntilSession <= 24 && hoursUntilSession > 0
                  ? "Annulation impossible (moins de 24h)"
                  : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {canCancel && (
                <CancelBookingButton bookingId={booking.id} />
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/coaches/${booking.coachId}`}>
                  Réserver à nouveau
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
