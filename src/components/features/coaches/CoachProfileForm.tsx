"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCoachProfileAction } from "@/actions/coach.actions";
import type { Coach } from "@prisma/client";
import type { CoachProfileInput } from "@/validations/coach.schema";
import { Loader2, Plus, X, Building2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CoachProfileFormProps {
  coach: Coach;
}

const INTERVENTION_MODE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Coaching individuel",
  TEAM: "Coaching d'équipe",
  ORGANIZATION: "Coaching d'organisation",
  GROUP: "Ateliers collectifs",
};

const TARGET_AUDIENCE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Particuliers (B2C)",
  EXECUTIVE: "Dirigeants / Cadres sup",
  MANAGER: "Managers intermédiaires",
  EMPLOYEE: "Collaborateurs",
  ENTREPRENEUR: "Entrepreneurs / Indépendants",
};

const SPECIALTIES_SUGGESTIONS = [
  "Gestion du stress",
  "Confiance en soi",
  "Leadership",
  "Communication",
  "Gestion des conflits",
  "Prise de parole",
  "Gestion du temps",
  "Reconversion professionnelle",
  "Burn-out",
  "Développement personnel",
  "Management",
  "Intelligence émotionnelle",
];

const METHODOLOGIES_SUGGESTIONS = [
  "MBTI",
  "Process Com",
  "Ennéagramme",
  "360° Feedback",
  "PNL",
  "Analyse Transactionnelle",
  "Approche systémique",
  "CNV",
  "Co-développement",
  "Coaching cognitif",
];

