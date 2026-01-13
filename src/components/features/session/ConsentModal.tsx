"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Mic, Brain, Share2 } from "lucide-react";

export interface ConsentType {
  audioRecording: boolean;
  dataProcessing: boolean;
  summarySharing: boolean;
}

interface ConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: (consents: ConsentType) => void;
  coachName: string;
}

export function ConsentModal({
  open,
  onOpenChange,
  onConsent,
  coachName,
}: ConsentModalProps) {
  const [consents, setConsents] = useState<ConsentType>({
    audioRecording: false,
    dataProcessing: false,
    summarySharing: false,
  });

  const allChecked =
    consents.audioRecording &&
    consents.dataProcessing &&
    consents.summarySharing;

  const handleCheckAll = (checked: boolean) => {
    setConsents({
      audioRecording: checked,
      dataProcessing: checked,
      summarySharing: checked,
    });
  };

  const handleConsent = () => {
    if (allChecked) {
      onConsent(consents);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Consentement RGPD</span>
          </div>
          <DialogTitle>Enregistrement de la séance</DialogTitle>
          <DialogDescription>
            Pour bénéficier du résumé IA de votre séance avec {coachName}, nous
            avons besoin de votre consentement explicite.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Audio Recording */}
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
            <Mic className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="audio"
                  checked={consents.audioRecording}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({
                      ...prev,
                      audioRecording: checked === true,
                    }))
                  }
                />
                <Label htmlFor="audio" className="font-medium cursor-pointer">
                  Enregistrement audio
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                J&apos;accepte que la séance soit enregistrée. L&apos;audio sera
                conservé de manière sécurisée.
              </p>
            </div>
          </div>

          {/* Data Processing */}
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
            <Brain className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="processing"
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({
                      ...prev,
                      dataProcessing: checked === true,
                    }))
                  }
                />
                <Label htmlFor="processing" className="font-medium cursor-pointer">
                  Traitement par IA
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                J&apos;accepte que l&apos;audio soit transcrit et analysé par une
                intelligence artificielle pour générer un résumé.
              </p>
            </div>
          </div>

          {/* Summary Sharing */}
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
            <Share2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sharing"
                  checked={consents.summarySharing}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({
                      ...prev,
                      summarySharing: checked === true,
                    }))
                  }
                />
                <Label htmlFor="sharing" className="font-medium cursor-pointer">
                  Partage du résumé
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                J&apos;accepte que le résumé soit partagé avec mon coach pour le
                suivi de mon accompagnement.
              </p>
            </div>
          </div>

          {/* Check all */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Checkbox
              id="all"
              checked={allChecked}
              onCheckedChange={(checked) => handleCheckAll(checked === true)}
            />
            <Label htmlFor="all" className="text-sm cursor-pointer">
              Accepter tous les consentements
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConsent}
            disabled={!allChecked}
            className="w-full sm:w-auto"
          >
            Confirmer et continuer
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Vous pouvez révoquer ces consentements à tout moment depuis votre
          profil. Vos données sont protégées conformément au RGPD.
        </p>
      </DialogContent>
    </Dialog>
  );
}
