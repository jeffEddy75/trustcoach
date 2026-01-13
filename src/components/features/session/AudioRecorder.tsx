"use client";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Mic,
  Square,
  Pause,
  Play,
  Star,
  AlertCircle,
  Upload,
  Loader2,
} from "lucide-react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, markedMoments: { timestamp: number; note?: string }[]) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  onRecordingComplete,
  isUploading = false,
  disabled = false,
}: AudioRecorderProps) {
  const {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    markMoment,
    resetRecording,
  } = useAudioRecorder();

  const handleStop = async () => {
    const blob = await stopRecording();
    if (blob) {
      onRecordingComplete(blob, state.markedMoments);
    }
  };

  // Si erreur de permission
  if (state.error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{state.error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={resetRecording}
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Si enregistrement terminé avec un blob
  if (state.audioBlob && !state.isRecording) {
    return (
      <Card className="border-green-500">
        <CardContent className="py-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Enregistrement terminé</p>
              <p className="text-sm text-muted-foreground">
                Durée: {formatDuration(state.duration)}
                {state.markedMoments.length > 0 && (
                  <> • {state.markedMoments.length} moment(s) marqué(s)</>
                )}
              </p>
            </div>
            {isUploading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement en cours...
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={resetRecording}>
                Recommencer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // État initial ou en cours d'enregistrement
  return (
    <Card className={cn(state.isRecording && "border-red-500")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Enregistrement audio</span>
          {state.isRecording && (
            <Badge variant={state.isPaused ? "outline" : "destructive"} className="animate-pulse">
              {state.isPaused ? "En pause" : "En cours"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer */}
        <div className="text-center">
          <p className="text-4xl font-mono font-bold">
            {formatDuration(state.duration)}
          </p>
          {state.isRecording && !state.isPaused && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Enregistrement en cours...
              </span>
            </div>
          )}
        </div>

        {/* Moments marqués */}
        {state.markedMoments.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {state.markedMoments.map((moment, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1 fill-accent text-accent" />
                {formatDuration(moment.timestamp)}
              </Badge>
            ))}
          </div>
        )}

        {/* Contrôles */}
        <div className="flex items-center justify-center gap-4">
          {!state.isRecording ? (
            // Bouton démarrer
            <Button
              size="lg"
              onClick={startRecording}
              disabled={disabled || isUploading}
              className="h-16 w-16 rounded-full"
            >
              <Mic className="h-6 w-6" />
            </Button>
          ) : (
            <>
              {/* Pause/Resume */}
              <Button
                variant="outline"
                size="lg"
                onClick={state.isPaused ? resumeRecording : pauseRecording}
                className="h-12 w-12 rounded-full"
              >
                {state.isPaused ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
              </Button>

              {/* Marquer un moment */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => markMoment()}
                className="h-12 w-12 rounded-full"
                title="Marquer ce moment"
              >
                <Star className="h-5 w-5" />
              </Button>

              {/* Stop */}
              <Button
                variant="destructive"
                size="lg"
                onClick={handleStop}
                className="h-16 w-16 rounded-full"
              >
                <Square className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        {!state.isRecording && (
          <p className="text-xs text-center text-muted-foreground">
            Appuyez sur le bouton pour démarrer l&apos;enregistrement.
            <br />
            Assurez-vous d&apos;avoir le consentement de toutes les personnes présentes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
