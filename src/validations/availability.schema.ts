import { z } from "zod";

// Schéma pour un créneau de disponibilité
export const availabilitySlotSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6), // 0 = Dimanche, 6 = Samedi
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm attendu"),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm attendu"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ["endTime"],
  });

// Schéma pour ajouter une disponibilité
export const addAvailabilitySchema = availabilitySlotSchema;

// Schéma pour supprimer une disponibilité
export const deleteAvailabilitySchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
});

// Schéma pour la mise à jour en lot des disponibilités
export const updateAvailabilitiesSchema = z.object({
  availabilities: z.array(availabilitySlotSchema),
});

// Types exportés
export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>;
export type AddAvailabilityInput = z.infer<typeof addAvailabilitySchema>;
export type DeleteAvailabilityInput = z.infer<typeof deleteAvailabilitySchema>;
export type UpdateAvailabilitiesInput = z.infer<typeof updateAvailabilitiesSchema>;
