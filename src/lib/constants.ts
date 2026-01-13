/**
 * Constantes globales de l'application TrustCoach
 * @module lib/constants
 */

// ============================================
// APP INFO
// ============================================

export const APP_NAME = "TrustCoach";
export const APP_DESCRIPTION =
  "Le tiers de confiance du coaching augmenté";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================
// AUTH
// ============================================

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  LOGOUT: "/logout",
} as const;

export const PROTECTED_ROUTES = ["/dashboard", "/user", "/coach"] as const;

// ============================================
// COACH SPECIALTIES
// ============================================

export const COACH_SPECIALTIES = [
  "Gestion du stress",
  "Confiance en soi",
  "Équilibre vie pro/perso",
  "Leadership",
  "Management",
  "Prise de parole",
  "Gestion du changement",
  "Développement personnel",
  "Orientation professionnelle",
  "Gestion des conflits",
] as const;

export type CoachSpecialty = (typeof COACH_SPECIALTIES)[number];

// ============================================
// COACH METHODOLOGIES (B2B)
// ============================================

export const COACH_METHODOLOGIES = [
  "MBTI",
  "Process Com",
  "Ennéagramme",
  "360° Feedback",
  "PNL",
  "Pleine conscience",
  "Approche systémique",
  "Coaching cognitif",
] as const;

export type CoachMethodology = (typeof COACH_METHODOLOGIES)[number];

// ============================================
// BOOKING
// ============================================

export const BOOKING_MODES = ["REMOTE", "IN_PERSON"] as const;
export type BookingMode = (typeof BOOKING_MODES)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const DEFAULT_SESSION_DURATION = 60; // minutes

// ============================================
// AUDIO RECORDING
// ============================================

export const AUDIO_FORMATS = ["webm", "mp3", "m4a"] as const;
export type AudioFormat = (typeof AUDIO_FORMATS)[number];

export const AUDIO_MAX_SIZE = 500 * 1024 * 1024; // 500 MB
export const AUDIO_RETENTION_DAYS = 30;

// ============================================
// SESSION SUMMARY
// ============================================

export const SESSION_STATUSES = [
  "IDLE",
  "RECORDING",
  "UPLOADING",
  "UPLOAD_FAILED",
  "TRANSCRIBING",
  "TRANSCRIBE_FAILED",
  "SUMMARIZING",
  "SUMMARIZE_FAILED",
  "COMPLETED",
  "FAILED",
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

// ============================================
// BADGE LEVELS
// ============================================

export const BADGE_LEVELS = {
  STANDARD: {
    label: "Standard",
    description: "Email vérifié",
  },
  VERIFIED: {
    label: "Vérifié",
    description: "Diplômes vérifiés manuellement",
  },
  PREMIUM: {
    label: "Premium",
    description: "Vérifié + entretien vidéo",
  },
} as const;

// ============================================
// PAGINATION
// ============================================

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// ============================================
// CURRENCY
// ============================================

export const DEFAULT_CURRENCY = "EUR";
export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

// ============================================
// DESIGN SYSTEM VALUES
// ============================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;
