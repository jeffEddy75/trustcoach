import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// ============================================
// CLIENTS IA
// ============================================

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// TRANSCRIPTION (Whisper)
// ============================================

/**
 * Transcrit un fichier audio en texte via OpenAI Whisper
 */
export async function transcribeAudio(audioFile: File | Buffer, filename?: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined");
  }

  // Convertir Buffer en File si nécessaire
  let file: File;
  if (Buffer.isBuffer(audioFile)) {
    const uint8Array = new Uint8Array(audioFile);
    const blob = new Blob([uint8Array], { type: "audio/webm" });
    file = new File([blob], filename || "audio.webm", { type: "audio/webm" });
  } else {
    file = audioFile;
  }

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "fr",
    response_format: "text",
  });

  return transcription;
}

// ============================================
// RÉSUMÉ IA (Gemini)
// ============================================

const SUMMARY_PROMPT = `Tu es un assistant de coaching bienveillant et professionnel.

Voici la transcription d'une séance de coaching. Génère un résumé structuré et utile pour le coaché.

RÈGLES IMPORTANTES:
- Sois concis mais complet
- Utilise un ton bienveillant et encourageant
- Préserve la confidentialité (pas de noms tiers)
- Formate en Markdown

STRUCTURE DU RÉSUMÉ:

## Points clés
[3-5 points essentiels abordés durant la séance]

## Prises de conscience
[Moments de clarté, déclics, nouvelles perspectives du coaché]

## Actions à faire
[Liste concrète des engagements et prochaines étapes]

## Objectif pour la prochaine séance
[Ce sur quoi travailler en priorité]

---

TRANSCRIPTION:
`;

/**
 * Génère un résumé structuré d'une transcription de séance via Gemini
 */
export async function generateSummary(transcript: string, markedMoments?: string[]): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not defined");
  }

  let prompt = SUMMARY_PROMPT + transcript;

  // Ajouter les moments marqués si disponibles
  if (markedMoments && markedMoments.length > 0) {
    prompt += `\n\n---\n\nMOMENTS MARQUÉS PAR L'UTILISATEUR:\n${markedMoments.map((m, i) => `${i + 1}. ${m}`).join("\n")}`;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error("No text content in Gemini response");
  }

  return text;
}

// ============================================
// PIPELINE COMPLET
// ============================================

export interface SessionProcessingResult {
  transcript: string;
  summary: string;
}

/**
 * Pipeline complet : transcription + résumé
 */
export async function processSessionAudio(
  audioFile: File | Buffer,
  filename?: string,
  markedMoments?: string[]
): Promise<SessionProcessingResult> {
  // 1. Transcription
  console.log("[AI] Starting transcription...");
  const transcript = await transcribeAudio(audioFile, filename);
  console.log("[AI] Transcription complete:", transcript.substring(0, 100) + "...");

  // 2. Résumé
  console.log("[AI] Generating summary...");
  const summary = await generateSummary(transcript, markedMoments);
  console.log("[AI] Summary generated");

  return { transcript, summary };
}
