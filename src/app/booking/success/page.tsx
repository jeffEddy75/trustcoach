import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatPrice } from "@/lib/utils";
import { CheckCircle, Calendar, Clock, MapPin, Video, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réservation confirmée | TrustCoach",
  description: "Votre séance de coaching a été réservée avec succès",
};

interface SuccessPageProps {
  searchParams: Promise<{ booking_id?: string; session_id?: string }>;
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const { booking_id } = await searchParams;

  // Vérifier l'authentification
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (!booking_id) {
    redirect("/");
  }

  // Récupérer la réservation
  const booking = await prisma.booking.findUnique({
    where: { id: booking_id },
    include: {
      coach: { include: { user: true } },
      user: true,
    },
  });

  if (!booking) {
    redirect("/");
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (booking.userId !== session.user.id) {
    redirect("/");
  }

  // Formater la date
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

  const formattedDate = dateFormatter.format(booking.scheduledAt);
  const formattedTime = timeFormatter.format(booking.scheduledAt);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Réservation confirmée !
            </h1>
            <p className="text-muted-foreground">
              Votre séance de coaching a été réservée avec succès.
              <br />
              Un email de confirmation vous a été envoyé.
            </p>
          </div>

          {/* Booking details card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Détails de votre séance</CardTitle>
              <CardDescription>
                Conservez ces informations pour le jour de votre séance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coach info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={booking.coach.avatarUrl || booking.coach.user.image || undefined}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials(booking.coach.user.name || booking.coach.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{booking.coach.user.name}</h3>
                  <p className="text-sm text-muted-foreground">{booking.coach.headline}</p>
                </div>
              </div>

              {/* Session details */}
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium capitalize">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">à {formattedTime}</p>
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {booking.mode === "REMOTE" ? "Visioconférence" : "En présentiel"}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {booking.mode === "REMOTE" ? "Remote" : "Sur place"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.mode === "REMOTE"
                        ? "Le lien sera envoyé avant la séance"
                        : booking.location || "Adresse à confirmer"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-muted-foreground">Montant payé</span>
                <span className="font-semibold text-lg">
                  {formatPrice(booking.price)} {booking.currency}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next steps */}
          <Card className="bg-muted/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    1
                  </span>
                  <span>
                    Vérifiez votre email pour les informations de connexion
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    2
                  </span>
                  <span>
                    Préparez vos questions ou sujets à aborder lors de la séance
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    3
                  </span>
                  <span>
                    Connectez-vous 5 minutes avant l&apos;heure prévue
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button asChild className="flex-1">
              <Link href="/user/bookings">
                Voir mes réservations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/coaches">
                Découvrir d&apos;autres coachs
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
