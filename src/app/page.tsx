import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Mic, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Le coaching augmenté par l&apos;IA
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              <span className="block">TrustCoach</span>
              <span className="block text-secondary">
                Le tiers de confiance du coaching
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Trouvez votre coach, réservez vos séances et bénéficiez de résumés
              IA personnalisés. Vivez votre séance à 100%, l&apos;app retient pour
              vous.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link href="/coaches">
                  Trouver un coach
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Je suis coach</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Pourquoi TrustCoach ?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Une plateforme pensée pour maximiser l&apos;impact de votre
              accompagnement
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="card-hover card-premium border-subtle">
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                  <Shield className="h-7 w-7 text-secondary" />
                </div>
                <CardTitle className="font-heading text-xl">Coachs vérifiés</CardTitle>
                <CardDescription className="text-base">
                  Diplômes vérifiés, avis authentiques. Choisissez en toute
                  confiance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover card-premium border-subtle">
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                  <Mic className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="font-heading text-xl">Résumés IA</CardTitle>
                <CardDescription className="text-base">
                  Enregistrez vos séances et recevez un résumé structuré. Ne
                  perdez plus aucun insight.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover card-premium border-subtle">
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Star className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="font-heading text-xl">
                  Suivi personnalisé
                </CardTitle>
                <CardDescription className="text-base">
                  Timeline de progression, rappels contextuels et check-ins pour
                  rester motivé.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground rounded-3xl overflow-hidden">
            <CardContent className="py-16 text-center">
              <h2 className="font-heading text-3xl font-bold">
                Prêt à commencer votre parcours ?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Rejoignez des centaines de personnes qui ont transformé leur vie
                avec un coach certifié.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-8"
                asChild
              >
                <Link href="/coaches">Découvrir les coachs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="font-heading font-semibold text-foreground">
              TrustCoach
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TrustCoach. Tous droits
              réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
