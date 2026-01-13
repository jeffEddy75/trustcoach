import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, formatPrice } from "@/lib/utils";
import {
  MapPin,
  Globe,
  Video,
  Building2,
  Award,
  Star,
  Pencil,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil coach | TrustCoach",
  description: "Gérez votre profil de coach",
};

export default async function CoachProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      certifications: true,
      references: true,
    },
  });

  if (!coach) {
    redirect("/user");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Mon profil coach</h1>
          <p className="text-muted-foreground mt-1">
            Votre profil public visible par les clients.
          </p>
        </div>
        <Button asChild>
          <Link href="/coach/profile/edit">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* Profil principal */}
      <Card className="card-premium">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar et infos principales */}
            <div className="flex items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={coach.avatarUrl || coach.user.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(coach.user.name || coach.user.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  {coach.user.name}
                </h2>
                <p className="text-muted-foreground">{coach.headline}</p>
                <div className="flex items-center gap-2 mt-2">
                  {coach.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Award className="mr-1 h-3 w-3" />
                      {coach.badgeLevel === "PREMIUM"
                        ? "Premium"
                        : coach.badgeLevel === "VERIFIED"
                          ? "Vérifié"
                          : "Standard"}
                    </Badge>
                  )}
                  {coach.acceptsCorporate && (
                    <Badge variant="outline">
                      <Building2 className="mr-1 h-3 w-3" />
                      B2B
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="md:ml-auto flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{coach.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Séances</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {coach.averageRating ? (
                    <span className="flex items-center justify-center">
                      {coach.averageRating.toFixed(1)}
                      <Star className="h-4 w-4 ml-1 text-accent fill-accent" />
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Note</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio et infos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {coach.bio || "Aucune bio renseignée."}
            </p>
          </CardContent>
        </Card>

        {/* Infos pratiques */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Localisation */}
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {coach.city || "Non renseignée"}, {coach.country}
                </p>
                <p className="text-sm text-muted-foreground">Localisation</p>
              </div>
            </div>

            {/* Langues */}
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{coach.languages.join(", ")}</p>
                <p className="text-sm text-muted-foreground">Langues</p>
              </div>
            </div>

            {/* Modes */}
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {[
                    coach.offersRemote && "Visio",
                    coach.offersInPerson && "Présentiel",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Modes de coaching
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spécialités */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Spécialités</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {coach.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Méthodologies */}
      {coach.methodologies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Méthodologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {coach.methodologies.map((method) => (
                <Badge key={method} variant="outline">
                  {method}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tarifs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Tarifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tarif horaire</p>
              <p className="text-xl font-bold">
                {coach.hourlyRate ? formatPrice(coach.hourlyRate) : "—"}/h
              </p>
            </div>
            {coach.dailyRate && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Tarif journalier (B2B)
                </p>
                <p className="text-xl font-bold">
                  {formatPrice(coach.dailyRate)}/jour
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      {coach.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coach.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer}
                      {cert.year && ` • ${cert.year}`}
                    </p>
                  </div>
                  {cert.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      Vérifiée
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
