"use server";

import { getCurrentDbUser } from "@/lib/auth";
import type { UserWithCoach } from "@/lib/auth";

/**
 * Server Action pour récupérer le user Prisma actuel.
 * Utilisé par le hook useCurrentUser côté client.
 */
export async function getCurrentUserAction(): Promise<UserWithCoach | null> {
  return await getCurrentDbUser();
}

/*
 * ============================================
 * ANCIENNES ACTIONS NEXTAUTH (DÉSACTIVÉES)
 * ============================================
 * Clerk gère l'authentification directement via ses composants.
 * Ces actions ne sont plus nécessaires.
 *
 * - loginAction → Remplacé par <SignIn /> de Clerk
 * - registerAction → Remplacé par <SignUp /> de Clerk
 * - logoutAction → Remplacé par <SignOutButton /> de Clerk
 * - loginWithGoogleAction → Géré automatiquement par Clerk
 */
