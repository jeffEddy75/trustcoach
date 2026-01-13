import { z } from "zod";

// Schéma pour l'édition du profil utilisateur
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
});

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z
      .string()
      .min(1, "Confirmez votre nouveau mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Types exportés
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
