"use server";

import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coachProfileSchema, type CoachProfileInput } from "@/validations/coach.schema";
import type { ActionResult } from "@/types";
import type { Coach } from "@prisma/client";

/**
 * Récupérer le profil coach de l'utilisateur connecté
 */
export async function getCoachProfileAction(): Promise<ActionResult<Coach>> {
  try {
    const user = await requireDbUser();

    const coach = await prisma.coach.findUnique({
      where: { userId: user.id },
    });

    if (!coach) {
      return { data: null, error: "Profil coach non trouvé" };
    }

    return { data: coach, error: null };
  } catch (error) {
    console.error("[GET_COACH_PROFILE_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération du profil" };
  }
}

/**
 * Mettre à jour le profil coach
 */
export async function updateCoachProfileAction(
  data: CoachProfileInput
): Promise<ActionResult<Coach>> {
  try {
    const user = await requireDbUser();

    // Vérifier que l'utilisateur est coach
    if (user.role !== "COACH" && user.role !== "ADMIN") {
      return { data: null, error: "Accès non autorisé" };
    }

    // Valider les données
    const validated = coachProfileSchema.parse(data);

    // Vérifier que le coach existe
    const existingCoach = await prisma.coach.findUnique({
      where: { userId: user.id },
    });

    if (!existingCoach) {
      return { data: null, error: "Profil coach non trouvé" };
    }

    // Mettre à jour le profil
    const updatedCoach = await prisma.coach.update({
      where: { userId: user.id },
      data: {
        bio: validated.bio,
        headline: validated.headline,
        specialties: validated.specialties,
        languages: validated.languages,
        methodologies: validated.methodologies,
        interventionModes: validated.interventionModes,
        targetAudience: validated.targetAudience,
        acceptsCorporate: validated.acceptsCorporate,
        hourlyRate: validated.hourlyRate,
        dailyRate: validated.dailyRate,
        city: validated.city,
        country: validated.country,
        timezone: validated.timezone,
        offersInPerson: validated.offersInPerson,
        offersRemote: validated.offersRemote,
        // Informations légales (pour facturation)
        legalName: validated.legalName,
        siret: validated.siret || null,
        businessAddress: validated.businessAddress,
        vatExempt: validated.vatExempt,
      },
    });

    return { data: updatedCoach, error: null };
  } catch (error) {
    console.error("[UPDATE_COACH_PROFILE_ERROR]", error);
    return { data: null, error: "Erreur lors de la mise à jour du profil" };
  }
}

/**
 * Mettre à jour l'avatar du coach
 * Note: Pour la Phase 2, on stocke juste l'URL.
 * L'upload vers Cloudinary/S3 sera implémenté séparément.
 */
export async function updateCoachAvatarAction(
  avatarUrl: string
): Promise<ActionResult<{ avatarUrl: string }>> {
  try {
    const user = await requireDbUser();

    if (user.role !== "COACH" && user.role !== "ADMIN") {
      return { data: null, error: "Accès non autorisé" };
    }

    // Validation basique de l'URL
    if (!avatarUrl.startsWith("http")) {
      return { data: null, error: "URL invalide" };
    }

    await prisma.coach.update({
      where: { userId: user.id },
      data: { avatarUrl },
    });

    return { data: { avatarUrl }, error: null };
  } catch (error) {
    console.error("[UPDATE_COACH_AVATAR_ERROR]", error);
    return { data: null, error: "Erreur lors de la mise à jour de l'avatar" };
  }
}

/**
 * Mettre à jour la vidéo de présentation
 */
export async function updateCoachVideoAction(
  videoUrl: string | null
): Promise<ActionResult<{ videoUrl: string | null }>> {
  try {
    const user = await requireDbUser();

    if (user.role !== "COACH" && user.role !== "ADMIN") {
      return { data: null, error: "Accès non autorisé" };
    }

    // Si videoUrl fournie, valider qu'elle est bien d'un service accepté
    if (videoUrl) {
      const isValidVideo =
        videoUrl.includes("youtube.com") ||
        videoUrl.includes("youtu.be") ||
        videoUrl.includes("vimeo.com") ||
        videoUrl.includes("loom.com");

      if (!isValidVideo) {
        return {
          data: null,
          error: "Seules les vidéos YouTube, Vimeo ou Loom sont acceptées",
        };
      }
    }

    await prisma.coach.update({
      where: { userId: user.id },
      data: { videoUrl },
    });

    return { data: { videoUrl }, error: null };
  } catch (error) {
    console.error("[UPDATE_COACH_VIDEO_ERROR]", error);
    return { data: null, error: "Erreur lors de la mise à jour de la vidéo" };
  }
}

/**
 * Créer un profil coach pour un utilisateur (promotion USER -> COACH)
 * Utilisé par les admins ou lors du processus de vérification
 */
export async function createCoachProfileAction(
  userId: string,
  initialData?: Partial<CoachProfileInput>
): Promise<ActionResult<Coach>> {
  try {
    const currentUser = await requireDbUser();

    // Seul un admin peut créer un profil coach pour quelqu'un d'autre
    // ou l'utilisateur lui-même (auto-inscription coach)
    const isAdmin = currentUser.role === "ADMIN";
    const isSelf = currentUser.id === userId;

    if (!isAdmin && !isSelf) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Vérifier si le coach existe déjà
    const existingCoach = await prisma.coach.findUnique({
      where: { userId },
    });

    if (existingCoach) {
      return { data: null, error: "Ce profil coach existe déjà" };
    }

    // Créer le profil coach et mettre à jour le rôle
    const [coach] = await prisma.$transaction([
      prisma.coach.create({
        data: {
          userId,
          bio: initialData?.bio ?? null,
          headline: initialData?.headline ?? null,
          specialties: initialData?.specialties ?? [],
          languages: initialData?.languages ?? ["fr"],
          methodologies: initialData?.methodologies ?? [],
          interventionModes: initialData?.interventionModes ?? ["INDIVIDUAL"],
          targetAudience: initialData?.targetAudience ?? ["INDIVIDUAL"],
          acceptsCorporate: initialData?.acceptsCorporate ?? false,
          hourlyRate: initialData?.hourlyRate ?? null,
          dailyRate: initialData?.dailyRate ?? null,
          city: initialData?.city ?? null,
          country: initialData?.country ?? "FR",
          timezone: initialData?.timezone ?? "Europe/Paris",
          offersInPerson: initialData?.offersInPerson ?? true,
          offersRemote: initialData?.offersRemote ?? true,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: "COACH" },
      }),
    ]);

    return { data: coach, error: null };
  } catch (error) {
    console.error("[CREATE_COACH_PROFILE_ERROR]", error);
    return { data: null, error: "Erreur lors de la création du profil coach" };
  }
}
