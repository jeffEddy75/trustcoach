import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatPrice } from "@/lib/utils";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  MapPin,
  Star,
  Users,
  Video,
} from "lucide-react";
import type { Metadata } from "next";

interface CoachProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CoachProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  const coach = await prisma.coach.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!coach) {
    return { title: "Coach non trouvé | TrustCoach" };
  }

  return {
    title: `${coach.user.name} - ${coach.headline || "Coach"} | TrustCoach`,
    description: coach.bio?.slice(0, 160) || `Découvrez le profil de ${coach.user.name} sur TrustCoach`,
  };
}

export default async function CoachProfilePage({ params }: CoachProfilePageProps) {
  const { id } = await params;

  const coach = await prisma.coach.findUnique({
    where: { id },
    include: {
      user: true,
      certifications: {
        orderBy: { year: "desc" },
      },
      references: {
        where: { canDisplay: true },
        orderBy: { year: "desc" },
      },
    },
  });

  if (!coach || !coach.verified) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={coach.avatarUrl || coach.user.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {getInitials(coach.user.name || coach.user.email)}
                </AvatarFallback>
              </Avatar>

              {/* Infos principales */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="font-heading text-3xl font-bold">
                    {coach.user.name}
                  </h1>
                  {coach.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Award className="mr-1 h-3 w-3" />
                      {coach.badgeLevel === "PREMIUM"
                        ? "Premium"
                        : coach.badgeLevel === "VERIFIED"
                          ? "Vérifié"
                          : "Certifié"}
                    </Badge>
                  )}
                  {coach.acceptsCorporate && (
                    <Badge variant="outline">
                      <Building2 className="mr-1 h-3 w-3" />
                      B2B
                    </Badge>
                  )}
                </div>

                <p className="text-lg text-muted-foreground mb-4">
                  {coach.headline}
                </p>

                {/* Infos rapides */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {coach.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {coach.city}, {coach.country}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {coach.languages.map((l) => l.toUpperCase()).join(", ")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    {coach.offersRemote && coach.offersInPerson
                      ? "Visio & Présentiel"
                      : coach.offersRemote
                        ? "Visio"
                        : "Présentiel"}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-4">
                  {coach.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-accent fill-accent" />
                      <span className="font-bold text-lg">
                        {coach.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {coach.totalSessions > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{coach.totalSessions} séances réalisées</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Card */}
              <Card className="w-full md:w-72 card-premium">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold">
                      {coach.hourlyRate ? formatPrice(coach.hourlyRate) : "—"}
                    </p>
                    <p className="text-muted-foreground">par heure</p>
                  </div>
                  {coach.dailyRate && (
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Tarif journalier : {formatPrice(coach.dailyRate)}
                    </p>
                  )}
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/booking/${coach.id}`}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Réserver une séance
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Bio */}
            {coach.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {coach.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Spécialités */}
            {coach.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Spécialités</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-sm py-1 px-3">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Méthodologies */}
            {coach.methodologies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Méthodologies & Outils</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {coach.methodologies.map((method) => (
                      <Badge key={method} variant="outline" className="text-sm py-1 px-3">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {method}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modes d'intervention B2B */}
            {coach.acceptsCorporate && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Interventions entreprise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Modes d&apos;intervention</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.interventionModes.map((mode) => (
                        <Badge key={mode} variant="secondary">
                          {mode === "INDIVIDUAL" && "Coaching individuel"}
                          {mode === "TEAM" && "Coaching d'équipe"}
                          {mode === "ORGANIZATION" && "Coaching d'organisation"}
                          {mode === "GROUP" && "Ateliers collectifs"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Public accompagné</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.targetAudience.map((audience) => (
                        <Badge key={audience} variant="outline">
                          {audience === "INDIVIDUAL" && "Particuliers"}
                          {audience === "EXECUTIVE" && "Dirigeants"}
                          {audience === "MANAGER" && "Managers"}
                          {audience === "EMPLOYEE" && "Collaborateurs"}
                          {audience === "ENTREPRENEUR" && "Entrepreneurs"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {coach.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Certifications & Diplômes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coach.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-start justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer}
                            {cert.year && ` • ${cert.year}`}
                          </p>
                        </div>
                        {cert.verified && (
                          <Badge className="bg-green-100 text-green-800 shrink-0">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Vérifiée
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Références entreprises */}
            {coach.references.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Références</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coach.references.map((ref) => (
                      <div
                        key={ref.id}
                        className="p-4 bg-muted/50 rounded-lg"
                      >
                        <p className="font-medium">{ref.companyName}</p>
                        {ref.sector && (
                          <p className="text-sm text-muted-foreground">{ref.sector}</p>
                        )}
                        {ref.missionType && (
                          <p className="text-sm mt-1">{ref.missionType}</p>
                        )}
                        {ref.testimonial && (
                          <blockquote className="mt-2 text-sm italic text-muted-foreground border-l-2 border-primary pl-3">
                            &ldquo;{ref.testimonial}&rdquo;
                            {ref.contactName && (
                              <footer className="mt-1 not-italic">— {ref.contactName}</footer>
                            )}
                          </blockquote>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vidéo de présentation */}
            {coach.videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Vidéo de présentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">
                      <a
                        href={coach.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Voir la vidéo
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA Bottom */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="font-heading text-xl font-semibold mb-2">
                  Prêt à commencer votre accompagnement ?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Réservez une première séance avec {coach.user.name?.split(" ")[0]}
                </p>
                <Button size="lg" asChild>
                  <Link href={`/booking/${coach.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Réserver maintenant
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
