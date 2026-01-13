import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadAudio } from "@/services/storage";
import { processSessionAudio } from "@/services/ai";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max pour le traitement

/**
 * POST /api/sessions/process
 *
 * Upload l'audio, transcrit et génère le résumé
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les données du formulaire
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const sessionId = formData.get("sessionId") as string;
    const markedMomentsJson = formData.get("markedMoments") as string;

    if (!audioFile || !sessionId) {
      return NextResponse.json(
        { error: "Audio et sessionId requis" },
        { status: 400 }
      );
    }

    // Vérifier que la session existe et appartient à l'utilisateur
    const dbSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { booking: { include: { coach: true } } },
    });

    if (!dbSession) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 }
      );
    }

    const isOwner = dbSession.booking.userId === session.user.id;
    const isCoach = dbSession.booking.coach.userId === session.user.id;

    if (!isOwner && !isCoach) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Parser les moments marqués
    let markedMoments: { timestamp: number; note?: string }[] = [];
    if (markedMomentsJson) {
      try {
        markedMoments = JSON.parse(markedMomentsJson);
      } catch {
        // Ignorer si invalide
      }
    }

    // 1. Mettre à jour le statut
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "UPLOADING" },
    });

    // 2. Convertir le fichier en Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload vers Cloudinary
    console.log("[PROCESS] Uploading audio...");
    let audioResult;
    try {
      audioResult = await uploadAudio(buffer, audioFile.name, sessionId);
    } catch (uploadError) {
      console.error("[PROCESS] Upload failed:", uploadError);
      await prisma.session.update({
        where: { id: sessionId },
        data: { status: "UPLOAD_FAILED", statusMessage: "Échec de l'upload" },
      });
      return NextResponse.json(
        { error: "Échec de l'upload de l'audio" },
        { status: 500 }
      );
    }

    // 4. Sauvegarder les infos audio
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        audioUrl: audioResult.url,
        audioSize: audioResult.size,
        audioDuration: audioResult.duration ? Math.round(audioResult.duration) : null,
        audioFormat: audioResult.format,
        status: "TRANSCRIBING",
      },
    });

    // 5. Sauvegarder les moments marqués
    if (markedMoments.length > 0) {
      await prisma.markedMoment.createMany({
        data: markedMoments.map((m) => ({
          sessionId,
          timestamp: m.timestamp,
          note: m.note,
          type: "IMPORTANT" as const,
        })),
      });
    }

    // 6. Transcription + Résumé
    console.log("[PROCESS] Processing audio with AI...");
    let aiResult;
    try {
      aiResult = await processSessionAudio(
        buffer,
        audioFile.name,
        markedMoments.map((m) => m.note || `Moment à ${m.timestamp}s`)
      );
    } catch (aiError) {
      console.error("[PROCESS] AI processing failed:", aiError);
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: "TRANSCRIBE_FAILED",
          statusMessage: "Échec du traitement IA",
        },
      });
      return NextResponse.json(
        { error: "Échec du traitement IA" },
        { status: 500 }
      );
    }

    // 7. Sauvegarder les résultats
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        transcript: aiResult.transcript,
        transcribedAt: new Date(),
        summaryRaw: aiResult.summary,
        summarizedAt: new Date(),
        status: "COMPLETED",
      },
    });

    // 8. Mettre à jour la réservation
    await prisma.booking.update({
      where: { id: dbSession.bookingId },
      data: { status: "COMPLETED" },
    });

    console.log("[PROCESS] Session processing complete:", sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      transcript: aiResult.transcript,
      summary: aiResult.summary,
    });
  } catch (error) {
    console.error("[PROCESS_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement" },
      { status: 500 }
    );
  }
}
