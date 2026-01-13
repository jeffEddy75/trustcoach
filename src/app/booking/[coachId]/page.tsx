import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingForm } from "@/components/features/booking/BookingForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, formatPrice } from "@/lib/utils";
import { Award, ArrowLeft, Star } from "lucide-react";
import type { Metadata } from "next";

interface BookingPageProps {
  params: Promise<{ coachId: string }>;
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { coachId } = await params;

  const coach = await prisma.coach.findUnique({
    where: { id: coachId },
    include: { user: true },
  });

  if (!coach) {
    return { title: "Réservation | TrustCoach" };
  }

  return {
    title: `Réserver avec ${coach.user.name} | TrustCoach`,
    description: `Réservez une séance de coaching avec ${coach.user.name}`,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { coachId } = await params;

  // Vérifier l'authentification
  const user = await getCurrentDbUser();
  if (!user) {
    redirect(`/sign-in?redirect_url=/booking/${coachId}`);
  }

  // Récupérer le coach
  const coach = await prisma.coach.findUnique({
    where: { id: coachId },
    include: {
      user: true,
      availabilities: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!coach || !coach.verified) {
    notFound();
  }

  // Vérifier que l'utilisateur ne réserve pas chez lui-même
  if (coach.userId === user.id) {
    redirect(`/coaches/${coachId}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href={`/coaches/${coachId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au profil
          </Link>

          {/* Coach header */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-16 w-16">
              <AvatarImage src={coach.avatarUrl || coach.user.image || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(coach.user.name || coach.user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold">
                  Réserver avec {coach.user.name}
                </h1>
                {coach.verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <Award className="mr-1 h-3 w-3" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{coach.headline}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                {coach.averageRating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent fill-accent" />
                    {coach.averageRating.toFixed(1)}
                  </span>
                )}
                <span>
                  {coach.hourlyRate ? `${formatPrice(coach.hourlyRate)}/h` : "Tarif sur demande"}
                </span>
              </div>
            </div>
          </div>

          {/* Booking form */}
          <BookingForm coach={coach} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
