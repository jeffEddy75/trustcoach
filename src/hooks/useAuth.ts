"use client";

/**
 * @deprecated Utiliser useCurrentUser à la place pour les données Prisma
 * Ce hook est conservé pour la compatibilité avec les composants existants
 * mais redirige vers useCurrentUser.
 */

import { useCurrentUser } from "./useCurrentUser";
import type { Role } from "@prisma/client";

export function useAuth() {
  const {
    user,
    isLoading,
    isSignedIn,
    isAuthenticated,
    isCoach,
    isAdmin,
    isUser: isUserRole,
    clerkUser,
  } = useCurrentUser();

  // Compatibilité avec l'ancien format
  const hasRole = (role: Role) => user?.role === role || user?.role === "ADMIN";

  return {
    // Format compatible avec l'ancien useAuth
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || clerkUser?.imageUrl,
      role: user.role,
    } : null,
    isLoading,
    isAuthenticated: isAuthenticated,
    isAdmin,
    isCoach,
    isUser: isUserRole,
    hasRole,
    // Nouveaux champs Clerk
    isSignedIn,
    clerkUser,
  };
}
