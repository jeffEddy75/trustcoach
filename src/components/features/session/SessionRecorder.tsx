"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "./AudioRecorder";
import { ConsentModal, type ConsentType } from "./ConsentModal";
import { createSessionAction, saveConsentsAction } from "@/actions/session.actions";
import { Shield, Loader2 } from "lucide-react";

interface SessionRecorderProps {
  sessionId: string;
  bookingId: string;
  coachName: string;
  hasConsents: boolean;
}

export function SessionRecorder({
  sessionId,
  bookingId,
  coachName,
  hasConsents: initialHasConsents,
}: SessionRecorderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsents, setHasConsents] = useState(initialHasConsents);

  const handleConsentSubmit = async (consents: ConsentType) => {
    startTransition(async () => {
      const result = await saveConsentsAction(sessionId, consents);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setHasConsents(true);
      setShowConsentModal(false);
      toast.success("Consentements enregistrés");
    });
  };

  const handleRecordingComplete = async (
    blob: Blob,
    markedMoments: { timestamp: number; note?: string }[]
  ) => {
    setIsUploading(true);

    try {
      // Créer le FormData
      const formData = new FormData();
      formData.append("audio", blob, `session-${sessionId}.webm`);
      formData.append("sessionId", sessionId);
      formData.append("markedMoments", JSON.stringify(markedMoments));

      // Envoyer au serveur
      const response = await fetch("/api/sessions/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors du traitement");
      }

      toast.success("Enregistrement traité avec succès !");
      router.refresh();
    } catch (error) {
      console.error("[UPLOAD_ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'envoi"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Si pas de consentements, afficher le bouton pour les donner
  if (!hasConsents) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Consentement requis
            </CardTitle>
            <CardDescription>
              Avant de démarrer l&apos;enregistrement, vous devez donner votre
              consentement pour le traitement de vos données.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowConsentModal(true)} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              Donner mon consentement
            </Button>
          </CardContent>
        </Card>

        <ConsentModal
          open={showConsentModal}
          onOpenChange={setShowConsentModal}
          onConsent={handleConsentSubmit}
          coachName={coachName}
        />
      </>
    );
  }

  // Enregistreur audio
  return (
    <Card className="card-premium">
      <CardHeader>
        <CardTitle>Enregistrement de la séance</CardTitle>
        <CardDescription>
          Enregistrez votre séance pour obtenir un résumé IA personnalisé.
          Vous pouvez marquer les moments importants pendant l&apos;enregistrement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          isUploading={isUploading}
          disabled={isUploading}
        />
      </CardContent>
    </Card>
  );
}
