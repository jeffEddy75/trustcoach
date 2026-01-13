"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const isAdmin = user?.role === "ADMIN";
  const isCoach = user?.role === "COACH" || isAdmin;
  const isUser = user?.role === "USER";

  const hasRole = (role: Role) => user?.role === role || user?.role === "ADMIN";

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isCoach,
    isUser,
    hasRole,
  };
}
