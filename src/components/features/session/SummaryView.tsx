"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { validateSummaryAction } from "@/actions/session.actions";
import type { Session, MarkedMoment } from "@prisma/client";
import {
  FileText,
  Edit,
  Check,
  X,
  Loader2,
  Star,
  Download,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface SummaryViewProps {
  session: Session;
  isCoach: boolean;
  markedMoments: MarkedMoment[];
}

export function SummaryView({ session, isCoach, markedMoments }: SummaryViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(
    session.summaryFinal || session.summaryRaw || ""
  );

  const displaySummary = session.summaryFinal || session.summaryRaw || "";

  const handleSave = () => {
    startTransition(async () => {
      const result = await validateSummaryAction(session.id, editedSummary);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Résumé validé et sauvegardé");
      setIsEditing(false);
      router.refresh();
    });
  };

  const handleCancel = () => {
    setEditedSummary(session.summaryFinal || session.summaryRaw || "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Résumé principal */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Résumé de la séance</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {session.summaryFinal && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Check className="h-3 w-3 mr-1" />
                  Validé par le coach
                </Badge>
              )}
              {isCoach && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Résumé généré automatiquement par l&apos;intelligence artificielle
            {session.summarizedAt && (
              <> le {new Date(session.summarizedAt).toLocaleDateString("fr-FR")}</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Valider le résumé
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{displaySummary}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onglets pour transcription et détails */}
      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transcript">Transcription</TabsTrigger>
          <TabsTrigger value="moments">
            Moments marqués ({markedMoments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transcription complète</CardTitle>
              <CardDescription>
                Transcription automatique de l&apos;enregistrement audio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.transcript ? (
                <div className="max-h-96 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {session.transcript}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune transcription disponible
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                Moments importants
              </CardTitle>
              <CardDescription>
                Les moments que vous avez marqués pendant la séance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {markedMoments.length > 0 ? (
                <div className="space-y-3">
                  {markedMoments.map((moment, i) => (
                    <div
                      key={moment.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Badge variant="outline" className="font-mono shrink-0">
                        {Math.floor(moment.timestamp / 60)}:
                        {(moment.timestamp % 60).toString().padStart(2, "0")}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {moment.note || `Moment ${i + 1}`}
                        </p>
                        {moment.excerpt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            &quot;{moment.excerpt}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun moment marqué pendant cette séance
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
