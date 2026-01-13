import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User, Coach } from "@prisma/client";

export type UserWithCoach = User & { coach: Coach | null };

/**
 * Récupère le user Prisma lié à l'utilisateur Clerk connecté.
 * Crée automatiquement le user Prisma si c'est la première connexion.
 */
export async function getCurrentDbUser(): Promise<UserWithCoach | null> {
  let clerkUserId: string | null = null;

  try {
    const authResult = await auth();
    clerkUserId = authResult.userId;
  } catch (error) {
    console.error("[AUTH] Error calling Clerk auth():", error);
    return null;
  }

  if (!clerkUserId) return null;

  // Chercher le user existant par clerkUserId
  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: { coach: true },
  });

  // Si pas trouvé, créer automatiquement
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
    const image = clerkUser.imageUrl;

    // Vérifier si un user existe déjà avec cet email (migration)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
      include: { coach: true },
    });

    if (existingUserByEmail) {
      // Lier le compte Clerk à l'utilisateur existant
      user = await prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: { clerkUserId, image: image || existingUserByEmail.image },
        include: { coach: true },
      });
      console.log(
        `[AUTH] Linked existing user ${existingUserByEmail.email} to Clerk ID ${clerkUserId}`
      );
    } else {
      // Créer un nouveau user
      user = await prisma.user.create({
        data: {
          clerkUserId,
          email,
          name: name || "Utilisateur",
          image,
          role: "USER",
        },
        include: { coach: true },
      });
      console.log(`[AUTH] Created new user ${email} with Clerk ID ${clerkUserId}`);
    }
  }

  return user;
}

/**
 * Récupère le user Prisma ou throw une erreur si non connecté.
 */
export async function requireDbUser(): Promise<UserWithCoach> {
  const user = await getCurrentDbUser();
  if (!user) {
    throw new Error("Non authentifié");
  }
  return user;
}

/**
 * Récupère le user Prisma + son profil coach, ou throw si pas coach.
 */
export async function requireCoach(): Promise<{
  user: UserWithCoach;
  coach: Coach;
}> {
  const user = await getCurrentDbUser();
  if (!user) {
    throw new Error("Non authentifié");
  }
  if (!user.coach) {
    throw new Error("Accès coach requis");
  }
  return { user, coach: user.coach };
}

/**
 * Récupère juste le clerkUserId (pour les cas simples).
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Récupère les infos Clerk de l'utilisateur (pour l'avatar, etc.).
 */
export async function getClerkUser() {
  return await currentUser();
}
