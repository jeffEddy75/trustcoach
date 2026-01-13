import { z } from "zod";

// Mode de booking
export const bookingModeSchema = z.enum(["REMOTE", "IN_PERSON"]);

// Schéma pour créer une réservation
export const createBookingSchema = z.object({
  coachId: z.string().min(1, "L'ID du coach est requis"),
  scheduledAt: z.date({ message: "La date est requise" }),
  duration: z.number().int().min(30).max(240).default(60), // 30min à 4h
  mode: bookingModeSchema.default("REMOTE"),
  location: z.string().optional().nullable(), // Adresse si présentiel
});

// Schéma pour annuler une réservation
export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, "L'ID de la réservation est requis"),
  reason: z.string().optional(),
});

// Types exportés
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
