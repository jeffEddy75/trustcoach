"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/actions/auth.actions";
import type { Role } from "@prisma/client";

/**
 * Hook client pour récupérer le user Prisma actuel.
 */
export function useCurrentUser() {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUserAction(),
    enabled: isLoaded && isSignedIn,
  });

  const user = query.data;
  const isCoach = user?.role === "COACH" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  const hasRole = (role: Role) => user?.role === role || user?.role === "ADMIN";

  return {
    // User Prisma (avec coach inclus)
    user,
    // États
    isLoading: !isLoaded || (isSignedIn && query.isLoading),
    isSignedIn: isSignedIn ?? false,
    isAuthenticated: isSignedIn && !!user,
    // Rôles
    isCoach,
    isAdmin,
    isUser: user?.role === "USER",
    hasRole,
    // Clerk user (pour avatar, etc.)
    clerkUser,
    // Query status (sans isLoading car défini au-dessus)
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
