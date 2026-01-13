import { z } from "zod";

// Enums from Prisma
export const interventionModeSchema = z.enum([
  "INDIVIDUAL",
  "TEAM",
  "ORGANIZATION",
  "GROUP",
]);

export const targetAudienceSchema = z.enum([
  "INDIVIDUAL",
  "EXECUTIVE",
  "MANAGER",
  "EMPLOYEE",
  "ENTREPRENEUR",
]);

// Schéma pour l'édition du profil coach
export const coachProfileSchema = z.object({
  // Profil public
  bio: z
    .string()
    .max(2000, "La bio ne doit pas dépasser 2000 caractères")
    .optional()
    .nullable(),
  headline: z
    .string()
    .max(100, "Le titre ne doit pas dépasser 100 caractères")
    .optional()
    .nullable(),
  specialties: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 spécialités")
    .default([]),
  languages: z
    .array(z.string().min(2).max(5))
    .max(10, "Maximum 10 langues")
    .default(["fr"]),

  // Attributs B2B
  methodologies: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 méthodologies")
    .default([]),
  interventionModes: z
    .array(interventionModeSchema)
    .default(["INDIVIDUAL"]),
  targetAudience: z
    .array(targetAudienceSchema)
    .default(["INDIVIDUAL"]),
  acceptsCorporate: z.boolean().default(false),

  // Tarification
  hourlyRate: z
    .number()
    .int()
    .min(0, "Le tarif doit être positif")
    .max(100000, "Le tarif semble trop élevé") // Max 1000€/h
    .optional()
    .nullable(),
  dailyRate: z
    .number()
    .int()
    .min(0, "Le tarif journalier doit être positif")
    .max(500000, "Le tarif semble trop élevé") // Max 5000€/j
    .optional()
    .nullable(),

  // Localisation
  city: z
    .string()
    .max(100, "La ville ne doit pas dépasser 100 caractères")
    .optional()
    .nullable(),
  country: z
    .string()
    .length(2, "Le code pays doit être de 2 caractères (ex: FR)")
    .default("FR"),
  timezone: z.string().default("Europe/Paris"),

  // Modes de coaching
  offersInPerson: z.boolean().default(true),
  offersRemote: z.boolean().default(true),
});

// Schéma pour l'upload d'avatar
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "L'image ne doit pas dépasser 5 Mo",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      {
        message: "Format accepté : JPG, PNG ou WebP",
      }
    ),
});

// Schéma pour la vidéo de présentation
export const videoUrlSchema = z.object({
  videoUrl: z
    .string()
    .url("URL invalide")
    .refine(
      (url) =>
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("vimeo.com") ||
        url.includes("loom.com"),
      {
        message: "Seules les vidéos YouTube, Vimeo ou Loom sont acceptées",
      }
    )
    .optional()
    .nullable(),
});

// Schéma pour les disponibilités
export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Dimanche
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm attendu"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm attendu"),
});

export const availabilitiesSchema = z
  .array(availabilitySchema)
  .refine(
    (slots) => {
      // Vérifier que endTime > startTime pour chaque slot
      return slots.every((slot) => slot.endTime > slot.startTime);
    },
    {
      message: "L'heure de fin doit être après l'heure de début",
    }
  );

// Schéma pour les certifications
export const certificationSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(200, "Le nom ne doit pas dépasser 200 caractères"),
  issuer: z
    .string()
    .min(1, "L'organisme est requis")
    .max(200, "L'organisme ne doit pas dépasser 200 caractères"),
  year: z
    .number()
    .int()
    .min(1970)
    .max(new Date().getFullYear())
    .optional()
    .nullable(),
  expiresAt: z.date().optional().nullable(),
  documentUrl: z.string().url().optional().nullable(),
});

// Schéma pour les références entreprise
export const coachReferenceSchema = z.object({
  companyName: z
    .string()
    .min(1, "Le nom de l'entreprise est requis")
    .max(200, "Le nom ne doit pas dépasser 200 caractères"),
  sector: z
    .string()
    .max(100, "Le secteur ne doit pas dépasser 100 caractères")
    .optional()
    .nullable(),
  missionType: z
    .string()
    .max(200, "Le type de mission ne doit pas dépasser 200 caractères")
    .optional()
    .nullable(),
  year: z
    .number()
    .int()
    .min(1970)
    .max(new Date().getFullYear())
    .optional()
    .nullable(),
  testimonial: z
    .string()
    .max(1000, "Le témoignage ne doit pas dépasser 1000 caractères")
    .optional()
    .nullable(),
  contactName: z
    .string()
    .max(100, "Le nom du contact ne doit pas dépasser 100 caractères")
    .optional()
    .nullable(),
  canDisplay: z.boolean().default(true),
});

// Types exportés
export type CoachProfileInput = z.infer<typeof coachProfileSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
export type VideoUrlInput = z.infer<typeof videoUrlSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type CoachReferenceInput = z.infer<typeof coachReferenceSchema>;
