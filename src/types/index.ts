/**
 * Types centralisés pour TrustCoach IA
 * @module types
 */

// ============================================
// ACTION RESULT (Pattern obligatoire)
// ============================================

/**
 * Type de retour standard pour les Server Actions
 * @template T - Type des données retournées en cas de succès
 */
export type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

// ============================================
// AUTH TYPES
// ============================================

export type UserRole = "USER" | "COACH" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
}

// ============================================
// COMMON TYPES
// ============================================

/**
 * States possibles pour un composant UI
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Props communes pour les composants avec états
 */
export interface StatefulComponentProps {
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
}

// ============================================
// RE-EXPORTS (seront ajoutés au fur et à mesure)
// ============================================

// export * from './auth.types';
// export * from './coach.types';
// export * from './booking.types';
// export * from './session.types';
