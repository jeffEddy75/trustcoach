/**
 * DÉSACTIVÉ - Migration vers Clerk
 *
 * Le ClerkProvider est maintenant utilisé dans app/layout.tsx.
 * Ce fichier est conservé pour référence uniquement.
 */

/*
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
*/

// Export vide pour éviter les erreurs d'import
export {};
