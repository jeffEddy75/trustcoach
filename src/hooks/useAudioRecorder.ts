"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface MarkedMoment {
  timestamp: number; // Secondes depuis le début
  note?: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  markedMoments: MarkedMoment[];
}

export interface UseAudioRecorderReturn {
  state: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  markMoment: (note?: string) => void;
  resetRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    error: null,
    markedMoments: [],
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Nettoyer à la destruction
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Demander les permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Déterminer le meilleur format supporté
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ""; // Laisser le navigateur choisir
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("[RECORDER_ERROR]", event);
        setState((prev) => ({
          ...prev,
          error: "Erreur lors de l'enregistrement",
          isRecording: false,
        }));
      };

      // Démarrer l'enregistrement
      mediaRecorder.start(1000); // Chunk toutes les secondes
      startTimeRef.current = Date.now();

      // Timer pour la durée
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }));
      }, 1000);

      setState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        error: null,
        markedMoments: [],
      });
    } catch (err) {
      console.error("[PERMISSION_ERROR]", err);
      let errorMessage = "Impossible d'accéder au microphone";

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          errorMessage = "Permission du microphone refusée. Veuillez l'autoriser dans les paramètres.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "Aucun microphone détecté.";
        }
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        // Arrêter le timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Arrêter le stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Créer le blob
        const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob,
        }));

        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();

      // Reprendre le timer
      const pausedDuration = state.duration;
      const resumeTime = Date.now();

      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: pausedDuration + Math.floor((Date.now() - resumeTime) / 1000),
        }));
      }, 1000);

      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [state.duration]);

  const markMoment = useCallback((note?: string) => {
    if (!state.isRecording) return;

    setState((prev) => ({
      ...prev,
      markedMoments: [
        ...prev.markedMoments,
        {
          timestamp: prev.duration,
          note,
        },
      ],
    }));
  }, [state.isRecording]);

  const resetRecording = useCallback(() => {
    // Arrêter tout si en cours
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    chunksRef.current = [];

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      error: null,
      markedMoments: [],
    });
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    markMoment,
    resetRecording,
  };
}