export function CoachProfileForm({ coach }: CoachProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState<CoachProfileInput>({
    bio: coach.bio || "",
    headline: coach.headline || "",
    specialties: coach.specialties,
    languages: coach.languages,
    methodologies: coach.methodologies,
    interventionModes: coach.interventionModes,
    targetAudience: coach.targetAudience,
    acceptsCorporate: coach.acceptsCorporate,
    hourlyRate: coach.hourlyRate,
    dailyRate: coach.dailyRate,
    city: coach.city || "",
    country: coach.country || "FR",
    timezone: coach.timezone,
    offersInPerson: coach.offersInPerson,
    offersRemote: coach.offersRemote,
    // Informations légales
    legalName: coach.legalName || "",
    siret: coach.siret || "",
    businessAddress: coach.businessAddress || "",
    vatExempt: coach.vatExempt ?? true,
  });

  // Input temporaires pour ajouter des éléments aux arrays
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newMethodology, setNewMethodology] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateCoachProfileAction(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Profil mis à jour");
      router.refresh();
    });
  };

  const addSpecialty = () => {
    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty],
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }));
  };

  const addMethodology = () => {
    if (newMethodology && !formData.methodologies.includes(newMethodology)) {
      setFormData((prev) => ({
        ...prev,
        methodologies: [...prev.methodologies, newMethodology],
      }));
      setNewMethodology("");
    }
  };

  const removeMethodology = (methodology: string) => {
    setFormData((prev) => ({
      ...prev,
      methodologies: prev.methodologies.filter((m) => m !== methodology),
    }));
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.toLowerCase()],
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== language),
    }));
  };

  const toggleInterventionMode = (mode: string) => {
    setFormData((prev) => {
      const modes = prev.interventionModes as string[];
      if (modes.includes(mode)) {
        return {
          ...prev,
          interventionModes: modes.filter((m) => m !== mode) as typeof prev.interventionModes,
        };
      }
      return {
        ...prev,
        interventionModes: [...modes, mode] as typeof prev.interventionModes,
      };
    });
  };

  const toggleTargetAudience = (audience: string) => {
    setFormData((prev) => {
      const audiences = prev.targetAudience as string[];
      if (audiences.includes(audience)) {
        return {
          ...prev,
          targetAudience: audiences.filter((a) => a !== audience) as typeof prev.targetAudience,
        };
      }
      return {
        ...prev,
        targetAudience: [...audiences, audience] as typeof prev.targetAudience,
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headline">Titre professionnel</Label>
            <Input
              id="headline"
              placeholder="Coach en développement personnel"
              value={formData.headline || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, headline: e.target.value }))
              }
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Apparaît sous votre nom sur votre profil public.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Présentez-vous, votre parcours et votre approche du coaching..."
              value={formData.bio || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio?.length || 0}/2000 caractères
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Spécialités */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Spécialités</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="gap-1">
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(specialty)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une spécialité"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSpecialty();
                }
              }}
              list="specialties-suggestions"
            />
            <Button type="button" variant="outline" onClick={addSpecialty}>
              <Plus className="h-4 w-4" />
            </Button>
            <datalist id="specialties-suggestions">
              {SPECIALTIES_SUGGESTIONS.filter(
                (s) => !formData.specialties.includes(s)
              ).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </CardContent>
      </Card>

      {/* Méthodologies */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Méthodologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.methodologies.map((method) => (
              <Badge key={method} variant="outline" className="gap-1">
                {method}
                <button
                  type="button"
                  onClick={() => removeMethodology(method)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une méthodologie"
              value={newMethodology}
              onChange={(e) => setNewMethodology(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMethodology();
                }
              }}
              list="methodologies-suggestions"
            />
            <Button type="button" variant="outline" onClick={addMethodology}>
              <Plus className="h-4 w-4" />
            </Button>
            <datalist id="methodologies-suggestions">
              {METHODOLOGIES_SUGGESTIONS.filter(
                (m) => !formData.methodologies.includes(m)
              ).map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
        </CardContent>
      </Card>

      {/* Tarification */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Tarification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Tarif horaire</Label>
              <div className="relative">
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="80"
                  value={formData.hourlyRate ? formData.hourlyRate / 100 : ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hourlyRate: e.target.value
                        ? Math.round(parseFloat(e.target.value) * 100)
                        : null,
                    }))
                  }
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  /h
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyRate">Tarif journalier (B2B)</Label>
              <div className="relative">
                <Input
                  id="dailyRate"
                  type="number"
                  placeholder="1500"
                  value={formData.dailyRate ? formData.dailyRate / 100 : ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dailyRate: e.target.value
                        ? Math.round(parseFloat(e.target.value) * 100)
                        : null,
                    }))
                  }
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  /jour
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localisation */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Localisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="Paris"
                value={formData.city || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Select
                value={formData.country}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, country: value }))
                }
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="BE">Belgique</SelectItem>
                  <SelectItem value="CH">Suisse</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="LU">Luxembourg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Sélectionner un fuseau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Paris">
                  Europe/Paris (UTC+1)
                </SelectItem>
                <SelectItem value="Europe/Brussels">
                  Europe/Brussels (UTC+1)
                </SelectItem>
                <SelectItem value="Europe/Zurich">
                  Europe/Zurich (UTC+1)
                </SelectItem>
                <SelectItem value="America/Montreal">
                  America/Montreal (UTC-5)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Langues */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Langues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="gap-1">
                {lang.toUpperCase()}
                <button
                  type="button"
                  onClick={() => removeLanguage(lang)}
                  className="ml-1 hover:text-destructive"
                  disabled={formData.languages.length <= 1}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une langue (ex: en)"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLanguage();
                }
              }}
              maxLength={5}
            />
            <Button type="button" variant="outline" onClick={addLanguage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modes de coaching */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Modes de coaching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Visioconférence</Label>
              <p className="text-sm text-muted-foreground">
                Vous proposez des séances à distance
              </p>
            </div>
            <Switch
              checked={formData.offersRemote}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, offersRemote: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Présentiel</Label>
              <p className="text-sm text-muted-foreground">
                Vous proposez des séances en personne
              </p>
            </div>
            <Switch
              checked={formData.offersInPerson}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, offersInPerson: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* B2B Options */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Options B2B</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Accepter les missions entreprise</Label>
              <p className="text-sm text-muted-foreground">
                Visible dans les recherches B2B
              </p>
            </div>
            <Switch
              checked={formData.acceptsCorporate}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, acceptsCorporate: checked }))
              }
            />
          </div>

          {formData.acceptsCorporate && (
            <>
              <div className="space-y-2">
                <Label>Modes d&apos;intervention</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(INTERVENTION_MODE_LABELS).map(
                    ([mode, label]) => (
                      <Badge
                        key={mode}
                        variant={
                          (formData.interventionModes as string[]).includes(mode)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleInterventionMode(mode)}
                      >
                        {label}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Public cible</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TARGET_AUDIENCE_LABELS).map(
                    ([audience, label]) => (
                      <Badge
                        key={audience}
                        variant={
                          (formData.targetAudience as string[]).includes(audience)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleTargetAudience(audience)}
                      >
                        {label}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informations légales */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations légales (Facturation)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ces informations sont nécessaires pour générer des factures à vos
              clients. Elles apparaîtront sur vos factures conformément à la
              législation française.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="legalName">Nom légal *</Label>
            <Input
              id="legalName"
              placeholder="Jean Dupont EI"
              value={formData.legalName || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, legalName: e.target.value }))
              }
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Doit inclure &quot;EI&quot; ou &quot;Entrepreneur Individuel&quot;
              (obligatoire depuis mai 2022). Exemple: &quot;Jean Dupont EI&quot;
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET *</Label>
            <Input
              id="siret"
              placeholder="12345678901234"
              value={formData.siret || ""}
              onChange={(e) => {
                // Ne garder que les chiffres
                const value = e.target.value.replace(/\D/g, "").slice(0, 14);
                setFormData((prev) => ({ ...prev, siret: value }));
              }}
              maxLength={14}
            />
            <p className="text-xs text-muted-foreground">
              14 chiffres, sans espaces. Trouvez-le sur{" "}
              <a
                href="https://www.societe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                societe.com
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Adresse professionnelle</Label>
            <Textarea
              id="businessAddress"
              placeholder="123 rue Example, 75001 Paris"
              value={formData.businessAddress || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  businessAddress: e.target.value,
                }))
              }
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Franchise de TVA</Label>
              <p className="text-sm text-muted-foreground">
                Je bénéficie de la franchise en base de TVA (art. 293 B du CGI)
              </p>
            </div>
            <Switch
              checked={formData.vatExempt}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, vatExempt: checked }))
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Si activé, vos factures afficheront &quot;TVA non applicable, art.
            293 B du CGI&quot;. La plupart des auto-entrepreneurs et
            micro-entreprises en bénéficient.
          </p>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
